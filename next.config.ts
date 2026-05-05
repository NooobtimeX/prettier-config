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
};

export default withNextIntl(nextConfig);
