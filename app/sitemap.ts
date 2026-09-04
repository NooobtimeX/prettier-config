import type { MetadataRoute } from 'next';
import { routing } from '@/next-intl.config';
import { SITE_URL } from '@/lib/seo';
import { LISTED_OPTIONS, optionSlug } from '@/lib/optionRoutes';
import { hasOptionArticle } from '@/lib/optionArticle';

/**
 * Bump when the content of a route group materially changes.
 *
 * Previously this was `new Date()`, which stamped all 80 URLs with a fresh
 * timestamp on every deploy — including locales and routes that hadn't
 * changed. Google only honours <lastmod> if it is "consistently and verifiably
 * accurate" and discards the signal site-wide once it isn't, so that was
 * actively training Google to ignore it.
 */
const LAST_MODIFIED = new Date('2026-08-24');

/**
 * The option pages now change on their own schedule — whenever an article
 * lands — so they get their own date rather than borrowing the chrome's.
 * Stamping them with LAST_MODIFIED would be exactly the inaccuracy the comment
 * above exists to prevent. Bump this when a batch of articles ships.
 */
const ARTICLES_LAST_MODIFIED = new Date('2026-09-04');

export default function sitemap(): MetadataRoute.Sitemap {
	const locales = routing.locales;

	/**
	 * /privacy was previously omitted here: 20 URLs of legal boilerplate with no
	 * ranking potential were 25% of the sitemap and 25% of the crawl budget.
	 *
	 * It is back, because both halves of that reasoning changed. The sitemap no
	 * longer advertises 520 untranslated option pages, so 20 URLs is a much
	 * smaller share of it; and an ad reviewer looking for the privacy policy
	 * should be able to find it the same way a crawler does.
	 */
	const routes: string[] = ['', '/faq', '/about', '/options', '/privacy'];

	const entry = (route: string, priority: number): MetadataRoute.Sitemap =>
		locales.map((locale) => ({
			url: `${SITE_URL}/${locale}${route}`,
			lastModified: LAST_MODIFIED,
			changeFrequency: 'monthly' as const,
			priority,
			alternates: {
				languages: {
					...Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${route}`])),
					'x-default': `${SITE_URL}/${routing.defaultLocale}${route}`,
				},
			},
		}));

	/**
	 * Only locales that actually have an original article for this option.
	 *
	 * A locale without one serves the English article and ships `noindex`
	 * (lib/optionArticle.ts -> lib/seo.ts). Advertising a noindexed URL is a
	 * self-contradiction Google reports as "Submitted URL marked noindex", so
	 * both the sitemap and the hreflang cluster are derived from the same
	 * coverage table and cannot drift apart.
	 *
	 * Before any article exists an option contributes nothing here rather than
	 * all 20 thin URLs — which is the point: as of writing Google had indexed 9
	 * of the 600 URLs this file used to advertise.
	 */
	const optionEntries = LISTED_OPTIONS.flatMap((option): MetadataRoute.Sitemap => {
		const route = `/options/${optionSlug(option.key)}`;
		const covered = locales.filter((locale) => hasOptionArticle(locale, option.key));
		if (covered.length === 0) return [];

		const languages: Record<string, string> = Object.fromEntries(
			covered.map((l) => [l, `${SITE_URL}/${l}${route}`]),
		);
		if (covered.includes(routing.defaultLocale)) {
			languages['x-default'] = `${SITE_URL}/${routing.defaultLocale}${route}`;
		}

		return covered.map((locale) => ({
			url: `${SITE_URL}/${locale}${route}`,
			lastModified: ARTICLES_LAST_MODIFIED,
			changeFrequency: 'monthly' as const,
			priority: 0.6,
			alternates: { languages },
		}));
	});

	return [...routes.flatMap((route) => entry(route, route === '' ? 1.0 : 0.8)), ...optionEntries];
}
