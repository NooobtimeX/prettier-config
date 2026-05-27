/**
 * Dynamically loads `prettier/standalone` plus every parser plugin for an
 * arbitrary Prettier version from jsDelivr, and exposes:
 *   - `format()` — version-bound formatter (JS only, via babel + estree).
 *   - `supportInfo` — the result of `getSupportInfo({ plugins })` so the UI
 *     can build its form from the version's actual option schema, including
 *     language-specific options registered by parser plugins.
 *
 * Modules are cached per version so toggling the picker back and forth doesn't
 * re-download.
 */

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

export type FormatFn = (code: string, selectedOptions: Record<string, unknown>) => Promise<string>;

export type LoadedPrettier = {
	version: string;
	supportInfo: PrettierSupportInfo;
	format: FormatFn;
};

const cache = new Map<string, Promise<LoadedPrettier>>();

/**
 * Plugins to fetch alongside `standalone.mjs` so that `getSupportInfo()` returns
 * the language-specific options (singleQuote, trailingComma, proseWrap, …) in
 * addition to the always-present global ones. These plugins register their
 * option definitions on import.
 *
 * Note: actual formatting still uses just babel + estree (see `format` below).
 * The extra plugins exist only so the UI knows about non-JS options.
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

export function loadPrettier(version: string): Promise<LoadedPrettier> {
	const cached = cache.get(version);
	if (cached) return cached;

	const versionPath = resolveVersionPath(version);
	const base = `https://cdn.jsdelivr.net/npm/prettier@${versionPath}`;

	const pending = (async (): Promise<LoadedPrettier> => {
		const [standaloneMod, ...pluginMods] = await Promise.all([
			importFromUrl(`${base}/standalone.mjs`),
			...PLUGIN_FILES.map((file) => importFromUrl(`${base}/plugins/${file}`)),
		]);

		const prettier = unwrapDefault(standaloneMod) as {
			format: (code: string, opts: unknown) => Promise<string>;
			getSupportInfo: (opts?: unknown) => unknown;
		};

		const allPlugins = pluginMods.map(unwrapDefault);
		// babel.mjs and estree.mjs are the first two entries in PLUGIN_FILES.
		const [babelPlugin, estreePlugin] = allPlugins;

		// Pass every plugin to getSupportInfo so language-specific options
		// (singleQuote, proseWrap, htmlWhitespaceSensitivity, …) are included.
		const supportInfo = (await Promise.resolve(
			prettier.getSupportInfo({ plugins: allPlugins }),
		)) as PrettierSupportInfo;

		const format: FormatFn = async (code, selected) => {
			if (!code.trim()) return code;
			try {
				const filtered: Record<string, unknown> = {};
				for (const [k, v] of Object.entries(selected)) {
					if (k === 'parser' || k === 'plugins') continue;
					if (v === null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
					filtered[k] = v;
				}
				return await prettier.format(code, {
					...filtered,
					parser: 'babel',
					plugins: [babelPlugin, estreePlugin],
				});
			} catch {
				return code;
			}
		};

		return { version, supportInfo, format };
	})();

	// Drop failed loads so the next call retries instead of being stuck on the rejection.
	pending.catch(() => cache.delete(version));
	cache.set(version, pending);
	return pending;
}
