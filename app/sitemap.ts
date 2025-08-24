import type { MetadataRoute } from "next";

const SITE_URL = "https://prettier-config-generator.com";
export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: SITE_URL,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1,
			alternates: {
				languages: {
					es: `${SITE_URL}/es`,
					th: `${SITE_URL}/th`,
				},
			},
		},
	];
}
