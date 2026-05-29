/**
 * Pure-function importer that converts a pasted Prettier config in any of the
 * common formats (JSON, JSON5/JSONC, package.json with a `prettier` key, or a
 * JS module export like `module.exports = {...}` / `export default {...}`)
 * into a structured `ImportResult`. The caller decides how to apply the
 * `applied` and `preserved` buckets to the form state.
 *
 * Key design decisions:
 *   - We never `eval()` or `new Function()` user input. JS modules are
 *     handled by stripping the wrapper and feeding the remaining object
 *     literal through Prettier's `json5` parser via the same `format()` we
 *     already ship to the browser — this canonicalises JSON5 to JSON for
 *     free with zero extra deps.
 *   - The currently-loaded Prettier version is the authority on which keys
 *     are valid. Unknown / new keys land in the `ignored` bucket with a
 *     reason; structural keys like `overrides` go to `preserved` so they
 *     round-trip through Copy Config.
 *   - Type-confused values like `"8"` for `tabWidth` are coerced when
 *     possible; uncoercible mismatches are surfaced in `ignored`.
 */

import { PrettierOptionTypeEnum, PrettierOptionValidateEnum } from '@/common/enum/prettierOption';
import type { PrettierOptionType } from '@/common/interface/PrettierOptionType';
import type { FormatFn } from './prettierLoader';

export type IgnoredEntry = { key: string; reason: string };

export type ImportResult = {
	/** Keys with valid values that should land in the form. */
	applied: Record<string, unknown>;
	/** Keys we drop, each with a human-readable reason. */
	ignored: IgnoredEntry[];
	/**
	 * Keys we keep verbatim but don't render UI for (`overrides`, `plugins`).
	 * They round-trip through the generated config unchanged.
	 */
	preserved: Record<string, unknown>;
	/** Set if the input couldn't be parsed at all. */
	error: string | null;
};

/**
 * Reserved playground-internal Prettier keys that we always strip — they're
 * managed by the formatter wiring, never by the user.
 */
const PLAYGROUND_INTERNAL_KEYS = new Set([
	'parser',
	'filepath',
	'pluginSearchDirs',
	'plugin-search-dir',
]);

/**
 * Keys we keep even though the form doesn't render them. `plugins` is a
 * Prettier-supported array; `overrides` is the standard per-glob override
 * mechanism. Both survive round-tripping.
 */
const PRESERVED_TOP_LEVEL_KEYS = new Set(['plugins', 'overrides']);

/**
 * Strip the common JS-module wrappers so the remaining text is a bare
 * object literal that Prettier's `json5` parser can handle. Tolerates
 * leading comments, `'use strict'`, and trailing semicolons.
 */
