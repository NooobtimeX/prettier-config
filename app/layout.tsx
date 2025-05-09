import type { Metadata, Viewport } from "next";
import { Oswald as OswaldFont } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import options from "@/lib/options";

const oswald = OswaldFont({ subsets: ["latin"] });

const prettierOptionKeywords = options.map((opt) => `Prettier ${opt.name}`);

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
};

export const metadata: Metadata = {
	title: "Prettier Config Generator",
	description:
		"Generate your .prettierrc file effortlessly with this interactive Prettier configuration tool.",
	metadataBase: new URL("https://prettier-config-generator.com/"),
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
		title: "Prettier Config Generator",
		description:
			"Interactive tool to generate a Prettier configuration file effortlessly.",
		url: "https://prettier-config-generator.com/",
		siteName: "Prettier Config Generator",
		type: "website",
		images: [
			{
				url: "https://prettier-config-generator.com/og-image.png",
				width: 500,
				height: 500,
				alt: "Prettier Config Generator",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Prettier Config Generator",
		description:
			"Effortlessly generate a Prettier config file with this interactive tool.",
		creator: "@nooobtimex",
		images: ["https://prettier-config-generator.com/og-image.png"],
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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html suppressHydrationWarning lang="en">
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
					{children}
					<Footer />
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
