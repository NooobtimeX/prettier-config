/**
 * Dynamically loads `prettier/standalone` plus every parser plugin for an
 * arbitrary Prettier version from jsDelivr, and exposes:
 *   - `format()` — version-bound formatter that switches plugins per parser.
 *   - `supportInfo` — the result of `getSupportInfo({ plugins })` so the UI
 *     can build its form from the version's actual option schema, including
 *     language-specific options registered by parser plugins.
 *
 * Modules are cached per version so toggling the picker back and forth doesn't
 * re-download.
 */

import type { ParserId } from './parsers';
import { DEFAULT_PARSER } from './parsers';

export type PrettierChoice = {
	value: unknown;
	description?: string;
	since?: string;
};

export type PrettierSupportOption = {
	name: string;
	type: string;
	category?: string;
	default?: unknown;
	description?: string;
	since?: string;
	choices?: PrettierChoice[];
	array?: boolean;
	range?: { start: number; end: number; step: number };
};

export type PrettierSupportInfo = {
	options: PrettierSupportOption[];
};

export type FormatResult = {
	code: string;
	error: string | null;
};

export type FormatFn = (
	code: string,
	selectedOptions: Record<string, unknown>,
	parser?: ParserId,
) => Promise<FormatResult>;

export type PluginLoadFailure = { url: string; message: string };

export type LoadedPrettier = {
	version: string;
	/**
	 * Options known as of the first phase — `standalone.mjs` plus the plugins the
	 * default parser needs. This covers the bulk of the form; language-specific
	 * options from the remaining plugins arrive via `whenComplete`.
	 */
	supportInfo: PrettierSupportInfo;
	format: FormatFn;
	/** Third-party plugin URLs that failed to load — surfaced for a toast. */
	pluginFailures: PluginLoadFailure[];
	/**
	 * Resolves once every built-in plugin has loaded in the background and
	 * `getSupportInfo` has been re-run against the full set. Consumers should
	 * re-read options from this to get the complete list.
	 */
	whenComplete: Promise<PrettierSupportInfo>;
};

const cache = new Map<string, Promise<LoadedPrettier>>();

/**
 * Plugins to fetch alongside `standalone.mjs`. The first entry of each
 * `PARSER_PLUGIN_FILES` tuple drives `format()`; the full list goes into
 * `getSupportInfo` so the UI knows about every language-specific option.
 */
const PLUGIN_FILES = [
	'babel.mjs',
	'estree.mjs',
	'typescript.mjs',
	'postcss.mjs',
	'html.mjs',
	'markdown.mjs',
	'yaml.mjs',
	'graphql.mjs',
	'angular.mjs',
	'glimmer.mjs',
	'flow.mjs',
	'acorn.mjs',
	'meriyah.mjs',
] as const;

type PluginFile = (typeof PLUGIN_FILES)[number];

/** Which plugin files each Prettier parser needs at format time. */
const PARSER_PLUGINS: Record<ParserId, readonly PluginFile[]> = {
	babel: ['babel.mjs', 'estree.mjs'],
	typescript: ['typescript.mjs', 'estree.mjs'],
	flow: ['flow.mjs', 'estree.mjs'],
	css: ['postcss.mjs'],
	scss: ['postcss.mjs'],
	less: ['postcss.mjs'],
	html: ['html.mjs'],
	vue: ['html.mjs'],
	angular: ['html.mjs', 'angular.mjs'],
	json: ['babel.mjs', 'estree.mjs'],
	json5: ['babel.mjs', 'estree.mjs'],
	jsonc: ['babel.mjs', 'estree.mjs'],
	markdown: ['markdown.mjs'],
	mdx: ['markdown.mjs'],
	yaml: ['yaml.mjs'],
	graphql: ['graphql.mjs'],
};

/**
 * Native dynamic `import()` wrapped in a `Function` constructor so bundlers
 * (Webpack/Turbopack) don't try to statically resolve the URL.
 */
function importFromUrl(url: string): Promise<Record<string, unknown>> {
	return new Function('u', 'return import(u)')(url) as Promise<Record<string, unknown>>;
}

function unwrapDefault(mod: Record<string, unknown>): unknown {
	return (mod as { default?: unknown }).default ?? mod;
}

function resolveVersionPath(version: string): string {
	// 'latest' → let jsDelivr resolve the latest Prettier 3.x release.
	return version === 'latest' ? '3' : version;
}

/**
 * Extract a one-line, location-aware message from Prettier's thrown errors.
 * Prettier's `SyntaxError` shape is `{ message, loc?: { start: { line, column } } }`.
 */
function formatPrettierError(err: unknown): string {
	if (err instanceof Error) {
		const loc = (err as { loc?: { start?: { line?: number; column?: number } } }).loc;
		const line = loc?.start?.line;
		const col = loc?.start?.column;
		const base = err.message.split('\n')[0];
		if (line != null && col != null && !/\(\d+:\d+\)/.test(base)) {
			return `${base} (${line}:${col})`;
		}
		return base;
	}
	return String(err);
}

/**
 * Stable cache key for a (version, extra-plugins) combo. Sorting the URLs
 * means `[a, b]` and `[b, a]` share a cache entry.
 */
