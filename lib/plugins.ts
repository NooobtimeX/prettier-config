/**
 * Curated registry of third-party Prettier plugins the playground can load
 * from a CDN. Each entry pins a known-good version (bump deliberately) and
 * uses jsDelivr's `+esm` suffix so CommonJS-only packages get auto-converted
 * to ESM at request time.
 *
 * Excluded for now:
 *   - `prettier-plugin-organize-imports` — needs the Node `typescript` module.
 *   - `@prettier/plugin-php` / `plugin-xml` — large, niche; revisit on demand.
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
		cdnUrl: 'https://cdn.jsdelivr.net/npm/prettier-plugin-tailwindcss@0.8.0/+esm',
		parsers: ['babel', 'typescript', 'vue', 'angular', 'html', 'css', 'scss'],
		homepage: 'https://github.com/tailwindlabs/prettier-plugin-tailwindcss',
	},
	{
		id: 'sort-json',
		npm: 'prettier-plugin-sort-json',
		version: '4.1.1',
		cdnUrl: 'https://cdn.jsdelivr.net/npm/prettier-plugin-sort-json@4.1.1/+esm',
		parsers: ['json', 'json5', 'jsonc'],
		homepage: 'https://github.com/Sec-ant/prettier-plugin-sort-json',
	},
];

// Withheld until I can verify they load cleanly via jsDelivr's `+esm`:
//   - prettier-plugin-packagejson   — drags in Node-only deps (sort-package-json).
//   - prettier-plugin-jsdoc         — imports `node:module` via its TS deps.
//   - prettier-plugin-organize-imports — needs the Node `typescript` package.

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
