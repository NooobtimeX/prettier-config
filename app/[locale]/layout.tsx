import type { Metadata, Viewport } from 'next';
import { Oswald as OswaldFont } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/next-intl.config';
import { ADSENSE } from '@/common/constants';
import { SITE_URL, OG_IMAGE } from '@/lib/seo';
import { GoogleTagManager } from '@next/third-parties/google';
import { AdSenseScript } from '@/components/AdSenseScript';

/**
 * Oswald is a Latin-script display face. Google Fonts ships it in latin,
 * latin-ext, cyrillic, cyrillic-ext and vietnamese — and in nothing else, so it
 * has no glyphs at all for Thai, Han, Kana, Hangul, Arabic, Devanagari or
 * Bengali. Eight of the twenty locales fall back to a system face no matter
 * what we do here.
 *
 * `preload: false` is deliberate. The LCP on the home page is the cross-origin
 * jsDelivr fetch that populates the options grid — nothing can paint until it
 * lands — so a high-priority font preload was competing for a connection slot
 * with the thing that actually determines LCP, and on 8 locales it preloaded a
 * file the page could never use. Without the preload the extra subsets below
 * cost nothing: each is fetched only if a page actually references it.
 */
const oswald = OswaldFont({
	subsets: ['latin', 'latin-ext', 'cyrillic', 'vietnamese'],
	display: 'swap',
	preload: false,
});

/** Locales whose script Oswald can actually render. */
const OSWALD_LOCALES = new Set([
	'en',
	'es',
	'de',
	'fr',
	'pt',
	'it',
	'id',
	'pl',
	'tr',
	'vi',
	'ru',
	'uk',
]);

// Static SEO keywords covering the most-searched Prettier options.
// The UI option list itself is loaded dynamically per Prettier version
// (see lib/prettierLoader.ts) and isn't available at build time.
const prettierOptionKeywords = [
	'Print Width',
	'Tab Width',
	'Use Tabs',
	'Semicolons',
	'Single Quote',
	'Quote Props',
	'JSX Single Quote',
	'Trailing Comma',
	'Bracket Spacing',
	'Bracket Same Line',
	'Arrow Parens',
	'Prose Wrap',
	'HTML Whitespace Sensitivity',
	'End of Line',
	'Embedded Language Formatting',
	'Single Attribute Per Line',
	'Experimental Ternaries',
].map((name) => `Prettier ${name}`);

/** Locales that need `<html dir="rtl">`. */
const RTL_LOCALES = new Set(['ar', 'fa', 'he', 'ur']);

/**
 * Locked to the locales in generateStaticParams below. Without this, any path
 * containing a dot bypasses proxy.ts's matcher, falls through to [locale], and
 * i18n/request.ts quietly falls back to defaultLocale — so `/llms.txt`,
 * `/anything.foo` and friends rendered the home page with HTTP 200 and
 * `<html lang="llms.txt">`. An unbounded soft-404 surface; now they 404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
};

export const metadata: Metadata = {
	title: 'Prettier Config',
	description:
		'Prettier Config - The ultimate interactive tool to generate your .prettierrc file effortlessly. Customize and optimize your code formatting with ease.',
	metadataBase: new URL(`${SITE_URL}/`),
	keywords: [
		'Prettier Config',
		'Prettier Config Generator',
		'Prettierrc Generator',
		'.prettierrc creator',
		'online prettier config',
		'interactive prettier config',
		...prettierOptionKeywords,
	],
	authors: [{ name: 'NooobtimeX', url: 'https://nooobtimex.me' }],
	creator: 'NooobtimeX',
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon.ico',
		apple: '/apple-touch-icon.png',
	},
	openGraph: {
		title: 'Prettier Config',
		description: 'Interactive tool to generate a Prettier configuration file effortlessly.',
		url: 'https://prettier-config.dev/',
		siteName: 'Prettier Config',
		type: 'website',
		images: [
			{
				url: 'https://prettier-config.dev/og-image.png',
				width: 500,
				height: 500,
				alt: 'Prettier Config',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Prettier Config',
		description: 'Effortlessly generate a Prettier config file with this interactive tool.',
		creator: '@nooobtimex',
		images: [OG_IMAGE.url],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
};

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages({ locale });

	return (
		<html
			suppressHydrationWarning
			lang={locale}
			dir={RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'}
		>
			<head>
				{/* The options grid cannot paint until Prettier arrives from jsDelivr, so
				    this fetch IS the LCP. Warming DNS + TLS here is the cheapest win
				    available on the home page. */}
				<link
					rel="preconnect"
					href="https://cdn.jsdelivr.net"
					crossOrigin=""
				/>
				<link
					rel="dns-prefetch"
					href="https://cdn.jsdelivr.net"
				/>
				{/* Ownership verification only — ad serving comes from <AdSenseScript />. */}
				<meta
					name="google-adsense-account"
					content={ADSENSE.CLIENT_ID}
				/>
			</head>
			<body
				suppressHydrationWarning
				// Applying a Latin-only face to e.g. Thai just forces an unstyled
				// fallback with uncompensated metrics — skip it where it cannot help.
				className={OSWALD_LOCALES.has(locale) ? oswald.className : undefined}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{/* `locale` is required, not optional: without it the provider falls back
					    to routing.defaultLocale, and every next-intl <Link> — header, footer,
					    everywhere — renders an /en/… href on all 19 non-English locales. */}
					<NextIntlClientProvider
						locale={locale}
						messages={messages}
					>
						{children}
						<Toaster />
					</NextIntlClientProvider>
				</ThemeProvider>
				<GoogleTagManager gtmId="GTM-N3C2N4G7" />
				<AdSenseScript />
			</body>
		</html>
	);
}
