import type { Metadata, Viewport } from "next";
import { Oswald as OswaldFont } from "next/font/google";
import "../globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import options from "@/lib/options";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/next-intl.config";

const oswald = OswaldFont({ subsets: ["latin"] });

const prettierOptionKeywords = options.map((opt) => `Prettier ${opt.name}`);

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
};

export const metadata: Metadata = {
	title: "Prettier Config",
	description:
		"Generate your .prettierrc file effortlessly with this interactive Prettier configuration tool.",
	metadataBase: new URL("https://prettier-config.nooobtimex.me/"),
	keywords: [
		"Prettier",
		"Prettier Config Generator",
		".prettierrc",
		"prettierrc file",
		"prettier config",
		"Prettier settings",
		"Prettier configuration",
		"Code formatter",
		"JavaScript formatter",
		"Prettier tool",
		"prettier config file",
		...prettierOptionKeywords,
	],
	authors: [{ name: "Wongsaphat Puangsorn", url: "https://nooobtimex.me" }],
	creator: "Wongsaphat Puangsorn",
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
	openGraph: {
		title: "Prettier Config",
		description:
			"Interactive tool to generate a Prettier configuration file effortlessly.",
		url: "https://prettier-config.nooobtimex.me/",
		siteName: "Prettier Config",
		type: "website",
		images: [
			{
				url: "https://prettier-config.nooobtimex.me/og-image.png",
				width: 500,
				height: 500,
				alt: "Prettier Config",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Prettier Config",
		description:
			"Effortlessly generate a Prettier config file with this interactive tool.",
		creator: "@nooobtimex",
		images: ["https://prettier-config.nooobtimex.me/og-image.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
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
		<html suppressHydrationWarning lang={locale}>
			<head>
				<Script
					id="gtm"
					src={`https://www.googletagmanager.com/gtm.js?id=GTM-N3C2N4G7`}
					strategy="lazyOnload"
				/>
				<Script id="gtm-init" strategy="lazyOnload">
					{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GTM-N3C2N4G7');
          `}
				</Script>
			</head>
			<body className={oswald.className}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<NextIntlClientProvider messages={messages}>
						{children}
					</NextIntlClientProvider>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
