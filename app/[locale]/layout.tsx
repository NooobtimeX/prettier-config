import type { Metadata, Viewport } from 'next';
import { Oswald as OswaldFont } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/next-intl.config';
import { ADSENSE } from '@/common/constants';
import { GoogleTagManager } from '@next/third-parties/google';
import { AdSenseScript } from '@/components/AdSenseScript';

const oswald = OswaldFont({ subsets: ['latin'] });

// Static SEO keywords covering the most-searched Prettier options.
// The UI option list itself is loaded dynamically per Prettier version
// (see lib/prettierLoader.ts) and isn't available at build time.
const SITE_URL = 'https://prettier-config.dev';

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

/**
 * hreflang map covering every supported locale plus `x-default` so Google
 * can pick a fallback for unmatched languages. Generated from
 * `routing.locales` so adding a locale to next-intl.config automatically
 * registers it for SEO.
 */
const hreflangLanguages: Record<string, string> = {
	...Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}`])),
	'x-default': `${SITE_URL}/en`,
};

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
	metadataBase: new URL('https://prettier-config.dev/'),
	alternates: {
		canonical: SITE_URL,
		languages: hreflangLanguages,
	},
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
		images: ['https://prettier-config.dev/og-image.png'],
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
				{/* Ownership verification only — ad serving comes from <AdSenseScript />. */}
				<meta
					name="google-adsense-account"
					content={ADSENSE.CLIENT_ID}
				/>
			</head>
			<body
				suppressHydrationWarning
				className={oswald.className}
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
