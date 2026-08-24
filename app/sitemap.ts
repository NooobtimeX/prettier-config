import type { MetadataRoute } from 'next';
import { routing } from '@/next-intl.config';
import { SITE_URL } from '@/lib/seo';
import { LISTED_OPTIONS, optionSlug } from '@/lib/optionRoutes';

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

export default function sitemap(): MetadataRoute.Sitemap {
	const locales = routing.locales;

	/**
	 * /privacy is deliberately absent: 20 URLs of legal boilerplate with no
	 * ranking potential were 25% of the sitemap and 25% of the crawl budget.
	 * The pages stay indexable, they just aren't advertised.
	 */
	const routes: string[] = ['', '/faq', '/about', '/options'];
	const optionRoutes = LISTED_OPTIONS.map((option) => `/options/${optionSlug(option.key)}`);

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

	return [
		...routes.flatMap((route) => entry(route, route === '' ? 1.0 : 0.8)),
		...optionRoutes.flatMap((route) => entry(route, 0.6)),
	];
}
