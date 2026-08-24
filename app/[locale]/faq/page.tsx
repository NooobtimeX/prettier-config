import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/next-intl.config';
import { buildPageMetadata } from '@/lib/seo';
import { AD_SLOTS } from '@/common/constants';
import { AdSlot } from '@/components/AdSlot';
import Header from '../(components)/Header';
import Footer from '../(components)/Footer';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';

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

	return buildPageMetadata({
		locale,
		path: '/faq',
		title: t('meta.title'),
		description: t('meta.description'),
	});
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
						{/* hiddenUntilFound keeps every panel mounted as hidden="until-found"
						    rather than unmounting it. Base UI defaults keepMounted to false, so
						    all 27 answers (~879 words) previously rendered null and reached
						    Googlebot only inside the JSON-LD — never as body copy. */}
						<Accordion
							multiple={false}
							hiddenUntilFound
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

						<AdSlot
							slot={AD_SLOTS.faqInline}
							className="mt-12"
						/>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
