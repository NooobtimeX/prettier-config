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

export type LoadedPrettier = {
	version: string;
	supportInfo: PrettierSupportInfo;
	format: FormatFn;
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
	if (extraPluginUrls.length === 0) return version;
	const sorted = [...extraPluginUrls].sort();
	return `${version}::${sorted.join('|')}`;
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
		const [standaloneMod, ...allPluginMods] = await Promise.all([
			importFromUrl(`${base}/standalone.mjs`),
			...PLUGIN_FILES.map((file) => importFromUrl(`${base}/plugins/${file}`)),
			...extraPluginUrls.map((url) => importFromUrl(url)),
		]);

		const prettier = unwrapDefault(standaloneMod) as {
			format: (code: string, opts: unknown) => Promise<string>;
			getSupportInfo: (opts?: unknown) => unknown;
		};

		const allUnwrapped = allPluginMods.map(unwrapDefault);
		const builtinCount = PLUGIN_FILES.length;
		const builtinPlugins = allUnwrapped.slice(0, builtinCount);
		const extraPlugins = allUnwrapped.slice(builtinCount);

		const pluginByFile = new Map<PluginFile, unknown>();
		PLUGIN_FILES.forEach((file, i) => pluginByFile.set(file, builtinPlugins[i]));

		// Pass every plugin (built-in + third-party) to getSupportInfo so
		// language-specific options (singleQuote, proseWrap, …) and
		// plugin-contributed options (tailwindConfig, jsdocPreferCodeFences, …)
		// are all included.
		const supportInfo = (await Promise.resolve(
			prettier.getSupportInfo({ plugins: [...builtinPlugins, ...extraPlugins] }),
		)) as PrettierSupportInfo;

		const format: FormatFn = async (code, selected, parser = DEFAULT_PARSER) => {
			if (!code.trim()) return { code, error: null };
			const pluginFiles = PARSER_PLUGINS[parser] ?? PARSER_PLUGINS[DEFAULT_PARSER];
			const builtinForParser = pluginFiles
				.map((file) => pluginByFile.get(file))
				.filter((p): p is unknown => p !== undefined);
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

		return { version, supportInfo, format };
	})();

	// Drop failed loads so the next call retries instead of being stuck on the rejection.
	pending.catch(() => cache.delete(key));
	cache.set(key, pending);
	return pending;
}
