import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/next-intl.config';
import { SITE_NAME } from '@/lib/seo';
import '@/app/globals.css';

/**
 * Root 404 for any unmatched URL.
 *
 * Without it, Next renders a bare `__next_error__` document — no lang, no
 * styling, no links — so every bad URL was a dead end for visitors and a
 * terminated crawl path for Googlebot.
 *
 * Deliberately renders NO <html>/<body>: this app has no app/layout.tsx (the
 * document lives in app/[locale]/layout.tsx), so Next supplies its own
 * DefaultLayout here. Rendering our own produced a hydration mismatch on
 * `lang` and `className`.
 *
 * Also deliberately English-only. A localized 404 needs the [locale] segment's
 * layout, which Next will not apply to a root not-found; getting it would mean
 * hoisting html/body into a real root layout and rebuilding the per-locale
 * lang/dir handling on top — a large change across every page, for a page
 * nobody should reach. The copy still lives in the message files.
 */
export const metadata: Metadata = {
	title: `Page not found — ${SITE_NAME}`,
	robots: { index: false, follow: true },
};

/**
 * ThemeProvider lives inside the locale layout, so the `dark` class is never
 * applied here and the page would render light on a dark site.
 *
 * Done with a media query rather than the usual next-themes inline script:
 * that script sets a class on <html>, and since Next supplies the <html> here
 * we cannot put `suppressHydrationWarning` on it — which produced a hydration
 * mismatch. Mirrors the `.dark` token values from globals.css.
 *
 * Trade-off accepted: a visitor who explicitly chose light while their OS is
 * dark sees a dark 404. That is a page nobody should reach, and it beats both
 * a hydration error and a white page on a dark site.
 */
const DARK_TOKENS = `@media (prefers-color-scheme: dark){:root{
--background: oklch(0.145 0 0);
--foreground: oklch(0.985 0 0);
--muted-foreground: oklch(0.708 0 0);
--accent: oklch(0.269 0 0);
--accent-foreground: oklch(0.985 0 0);
--border: oklch(1 0 0 / 10%);
}}`;

export default async function NotFound() {
	const t = await getTranslations({ locale: routing.defaultLocale, namespace: 'NotFound' });

	const links = [
		{ href: `/${routing.defaultLocale}`, label: t('cta.generator') },
		{ href: `/${routing.defaultLocale}/options`, label: t('cta.options') },
		{ href: `/${routing.defaultLocale}/faq`, label: t('cta.faq') },
	];

	return (
		<>
			<style dangerouslySetInnerHTML={{ __html: DARK_TOKENS }} />
			<main className="bg-background text-foreground flex min-h-screen items-center justify-center px-4">
				<div className="mx-auto max-w-xl text-center">
					<p className="text-muted-foreground mb-3 font-mono text-sm">404</p>
					<h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h1>
					<p className="text-muted-foreground mb-8 leading-relaxed">{t('description')}</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						{links.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className="border-input hover:bg-accent hover:text-accent-foreground inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
							>
								{link.label}
							</a>
						))}
					</div>
				</div>
			</main>
		</>
	);
}
