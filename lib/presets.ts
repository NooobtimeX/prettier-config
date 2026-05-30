/**
 * One-click starter configs. Each preset is a plain `{key: value}` map of
 * Prettier options; applying a preset overwrites the user's current selections
 * (same semantics as the Import dialog), and any keys not supported by the
 * loaded Prettier version are stashed but excluded from the generated config
 * by the existing `validKeys` filter in `app/[locale]/page.tsx`.
 */

export type Preset = {
	/** Stable id — used as React key and i18n suffix. */
	id: string;
	/** The actual Prettier options the preset sets. */
	options: Record<string, unknown>;
};

export const PRESETS: Preset[] = [
	{
		id: 'defaults',
		options: {},
	},
	{
		id: 'tabs',
		options: { useTabs: true, tabWidth: 4 },
	},
	{
		id: 'standard',
		options: {
			singleQuote: true,
			semi: false,
			trailingComma: 'none',
			jsxSingleQuote: true,
		},
	},
	{
		id: 'airbnb',
		options: {
			singleQuote: true,
			trailingComma: 'all',
			printWidth: 100,
			jsxSingleQuote: true,
		},
	},
	{
		id: 'wide',
		options: { printWidth: 120 },
	},
	{
		id: 'lowToken',
		options: {
			printWidth: 200,
			semi: false,
			trailingComma: 'none',
			arrowParens: 'avoid',
			bracketSameLine: true,
			singleAttributePerLine: false,
		},
	},
];

export type PresetDiff = {
	/** Keys the preset sets that aren't currently selected. */
	adds: Record<string, unknown>;
	/** Keys present in both, but with a different value. `[current, next]`. */
	changes: Record<string, [unknown, unknown]>;
	/** Keys currently selected that the preset would clear. */
	removes: string[];
	/** Preset keys not supported by the loaded Prettier version. */
	ignored: string[];
};

function isMeaningful(value: unknown): boolean {
	if (value === null || value === undefined) return false;
	if (value === '') return false;
	if (Array.isArray(value) && value.length === 0) return false;
	return true;
}

function valueEquals(a: unknown, b: unknown): boolean {
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		return a.every((v, i) => v === b[i]);
	}
	return a === b;
}

/**
 * Compare a preset against the user's current selections in the context of
 * the loaded Prettier version. The dialog uses this to preview what would
 * change before the user clicks Apply.
 */
export function diffPresetAgainst(
	current: Record<string, unknown>,
	preset: Preset,
	validKeys: Set<string>,
): PresetDiff {
	const adds: Record<string, unknown> = {};
	const changes: Record<string, [unknown, unknown]> = {};
	const removes: string[] = [];
	const ignored: string[] = [];

	for (const [key, next] of Object.entries(preset.options)) {
		if (!validKeys.has(key)) {
			ignored.push(key);
			continue;
		}
		const prev = current[key];
		if (!isMeaningful(prev)) {
			adds[key] = next;
		} else if (!valueEquals(prev, next)) {
			changes[key] = [prev, next];
		}
	}

	const presetKeys = new Set(Object.keys(preset.options));
	for (const [key, prev] of Object.entries(current)) {
		if (!validKeys.has(key)) continue;
		if (!isMeaningful(prev)) continue;
		if (!presetKeys.has(key)) removes.push(key);
	}

	return { adds, changes, removes, ignored };
}
