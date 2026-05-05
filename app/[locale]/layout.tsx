import type { Metadata, Viewport } from "next";
import { Oswald as OswaldFont } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import options from "@/lib/options";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/next-intl.config";
import { GoogleTagManager } from "@next/third-parties/google";

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
		"Prettier Config - The ultimate interactive tool to generate your .prettierrc file effortlessly. Customize and optimize your code formatting with ease.",
	metadataBase: new URL("https://prettier-config.dev/"),
	alternates: {
		canonical: "https://prettier-config.dev",
		languages: {
			en: "https://prettier-config.dev/en",
			th: "https://prettier-config.dev/th",
			zh: "https://prettier-config.dev/zh",
			es: "https://prettier-config.dev/es",
		},
	},
	keywords: [
		"Prettier Config",
		"Prettier Config Generator",
		"Prettierrc Generator",
		".prettierrc creator",
		"online prettier config",
		"interactive prettier config",
		...prettierOptionKeywords,
	],
	authors: [{ name: "NooobtimeX", url: "https://nooobtimex.me" }],
	creator: "NooobtimeX",
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
	openGraph: {
		title: "Prettier Config",
		description:
			"Interactive tool to generate a Prettier configuration file effortlessly.",
		url: "https://prettier-config.dev/",
		siteName: "Prettier Config",
		type: "website",
		images: [
			{
				url: "https://prettier-config.dev/og-image.png",
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
		images: ["https://prettier-config.dev/og-image.png"],
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
				<meta
					name="google-adsense-account"
					content="ca-pub-6034794215506479"
				></meta>
			</head>
			<body suppressHydrationWarning className={oswald.className}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<NextIntlClientProvider messages={messages}>
						{children}
						<Toaster />
					</NextIntlClientProvider>
				</ThemeProvider>
				<GoogleTagManager gtmId="GTM-N3C2N4G7" />
			</body>
		</html>
	);
}
