import { compressToEncodedURIComponent } from 'lz-string';
import { STATIC_PRETTIER_OPTIONS } from '@/lib/generated/prettierOptions';
import { IGNORED_OPTION_KEYS } from '@/lib/adaptSupportInfo';
import type { StaticPrettierOption } from '@/common/interface/StaticPrettierOption';

/**
 * Routing + content helpers for the per-option pages at
 * /[locale]/options/[option].
 *
 * These exist because "prettier printWidth", "prettier trailingComma es5 vs
 * all" and friends are real, high-intent queries that the site had no page for
 * — the option vocabulary lived only in a <meta name="keywords"> array Google
 * has ignored since 2009.
 */

/** The options that get a page. Mirrors what the interactive grid shows. */
export const LISTED_OPTIONS: readonly StaticPrettierOption[] = STATIC_PRETTIER_OPTIONS.filter(
	(option) => !IGNORED_OPTION_KEYS.has(option.key),
);

/** `printWidth` -> `print-width`. Kebab-case reads better as a URL segment. */
export function optionSlug(key: string): string {
	return key.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function optionBySlug(slug: string): StaticPrettierOption | undefined {
	return LISTED_OPTIONS.find((option) => optionSlug(option.key) === slug);
}

/**
 * Other options in the same Prettier category, for the "related" block.
 * Real internal linking — the site previously had zero in-content links.
 */
export function relatedOptions(option: StaticPrettierOption, limit = 6) {
	return LISTED_OPTIONS.filter((o) => o.category === option.category && o.key !== option.key).slice(
		0,
		limit,
	);
}

/** A minimal `.prettierrc` demonstrating just this option. */
export function prettierrcSnippet(option: StaticPrettierOption): string {
	return JSON.stringify({ [option.key]: option.default }, null, 2);
}

/**
 * A playground URL with this option preselected.
 *
 * Mirrors the payload shape in hooks/useShareableUrl.ts — `{v, o, c, p, pl}`
 * LZ-compressed behind `#s=`. It is a URL fragment, so it drives the UI only;
 * the indexable artifact is the option page itself, which is what we want.
 */
export function playgroundUrl(locale: string, option: StaticPrettierOption): string {
	const payload = {
		v: 'latest',
		o: { [option.key]: option.default },
		c: '',
		p: null,
		pl: [] as string[],
	};
	return `/${locale}#s=${compressToEncodedURIComponent(JSON.stringify(payload))}`;
}