function cacheKey(version: string, extraPluginUrls: readonly string[]): string {
	// Key on the *resolved* path so `latest` and the concrete `3.x` it maps to
	// share one entry instead of downloading and retaining the same build twice.
	const resolved = resolveVersionPath(version);
	if (extraPluginUrls.length === 0) return resolved;
	const sorted = [...extraPluginUrls].sort();
	return `${resolved}::${sorted.join('|')}`;
}

export function loadPrettier(
	version: string,
	extraPluginUrls: readonly string[] = [],
): Promise<LoadedPrettier> {
	const key = cacheKey(version, extraPluginUrls);
	const cached = cache.get(key);
	if (cached) return cached;

	const versionPath = resolveVersionPath(version);
	const base = `https://cdn.jsdelivr.net/npm/prettier@${versionPath}`;

	const pending = (async (): Promise<LoadedPrettier> => {
		// One promise per plugin file, started on first request and shared after.
		// Loading all 13 up front cost ~3.4 MB of JS per version before anything
		// could be formatted, and the browser's module map keys modules by URL for
		// the lifetime of the document — so anything fetched here can never be
		// reclaimed. The only real lever is not fetching it until it's needed.
		const pluginPromises = new Map<PluginFile, Promise<unknown>>();
		const getPlugin = (file: PluginFile): Promise<unknown> => {
			let p = pluginPromises.get(file);
			if (!p) {
				p = importFromUrl(`${base}/plugins/${file}`).then(unwrapDefault);
				pluginPromises.set(file, p);
			}
			return p;
		};

		// Phase 1 — the critical path: the core plus just the default parser's
		// plugins. Everything else is either fetched on demand by `format` or
		// picked up by the background phase below.
		const [standaloneMod] = await Promise.all([
			importFromUrl(`${base}/standalone.mjs`),
			...PARSER_PLUGINS[DEFAULT_PARSER].map(getPlugin),
		]);

		// Third-party plugins are best-effort: a single failed plugin must not
		// take down Prettier itself. `allSettled` lets us collect partial wins.
		const extraResults = await Promise.allSettled(extraPluginUrls.map((url) => importFromUrl(url)));
		const extraPlugins: unknown[] = [];
		const pluginFailures: PluginLoadFailure[] = [];
		extraResults.forEach((res, i) => {
			const url = extraPluginUrls[i];
			if (res.status === 'fulfilled') {
				extraPlugins.push(unwrapDefault(res.value));
			} else {
				pluginFailures.push({
					url,
					message: res.reason instanceof Error ? res.reason.message : String(res.reason),
				});
			}
		});

		const prettier = unwrapDefault(standaloneMod) as {
			format: (code: string, opts: unknown) => Promise<string>;
			getSupportInfo: (opts?: unknown) => unknown;
		};

		/**
		 * Pass every plugin loaded so far (built-in + third-party) to
		 * getSupportInfo so language-specific options (singleQuote, proseWrap, …)
		 * and plugin-contributed options (tailwindConfig, jsdocPreferCodeFences, …)
		 * are all included.
		 */
		const buildSupportInfo = async (): Promise<PrettierSupportInfo> => {
			const loaded = await Promise.all([...pluginPromises.values()]);
			return (await Promise.resolve(
				prettier.getSupportInfo({ plugins: [...loaded, ...extraPlugins] }),
			)) as PrettierSupportInfo;
		};

		const supportInfo = await buildSupportInfo();

		// Phase 2 — pull in the rest in the background so the full option list
		// fills in shortly after the form is already usable. Failures here are
		// non-fatal: `format` re-requests whatever it needs anyway.
		const whenComplete = Promise.all(PLUGIN_FILES.map(getPlugin))
			.then(buildSupportInfo)
			.catch(() => supportInfo);

		const format: FormatFn = async (code, selected, parser = DEFAULT_PARSER) => {
			if (!code.trim()) return { code, error: null };
			const pluginFiles = PARSER_PLUGINS[parser] ?? PARSER_PLUGINS[DEFAULT_PARSER];
			// Awaits exactly this parser's plugins, fetching them if the background
			// phase hasn't reached them yet.
			const builtinForParser = await Promise.all(pluginFiles.map(getPlugin));
			// Third-party plugins are always passed — Prettier ignores ones whose
			// `parsers` don't match the active parser, and some plugins (e.g.
			// tailwindcss) extend the formatter behaviour even when their parsers
			// aren't directly invoked.
			const plugins = [...builtinForParser, ...extraPlugins];
			const filtered: Record<string, unknown> = {};
			for (const [k, v] of Object.entries(selected)) {
				if (k === 'parser' || k === 'plugins') continue;
				if (v === null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
				filtered[k] = v;
			}
			try {
				const out = await prettier.format(code, { ...filtered, parser, plugins });
				return { code: out, error: null };
			} catch (err) {
				return { code, error: formatPrettierError(err) };
			}
		};

		return { version, supportInfo, format, pluginFailures, whenComplete };
	})();

	// Drop failed loads so the next call retries instead of being stuck on the rejection.
	pending.catch(() => cache.delete(key));
	cache.set(key, pending);
	return pending;
}
