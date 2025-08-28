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
		{
			url: `${SITE_URL}/config`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.9,
			alternates: {
				languages: {
					es: `${SITE_URL}/es/config`,
					th: `${SITE_URL}/th/config`,
				},
			},
		},
	];
}
