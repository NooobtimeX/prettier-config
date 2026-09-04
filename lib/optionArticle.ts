import { cache } from 'react';
import { routing } from '@/next-intl.config';
import { ARTICLES, ARTICLE_COVERAGE } from '@/lib/generated/articleRegistry';
import type { OptionArticle } from '@/common/interface/OptionArticle';

export type ResolvedArticle = {
	article: OptionArticle;
	/** The locale the prose is actually written in — may differ from the request. */
	articleLocale: string;
	/** True when a non-English page is serving the English original. */
	isFallback: boolean;
};

/**
 * Coverage check against a plain string table — never touches prose, so
 * app/sitemap.ts can call it for all 520 (locale, option) pairs for free.
 */
export function hasOptionArticle(locale: string, optionKey: string): boolean {
	return ARTICLE_COVERAGE[locale]?.includes(optionKey) ?? false;
}

async function load(locale: string, optionKey: string): Promise<OptionArticle | null> {
	// Gate on the table first so an unresolvable specifier is never constructed:
	// a missing article must read as `null`, not as a build-time import failure.
	if (!hasOptionArticle(locale, optionKey)) return null;
	const loader = ARTICLES[locale]?.[optionKey];
	if (!loader) return null;
	return (await loader()).default;
}

/**
 * The locale's own article, else the English one, else nothing.
 *
 * Returning `null` when even English is missing is deliberate: the page then
 * renders exactly as it does today, so the machinery can ship before any prose
 * does and each article goes live the moment its file lands.
 *
 * `cache()` dedupes across generateMetadata and the page body within one render
 * — both need this, and without it every option page resolves twice.
 */
export const resolveOptionArticle = cache(
	async (locale: string, optionKey: string): Promise<ResolvedArticle | null> => {
		const own = await load(locale, optionKey);
		if (own) return { article: own, articleLocale: locale, isFallback: false };

		if (locale === routing.defaultLocale) return null;

		const english = await load(routing.defaultLocale, optionKey);
		if (!english) return null;
		return { article: english, articleLocale: routing.defaultLocale, isFallback: true };
	},
);
