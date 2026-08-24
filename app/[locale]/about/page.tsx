import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/next-intl.config';
import { Link } from '@/i18n/navigation';
import { GithubIcon } from '@/components/GithubIcon';
import { ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { REPOSITORY, DEVELOPER, AD_SLOTS } from '@/common/constants';
import { AdSlot } from '@/components/AdSlot';
import Header from '../(components)/Header';
import Footer from '../(components)/Footer';

const SITE_URL = 'https://prettier-config.dev';

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'About' });

	return {
		title: t('meta.title'),
		description: t('meta.description'),
		alternates: {
			canonical: `${SITE_URL}/${locale}/about`,
			languages: {
				...Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}/about`])),
				'x-default': `${SITE_URL}/en/about`,
			},
		},
		openGraph: {
			title: t('meta.title'),
			description: t('meta.description'),
			url: `${SITE_URL}/${locale}/about`,
			siteName: 'Prettier Config',
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title: t('meta.title'),
			description: t('meta.description'),
			creator: '@nooobtimex',
		},
		robots: {
			index: true,
			follow: true,
		},
	};
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'About' });

	type FeatureItem = { title: string; description: string };
	const features = t.raw('features.items') as FeatureItem[];
	const techItems = t.raw('techStack.items') as string[];

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: t('meta.title'),
		description: t('meta.description'),
		url: `${SITE_URL}/${locale}/about`,
		author: {
			'@type': 'Person',
			name: DEVELOPER.NAME,
			url: DEVELOPER.WEBSITE,
		},
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
					<div className="mx-auto mb-16 max-w-2xl text-center">
						<span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium">
							{t('hero.badge')}
						</span>
						<h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
							{t('hero.title')}
						</h1>
						<p className="text-muted-foreground text-lg">{t('hero.description')}</p>
					</div>

					{/* What is this */}
					<section className="mx-auto mb-16 max-w-3xl">
						<h2 className="mb-4 text-2xl font-bold">{t('whatIsThis.title')}</h2>
						<p className="text-muted-foreground leading-relaxed">{t('whatIsThis.description')}</p>
					</section>

					<AdSlot
						slot={AD_SLOTS.aboutInline}
						className="mx-auto max-w-3xl"
					/>

					<Separator className="my-12" />

					{/* Features */}
					<section className="mb-16">
						<h2 className="mb-8 text-center text-2xl font-bold">{t('features.title')}</h2>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{features.map((feature, index) => (
								<div
									key={index}
									className="rounded-lg border p-5"
								>
									<h3 className="mb-2 font-semibold">{feature.title}</h3>
									<p className="text-muted-foreground text-sm">{feature.description}</p>
								</div>
							))}
						</div>
					</section>

					<Separator className="my-12" />

					{/* Tech Stack */}
					<section className="mx-auto mb-16 max-w-3xl">
						<h2 className="mb-6 text-2xl font-bold">{t('techStack.title')}</h2>
						<div className="flex flex-wrap gap-2">
							{techItems.map((tech, index) => (
								<span
									key={index}
									className="bg-muted rounded-full px-4 py-1.5 text-sm font-medium"
								>
									{tech}
								</span>
							))}
						</div>
					</section>

					<Separator className="my-12" />

					{/* Open Source */}
					<section className="mx-auto mb-16 max-w-3xl">
						<h2 className="mb-4 text-2xl font-bold">{t('openSource.title')}</h2>
						<p className="text-muted-foreground mb-6 leading-relaxed">
							{t('openSource.description')}
						</p>
						<Link
							href={REPOSITORY.GITHUB_URL as string}
							target="_blank"
							rel="noopener noreferrer"
							className="border-input hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
						>
							<GithubIcon className="h-4 w-4" />
							{t('openSource.button')}
						</Link>
					</section>

					<Separator className="my-12" />

					{/* Creator */}
					<section className="mx-auto mb-8 max-w-3xl">
						<h2 className="mb-4 text-2xl font-bold">{t('creator.title')}</h2>
						<div className="rounded-lg border p-6">
							<p className="text-muted-foreground mb-1 text-sm">{t('creator.builtBy')}</p>
							<Link
								href={DEVELOPER.WEBSITE}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-primary inline-flex items-center gap-1.5 text-lg font-semibold transition-colors"
							>
								{DEVELOPER.NAME}
								<ExternalLink className="h-4 w-4" />
							</Link>
							<p className="text-muted-foreground mt-3 text-sm">{t('creator.description')}</p>
						</div>
					</section>
				</div>
			</main>

			<Footer />
		</div>
	);
}
