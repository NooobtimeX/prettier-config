import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/next-intl.config';
import { SITE_URL, SITE_NAME, OG_IMAGE, buildPageMetadata } from '@/lib/seo';
import { DEVELOPER, REPOSITORY } from '@/common/constants';
import Playground from './(components)/Playground';
import OptionReference from './(components)/OptionReference';

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'Page.meta' });

	return buildPageMetadata({
		locale,
		path: '',
		title: t('title'),
		description: t('description'),
	});
}

/**
 * Server shell for the playground.
 *
 * This route used to be the `'use client'` component itself, which meant it
 * could not export `generateMetadata` — so all 20 locales inherited the
 * layout's static English title and, worse, its `canonical: SITE_URL`. That
 * canonical pointed at the bare origin, which 307-redirects, and it was
 * identical on every locale. Google reads that as "these 20 pages are all
 * duplicates of one URL" and drops 19 of them.
 *
 * The interactive tree now lives in ./(components)/Playground.tsx. Providers
 * (NextIntlClientProvider, ThemeProvider) are in the layout and wrap children,
 * so Playground still renders inside both and every useTranslations call in it
 * is untouched.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'Page.meta' });

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebApplication',
				name: SITE_NAME,
				url: `${SITE_URL}/${locale}`,
				description: t('description'),
				applicationCategory: 'DeveloperApplication',
				// Runs entirely in the browser — no install, no backend.
				operatingSystem: 'Any',
				browserRequirements: 'Requires JavaScript.',
				image: OG_IMAGE.url,
				inLanguage: locale,
				isAccessibleForFree: true,
				offers: {
					'@type': 'Offer',
					price: '0',
					priceCurrency: 'USD',
				},
				author: {
					'@type': 'Person',
					name: DEVELOPER.NAME,
					url: DEVELOPER.WEBSITE,
				},
				codeRepository: REPOSITORY.GITHUB_URL,
			},
			{
				'@type': 'WebSite',
				name: SITE_NAME,
				url: `${SITE_URL}/${locale}`,
				inLanguage: locale,
			},
		],
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			{/* The only <h1> on this page. Header.tsx's brand mark was demoted to a
			    <span> so every route has exactly one. Visually hidden because the
			    playground's own chrome is the visible heading — but it gives the
			    highest-traffic route a real, localized, descriptive heading instead
			    of just the brand name. sr-only is position:absolute, so it cannot
			    disturb the h-screen layout. */}
			<h1 className="sr-only">{t('h1')}</h1>
			{/* Passed as an already-rendered element, not a component: a function
			    cannot cross the RSC boundary. Playground drops it into the options
			    surface, the one part of this h-screen layout with real document flow. */}
			<Playground optionReference={<OptionReference locale={locale} />} />
		</>
	);
}
