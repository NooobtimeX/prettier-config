import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/next-intl.config';
import Header from '../(components)/Header';
import Footer from '../(components)/Footer';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';

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
	const t = await getTranslations({ locale, namespace: 'Faq' });

	return {
		title: t('meta.title'),
		description: t('meta.description'),
		alternates: {
			canonical: `${SITE_URL}/${locale}/faq`,
			languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}/faq`])),
		},
		openGraph: {
			title: t('meta.title'),
			description: t('meta.description'),
			url: `${SITE_URL}/${locale}/faq`,
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

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'Faq' });

	type FaqItem = { question: string; answer: string };
	const items = t.raw('items') as FaqItem[];

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer,
			},
		})),
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
					</div>

					{/* FAQ Accordion */}
					<div className="mx-auto max-w-3xl">
						<Accordion
							multiple={false}
							className="space-y-2"
						>
							{items.map((item, index) => (
								<AccordionItem
									key={index}
									value={`item-${index}`}
									className="rounded-lg border px-4"
								>
									<AccordionTrigger className="py-4 text-left text-sm font-medium hover:no-underline sm:text-base">
										{item.question}
									</AccordionTrigger>
									<AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">
										{item.answer}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
