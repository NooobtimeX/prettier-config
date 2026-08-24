import type { Metadata } from 'next';
import { routing } from '@/next-intl.config';

export const SITE_URL = 'https://prettier-config.dev';
export const SITE_NAME = 'Prettier Config';
export const TWITTER_CREATOR = '@nooobtimex';

export const OG_IMAGE = {
	url: `${SITE_URL}/og-image.png`,
	width: 500,
	height: 500,
	alt: SITE_NAME,
} as const;

/**
 * Next.js **replaces** `robots`, `openGraph` and `twitter` wholesale when a
 * route sets them — it never deep-merges with the layout. Every route that
 * declared its own `openGraph` was therefore silently dropping the layout's
 * `og:image` and `googleBot` directives: /about, /faq and /privacy shipped no
 * `googlebot` meta at all (capping snippet length and image preview size) and
 * declared `summary_large_image` with no image to fill it, so social shares
 * rendered blank cards on 60 pages.
 *
 * Going through `buildPageMetadata` makes that mistake unrepresentable.
 */
const ROBOTS = {
	index: true,
	follow: true,
	googleBot: {
		index: true,
		follow: true,
		'max-video-preview': -1,
		'max-image-preview': 'large',
		'max-snippet': -1,
	},
} satisfies Metadata['robots'];

/** '' for a locale root (`/en`), otherwise a leading-slash path (`/about`). */
export type LocalePath = '' | `/${string}`;

/**
 * Self-referencing canonical plus the full hreflang cluster.
 *
 * The canonical MUST include the locale segment. Previously every locale
 * inherited `canonical: SITE_URL` from the layout — the bare origin, which
 * itself 307-redirects to /en. That contradicted the hreflang annotations in
 * the same <head>, and Google resolves such a conflict in favour of the
 * canonical, collapsing all 20 home pages into one and de-indexing 19 of them.
 */
export function alternatesFor(locale: string, path: LocalePath = '') {
	return {
		canonical: `${SITE_URL}/${locale}${path}`,
		languages: {
			...Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
			'x-default': `${SITE_URL}/${routing.defaultLocale}${path}`,
		},
	} satisfies Metadata['alternates'];
}

/**
 * The single entry point for per-route metadata. Always re-supplies robots,
 * openGraph and twitter in full so nothing is lost to Next's replace semantics.
 */
export function buildPageMetadata({
	locale,
	path = '',
	title,
	description,
}: {
	locale: string;
	path?: LocalePath;
	title: string;
	description: string;
}): Metadata {
	return {
		title,
		description,
		alternates: alternatesFor(locale, path),
		openGraph: {
			title,
			description,
			url: `${SITE_URL}/${locale}${path}`,
			siteName: SITE_NAME,
			type: 'website',
			locale,
			images: [OG_IMAGE],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			creator: TWITTER_CREATOR,
			images: [OG_IMAGE.url],
		},
		robots: ROBOTS,
	};
}
