/**
 * `printWidth` -> `Print Width`.
 *
 * Extracted from adaptSupportInfo so the interactive option cards and the
 * server-rendered option reference derive display names from one place and
 * cannot drift apart. Acronyms it mangles (`Html Whitespace Sensitivity`,
 * `Jsx Single Quote`) are corrected per-option in lib/optionOverrides.ts.
 */
export function humanizeOptionName(camelCase: string): string {
	return camelCase
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, (c) => c.toUpperCase())
		.trim();
}
