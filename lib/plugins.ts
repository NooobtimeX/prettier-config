/**
 * Curated registry of third-party Prettier plugins the playground can load
 * from a CDN. Each entry pins a known-good version (bump deliberately).
 *
 * We load via **esm.sh** rather than jsDelivr's `+esm` endpoint because
 * esm.sh ships browser polyfills for Node built-ins (`node:module`,
 * `node:path`, `node:process`, etc.) that most Prettier plugins pull in
 * transitively. jsDelivr's Rollup-based bundler refuses those imports,
 * which is what bit the first version of this registry.
 *
 * Risk to watch: the esm.sh build of each plugin pulls in its own copy
 * of Prettier (`/prettier@^3.0?target=es2022`). In practice plugins only
 * use that for re-exports, not for format calls — the active Prettier
 * instance is the one the loader picked. Bumping a plugin past its
 * `peerDependency` on Prettier may break things; pin deliberately.
 */

import type { ParserId } from './parsers';

export type Plugin = {
	/** Stable id — used as React key, persisted state, i18n suffix. */
	id: string;
	/** Exact npm package name; emitted into the generated `plugins` array. */
	npm: string;
	/** Pinned semver. */
	version: string;
	/** jsDelivr URL; `/+esm` coerces CJS bundles to ESM at the edge. */
	cdnUrl: string;
	/** Parsers this plugin commonly applies to — shown as a hint in the dialog. */
	parsers: readonly ParserId[];
	/** Upstream homepage for the "Learn more" link. */
	homepage: string;
};

export const PLUGINS: readonly Plugin[] = [
	{
		id: 'tailwindcss',
		npm: 'prettier-plugin-tailwindcss',
		version: '0.8.0',
		cdnUrl: 'https://esm.sh/prettier-plugin-tailwindcss@0.8.0',
		parsers: ['babel', 'typescript', 'vue', 'angular', 'html', 'css', 'scss'],
		homepage: 'https://github.com/tailwindlabs/prettier-plugin-tailwindcss',
	},
	{
		id: 'sort-json',
		npm: 'prettier-plugin-sort-json',
		version: '4.1.1',
		cdnUrl: 'https://esm.sh/prettier-plugin-sort-json@4.1.1',
		parsers: ['json', 'json5', 'jsonc'],
		homepage: 'https://github.com/Sec-ant/prettier-plugin-sort-json',
	},
	{
		id: 'packagejson',
		npm: 'prettier-plugin-packagejson',
		version: '2.5.6',
		cdnUrl: 'https://esm.sh/prettier-plugin-packagejson@2.5.6',
		parsers: ['json'],
		homepage: 'https://github.com/matzkoh/prettier-plugin-packagejson',
	},
	{
		id: 'jsdoc',
		npm: 'prettier-plugin-jsdoc',
		version: '1.3.0',
		cdnUrl: 'https://esm.sh/prettier-plugin-jsdoc@1.3.0',
		parsers: ['babel', 'typescript'],
		homepage: 'https://github.com/hosseinmd/prettier-plugin-jsdoc',
	},
	{
		id: 'curly',
		npm: 'prettier-plugin-curly',
		version: '0.4.0',
		cdnUrl: 'https://esm.sh/prettier-plugin-curly@0.4.0',
		parsers: ['babel', 'typescript'],
		homepage: 'https://github.com/JoshuaKGoldberg/prettier-plugin-curly',
	},
];

export const PLUGIN_BY_ID = new Map(PLUGINS.map((p) => [p.id, p]));
export const PLUGIN_BY_NPM = new Map(PLUGINS.map((p) => [p.npm, p]));
export const PLUGIN_BY_URL = new Map(PLUGINS.map((p) => [p.cdnUrl, p]));

/**
 * Map a list of plugin ids to their pinned CDN URLs. Unknown ids are silently
 * dropped — callers that need to surface unknowns should look at the diff
 * between input and output lengths.
 */
export function pluginUrlsFor(ids: readonly string[]): string[] {
	const urls: string[] = [];
	for (const id of ids) {
		const p = PLUGIN_BY_ID.get(id);
		if (p) urls.push(p.cdnUrl);
	}
	return urls;
}

/** npm names for the generated `plugins` array in the emitted config. */
export function pluginNpmNamesFor(ids: readonly string[]): string[] {
	const names: string[] = [];
	for (const id of ids) {
		const p = PLUGIN_BY_ID.get(id);
		if (p) names.push(p.npm);
	}
	return names;
}