function stripModuleWrapper(raw: string): string {
	let s = raw.trim();
	// Drop a top-of-file 'use strict';
	s = s.replace(/^['"]use strict['"]\s*;?\s*/i, '');
	// Strip leading line / block comments before the export.
	// (Inside the object literal, json5 handles comments itself.)
	while (true) {
		const before = s;
		s = s.replace(/^\s*\/\/[^\n]*\n/, '');
		s = s.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
		if (s === before) break;
	}
	// `module.exports = {...}` / `module['exports'] = {...}`
	s = s.replace(/^\s*module\s*\.\s*exports\s*=\s*/, '');
	s = s.replace(/^\s*module\s*\[\s*['"]exports['"]\s*\]\s*=\s*/, '');
	// `export default {...}` / `export = {...}` (TS-style)
	s = s.replace(/^\s*export\s+default\s+/, '');
	s = s.replace(/^\s*export\s*=\s*/, '');
	// `const config = ...; export default config;` is the trickiest pattern;
	// we don't try to support it because resolving the identifier means
	// executing code. Users with that shape will see a parse error and can
	// inline the object manually — a documented limitation.
	// Trim trailing semicolons and `as const` TS assertion.
	s = s.replace(/\s+as\s+const\s*;?\s*$/i, '');
	s = s.replace(/;\s*$/, '');
	return s.trim();
}

/**
 * `true` if the trimmed text starts with `{`, i.e. it's plausibly an object
 * literal we can hand to the json5 parser.
 */
function looksLikeObjectLiteral(s: string): boolean {
	return s.trim().startsWith('{');
}

/**
 * Try to parse `text` as JSON5/JSONC by running it through Prettier's `json5`
 * parser (which canonicalises to strict JSON) and then `JSON.parse`. Returns
 * `null` on failure (the format error gets surfaced separately by the caller).
 */
async function parseLoose(
	text: string,
	format: FormatFn,
): Promise<{ value: unknown; error: string | null }> {
	try {
		const formatted = await format(text, {}, 'json5');
		if (formatted.error) return { value: null, error: formatted.error };
		// Prettier's json5 output is always strict JSON.
		const value = JSON.parse(formatted.code);
		return { value, error: null };
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return { value: null, error: msg };
	}
}

/**
 * Validate a single key/value pair against the loaded Prettier version's
 * option schema. Returns `{ ok: true, value }` (with coercion if needed) or
 * `{ ok: false, reason }`.
 */
function validateValue(
	option: PrettierOptionType,
	value: unknown,
): { ok: true; value: unknown } | { ok: false; reason: string } {
	switch (option.validate) {
		case PrettierOptionValidateEnum.BOOLEAN: {
			if (typeof value === 'boolean') return { ok: true, value };
			if (value === 'true') return { ok: true, value: true };
			if (value === 'false') return { ok: true, value: false };
			return { ok: false, reason: `expected boolean, got ${typeof value}` };
		}
		case PrettierOptionValidateEnum.INTEGER: {
			if (typeof value === 'number' && Number.isInteger(value)) {
				return { ok: true, value };
			}
			if (typeof value === 'string' && /^-?\d+$/.test(value)) {
				return { ok: true, value: parseInt(value, 10) };
			}
			return { ok: false, reason: `expected integer, got ${typeof value}` };
		}
		case PrettierOptionValidateEnum.STRING: {
			if (typeof value !== 'string') {
				return { ok: false, reason: `expected string, got ${typeof value}` };
			}
			if (option.options && !option.options.includes(value)) {
				return {
					ok: false,
					reason: `not one of: ${option.options.join(', ')}`,
				};
			}
			return { ok: true, value };
		}
		case PrettierOptionValidateEnum.STRING_ARRAY: {
			if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
				return { ok: false, reason: 'expected array of strings' };
			}
			if (option.options) {
				const allowed = new Set(option.options.map(String));
				const bad = value.filter((v) => !allowed.has(v));
				if (bad.length > 0) {
					return { ok: false, reason: `unknown values: ${bad.join(', ')}` };
				}
			}
			return { ok: true, value };
		}
		default:
			return { ok: false, reason: 'no validator' };
	}
}

/**
 * If the parsed object looks like a `package.json` (has both `name` and
 * `version` string fields, and a `prettier` key), return the inner
 * `prettier` value. Otherwise return the original object.
 */
function maybePluckPrettierFromPackageJson(parsed: unknown): unknown {
	if (
		parsed &&
		typeof parsed === 'object' &&
		!Array.isArray(parsed) &&
		'name' in (parsed as Record<string, unknown>) &&
		'version' in (parsed as Record<string, unknown>) &&
		'prettier' in (parsed as Record<string, unknown>)
	) {
		return (parsed as Record<string, unknown>).prettier;
	}
	return parsed;
}

/**
 * Main entry — parse the raw text and bucket every key into applied /
 * ignored / preserved against the loaded Prettier version's schema.
 *
 * `options` is the same array returned by `usePrettierVersion`, so it
 * already reflects whichever Prettier release is currently loaded.
 */
export async function importPrettierConfig(
	raw: string,
	options: PrettierOptionType[],
	format: FormatFn,
	version: string,
): Promise<ImportResult> {
	const trimmed = raw.trim();
	if (!trimmed) {
		return { applied: {}, ignored: [], preserved: {}, error: 'empty input' };
	}

	const stripped = stripModuleWrapper(trimmed);
	if (!looksLikeObjectLiteral(stripped)) {
		return {
			applied: {},
			ignored: [],
			preserved: {},
			error:
				'Expected an object literal — did you paste a file that exports a function or a non-object value?',
		};
	}

	const parsed = await parseLoose(stripped, format);
	if (parsed.error || parsed.value === null) {
		return { applied: {}, ignored: [], preserved: {}, error: parsed.error };
	}

	const root = maybePluckPrettierFromPackageJson(parsed.value);
	if (!root || typeof root !== 'object' || Array.isArray(root)) {
		return {
			applied: {},
			ignored: [],
			preserved: {},
			error: 'Pasted value is not a Prettier config object.',
		};
	}

	const optionByKey = new Map<string, PrettierOptionType>(options.map((o) => [o.key, o]));

	const applied: Record<string, unknown> = {};
	const ignored: IgnoredEntry[] = [];
	const preserved: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(root as Record<string, unknown>)) {
		if (PLAYGROUND_INTERNAL_KEYS.has(key)) {
			ignored.push({ key, reason: 'playground-internal' });
			continue;
		}
		if (PRESERVED_TOP_LEVEL_KEYS.has(key)) {
			preserved[key] = value;
			continue;
		}
		const opt = optionByKey.get(key);
		if (!opt) {
			ignored.push({ key, reason: `unknown for Prettier ${version}` });
			continue;
		}
		// Booleans land naturally; choice-options with a single string check too.
		if (opt.type === PrettierOptionTypeEnum.MULTISELECT) {
			const validated = validateValue(opt, value);
			if (validated.ok) applied[key] = validated.value;
			else ignored.push({ key, reason: validated.reason });
			continue;
		}
		const validated = validateValue(opt, value);
		if (validated.ok) applied[key] = validated.value;
		else ignored.push({ key, reason: validated.reason });
	}

	return { applied, ignored, preserved, error: null };
}
