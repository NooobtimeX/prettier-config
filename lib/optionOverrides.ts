import type { PrettierOptionType } from '@/common/interface/PrettierOptionType';

/**
 * Per-option escape hatch for tweaking auto-generated entries from
 * `adaptSupportInfo`. Keyed by Prettier's camelCase option name.
 *
 * Use when the heuristic-derived display name, description, or UI control
 * needs a manual override — e.g. forcing a SELECT for an option with three
 * choices, or shortening a verbose description. Empty by default.
 */
export const optionOverrides: Record<string, Partial<PrettierOptionType>> = {};
