import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
	/* config options here */
	async redirects() {
		return [
			{
				source: '/:locale/config',
				destination: '/:locale',
				permanent: true,
			},
		];
	},
	typedRoutes: true,
	output: 'standalone',

	// Every route here is prerendered at build time (63 pages + robots + sitemap,
	// zero dynamic routes), so Next's default 50 MB in-memory response LRU only
	// holds second copies of files already on disk. Measured in the container,
	// crawling all 63 routes: 97.9 MiB before, 63.4 MiB after.
	cacheMaxMemorySize: 0,

	// The only `next/image` usage was the favicon, now a plain <img>.
	images: { unoptimized: true },

	// `unoptimized` is a *runtime* switch — Next's file tracer still statically
	// follows `sharp` from its image-optimizer module, so 16 MB of libvips native
	// binaries ship in the image regardless. With no image optimization at all,
	// drop them from the trace.
	outputFileTracingExcludes: {
		'**/*': ['node_modules/sharp/**', 'node_modules/@img/**'],
	},

	experimental: {
		// Defaults to true, which `require()`s every route entry at boot. Nothing
		// here needs warming — the pages are static files.
		preloadEntriesOnStart: false,
	},
};

export default withNextIntl(nextConfig);
