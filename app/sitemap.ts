import { Locale } from '@/common/enum/locale';
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://prettier-config.dev';

export default function sitemap(): MetadataRoute.Sitemap {
	const routes = ['', '/faq', '/about', '/privacy'];
	const locales = Object.values(Locale);
	const currentDate = new Date();

	const sitemap: MetadataRoute.Sitemap = [];

	// Add entries for each locale and route
	for (const route of routes) {
		for (const locale of locales) {
			const path = route === '' ? `/${locale}` : `/${locale}${route}`;
			const url = `${SITE_URL}${path}`;

			const enPath = route === '' ? '/en' : `/en${route}`;
			sitemap.push({
				url,
				lastModified: currentDate,
				changeFrequency: 'monthly',
				priority: route === '' ? 1.0 : 0.8,
				alternates: {
					languages: {
						...Object.fromEntries(
							locales.map((l) => {
								const altPath = route === '' ? `/${l}` : `/${l}${route}`;
								return [l, `${SITE_URL}${altPath}`];
							}),
						),
						'x-default': `${SITE_URL}${enPath}`,
					},
				},
			});
		}
	}

	return sitemap;
}
