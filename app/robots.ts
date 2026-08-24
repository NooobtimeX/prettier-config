import { MetadataRoute } from 'next';

/**
 * IMPORTANT: do not add a `public/robots.txt`. Next.js resolves the public/
 * folder before app routes, so a static file there silently shadows this
 * handler — which is exactly what happened before: the served robots.txt
 * carried no `Sitemap:` line, so the sitemap was never announced to any
 * crawler. Cloudflare additionally prepends its own managed AI-crawler block
 * to whatever the origin returns; that is configured in the Cloudflare
 * dashboard, not here.
 */

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
		},
		sitemap: 'https://prettier-config.dev/sitemap.xml',
		// /llms.txt is the emerging convention (plural). Nothing crawls `llm.txt`.
		host: 'https://prettier-config.dev',
	};
}
