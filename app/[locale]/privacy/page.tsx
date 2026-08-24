import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/next-intl.config';
import { SITE_URL, buildPageMetadata } from '@/lib/seo';
import { CONTACT } from '@/common/constants';
import { Separator } from '@/components/ui/separator';
import Header from '../(components)/Header';
import Footer from '../(components)/Footer';

/**
 * Bump whenever the policy text changes materially. Rendered through
 * `Intl.DateTimeFormat` so each locale gets its own conventions instead of a
 * hard-coded English date sitting inside 20 translation files.
 */
const LAST_UPDATED = '2026-08-24';

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'Privacy' });

	return buildPageMetadata({
		locale,
		path: '/privacy',
		title: t('meta.title'),
		description: t('meta.description'),
	});
}

type Section = { title: string; paragraphs: string[]; items?: string[]; footnote?: string };

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'Privacy' });

	const summaryItems = t.raw('summary.items') as string[];
	const sections = t.raw('sections') as Section[];

	const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(
		new Date(LAST_UPDATED),
	);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: t('meta.title'),
		description: t('meta.description'),
		url: `${SITE_URL}/${locale}/privacy`,
		dateModified: LAST_UPDATED,
	};

	return (
		<div className="flex min-h-screen flex-col">
			<Header />

			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<main className="flex-1">
				<div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
					{/* Hero */}
					<div className="mx-auto mb-12 max-w-2xl text-center">
						<span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium">
							{t('hero.badge')}
						</span>
						<h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
							{t('hero.title')}
						</h1>
						<p className="text-muted-foreground text-lg">{t('hero.description')}</p>
						<p className="text-muted-foreground mt-4 text-sm">
							{t('hero.lastUpdated')} {formattedDate}
						</p>
					</div>

					{/* The short version — the part most people actually read. */}
					<section className="mx-auto mb-12 max-w-3xl">
						<div className="bg-muted/40 rounded-lg border p-6">
							<h2 className="mb-4 text-xl font-bold">{t('summary.title')}</h2>
							<ul className="space-y-2">
								{summaryItems.map((item, index) => (
									<li
										key={index}
										className="text-muted-foreground flex gap-2 text-sm leading-relaxed"
									>
										<span
											aria-hidden="true"
											className="text-primary"
										>
											&bull;
										</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					</section>

					<Separator className="my-12" />

					{/* Full policy */}
					<div className="mx-auto max-w-3xl">
						{sections.map((section, index) => (
							<section
								key={index}
								className="mb-10"
							>
								<h2 className="mb-3 text-xl font-bold">{section.title}</h2>
								{section.paragraphs.map((paragraph, pIndex) => (
									<p
										key={pIndex}
										className="text-muted-foreground mb-3 leading-relaxed"
									>
										{paragraph}
									</p>
								))}
								{section.items && (
									<ul className="mt-3 space-y-2">
										{section.items.map((item, iIndex) => (
											<li
												key={iIndex}
												className="text-muted-foreground flex gap-2 text-sm leading-relaxed"
											>
												<span
													aria-hidden="true"
													className="text-primary"
												>
													&bull;
												</span>
												<span>{item}</span>
											</li>
										))}
									</ul>
								)}
								{section.footnote && (
									<p className="text-muted-foreground mt-3 leading-relaxed">{section.footnote}</p>
								)}
							</section>
						))}

						<Separator className="my-12" />

						{/* Contact */}
						<section className="mb-8">
							<h2 className="mb-3 text-xl font-bold">{t('contact.title')}</h2>
							<p className="text-muted-foreground mb-4 leading-relaxed">
								{t('contact.description')}
							</p>
							<a
								href={`mailto:${CONTACT.EMAIL}`}
								className="hover:text-primary font-medium transition-colors"
							>
								{CONTACT.EMAIL}
							</a>
						</section>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
