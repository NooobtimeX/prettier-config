/**
 * Pure utility that compares the user's current selections against the option
 * schema of a different Prettier version and returns a list of conflicts —
 * keys that would be silently dropped from the generated config after a
 * switch (because the new version doesn't expose them) and keys whose chosen
 * value is no longer a valid choice for that option in the new version.
 *
 * Used by the version picker to surface a warning dialog before the user
 * actually changes versions, so they can decide whether to proceed or cancel.
 */

import type { PrettierOptionType } from '@/common/interface/PrettierOptionType';

export type VersionConflictReason = 'missing' | 'invalid-value';

export type VersionConflict = {
	key: string;
	currentValue: unknown;
	reason: VersionConflictReason;
	/** Allowed choices in the new version (for `invalid-value` only). */
	allowedChoices?: (string | boolean)[];
};

type Selections = Record<string, unknown>;

/**
 * Returns the conflicts a user would face if they switched from a state where
 * `currentValidKeys` describes the loaded version's schema to one whose
 * options are `newOptions`. Only keys whose value is currently "active" (not
 * null / empty string / empty array) count — we already strip those from the
 * generated config, so flagging them as conflicts would just create noise.
 *
 * - `missing`: the key exists in the current version's schema but not the
 *   target's (e.g. `experimentalTernaries` when downgrading from 3.5 → 3.0).
 * - `invalid-value`: the key exists in both, but the current value isn't in
 *   the target's `options` choice list (e.g. a choice that was removed).
 */
export function computeVersionConflicts(
	selected: Selections,
	currentValidKeys: Set<string>,
	newOptions: PrettierOptionType[],
): VersionConflict[] {
	const newByKey = new Map<string, PrettierOptionType>(newOptions.map((o) => [o.key, o]));
	const conflicts: VersionConflict[] = [];

	for (const [key, value] of Object.entries(selected)) {
		// Only flag keys whose value is currently exported into the config.
		// `generateConfig` strips null / '' / [] so flagging them would be noise.
		if (value === null || value === '') continue;
		if (Array.isArray(value) && value.length === 0) continue;

		// Ignore keys that aren't even in the current version (they're already
		// hidden — the user has nothing to lose from a switch on them).
		if (!currentValidKeys.has(key)) continue;

		const target = newByKey.get(key);
		if (!target) {
			conflicts.push({ key, currentValue: value, reason: 'missing' });
			continue;
		}

		// Value-validity check only fires for enum-style options that ship a
		// `options` list. Integers / booleans / arbitrary strings carry over.
		if (target.options && target.options.length > 0) {
			if (Array.isArray(value)) {
				// MULTISELECT — every element must be a valid choice
				const allowed = new Set(target.options.map(String));
				const allOk = value.every((v) => allowed.has(String(v)));
				if (!allOk) {
					conflicts.push({
						key,
						currentValue: value,
						reason: 'invalid-value',
						allowedChoices: target.options,
					});
				}
			} else if (!target.options.some((c) => c === value)) {
				conflicts.push({
					key,
					currentValue: value,
					reason: 'invalid-value',
					allowedChoices: target.options,
				});
			}
		}
	}

	return conflicts;
}
