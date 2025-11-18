import type { MetadataRoute } from "next";

const SITE_URL = "https://prettier-config.dev";

export default function sitemap(): MetadataRoute.Sitemap {
	const routes = ["", "/config"];
	const locales = ["en", "th"];
	const currentDate = new Date().toISOString();

	const sitemap: MetadataRoute.Sitemap = [];

	// Add root URLs for each locale
	for (const locale of locales) {
		for (const route of routes) {
			const url =
				route === "" ?
					`${SITE_URL}/${locale}`
				:	`${SITE_URL}/${locale}${route}`;
			const priority = route === "" ? 1.0 : 0.9;

			sitemap.push({
				url,
				lastModified: currentDate,
				changeFrequency: "monthly",
				priority,
			});
		}
	}

	return sitemap;
}
