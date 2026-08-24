import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/next-intl.config';
import { SITE_URL, buildPageMetadata } from '@/lib/seo';
import { PRETTIER_SNAPSHOT_VERSION } from '@/lib/generated/prettierOptions';
import {
	LISTED_OPTIONS,
	optionBySlug,
	optionSlug,
	relatedOptions,
	prettierrcSnippet,
	playgroundUrl,
} from '@/lib/optionRoutes';
import { humanizeOptionName } from '@/lib/humanizeOptionName';
import { Separator } from '@/components/ui/separator';
import Header from '../../(components)/Header';
import Footer from '../../(components)/Footer';

export const dynamicParams = false;

export function generateStaticParams() {
	return routing.locales.flatMap((locale) =>
		LISTED_OPTIONS.map((option) => ({ locale, option: optionSlug(option.key) })),
	);
}

type Params = Promise<{ locale: string; option: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { locale, option: slug } = await params;
	const option = optionBySlug(slug);
	if (!option) return {};

	const t = await getTranslations({ locale, namespace: 'Options' });

	return buildPageMetadata({
		locale,
		path: `/options/${slug}`,
		// The camelCase key leads: it is the literal string people search.
		title: t('meta.title', { key: option.key }),
		description: t('meta.description', {
			key: option.key,
			default: String(option.default),
		}),
	});
}

export default async function OptionPage({ params }: { params: Params }) {
	const { locale, option: slug } = await params;
	const option = optionBySlug(slug);
	// dynamicParams is false so this is belt-and-braces, but it keeps the type narrow.
	if (!option) notFound();

	const t = await getTranslations({ locale, namespace: 'Options' });
	const related = relatedOptions(option);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'TechArticle',
				headline: `Prettier ${option.key}`,
				description: option.description,
				url: `${SITE_URL}/${locale}/options/${slug}`,
				inLanguage: locale,
				about: { '@type': 'SoftwareApplication', name: 'Prettier' },
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: t('breadcrumb.home'),
						item: `${SITE_URL}/${locale}`,
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: t('breadcrumb.options'),
						item: `${SITE_URL}/${locale}/options`,
					},
					{ '@type': 'ListItem', position: 3, name: option.key },
				],
			},
		],
	};

	return (
		<div className="flex min-h-screen flex-col">
			<Header />

			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<main className="flex-1">
				<div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
					<nav
						aria-label={t('breadcrumb.label')}
						className="text-muted-foreground mb-6 flex flex-wrap items-center gap-1.5 text-sm"
					>
						<Link
							href="/"
							className="hover:text-foreground transition-colors"
						>
							{t('breadcrumb.home')}
						</Link>
						<span aria-hidden="true">/</span>
						<Link
							href="/options"
							className="hover:text-foreground transition-colors"
						>
							{t('breadcrumb.options')}
						</Link>
						<span aria-hidden="true">/</span>
						<span className="text-foreground">{option.key}</span>
					</nav>

					<h1 className="mb-2 text-3xl font-bold tracking-tight">
						<code
							dir="ltr"
							className="font-mono"
						>
							{option.key}
						</code>
					</h1>
					<p className="text-muted-foreground mb-8 text-lg">
						{t('hero.subtitle', { name: humanizeOptionName(option.key) })}
					</p>

					{/* Prettier's own wording, English on every locale — see OptionReference.tsx */}
					<p
						lang="en"
						className="mb-8 leading-relaxed"
					>
						{option.description}
					</p>

					<dl className="mb-8 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
						<div>
							<dt className="text-muted-foreground text-sm">{t('facts.default')}</dt>
							<dd>
								<code
									dir="ltr"
									className="font-mono"
								>
									{typeof option.default === 'string'
										? `"${option.default}"`
										: String(option.default)}
								</code>
							</dd>
						</div>
						<div>
							<dt className="text-muted-foreground text-sm">{t('facts.type')}</dt>
							<dd>
								<code
									dir="ltr"
									className="font-mono"
								>
									{option.type}
								</code>
							</dd>
						</div>
						<div>
							<dt className="text-muted-foreground text-sm">{t('facts.cli')}</dt>
							<dd>
								<code
									dir="ltr"
									className="font-mono"
								>
									{option.cliFlag}
								</code>
							</dd>
						</div>
						{option.choices.length > 0 && (
							<div>
								<dt className="text-muted-foreground text-sm">{t('facts.values')}</dt>
								<dd className="flex flex-wrap gap-1.5">
									{option.choices.map((choice) => (
										<code
											dir="ltr"
											key={choice.value}
											className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs"
										>
											{choice.value}
										</code>
									))}
								</dd>
							</div>
						)}
					</dl>

					<Separator className="my-8" />

					<h2 className="mb-3 text-xl font-bold">{t('snippet.title')}</h2>
					<p className="text-muted-foreground mb-4 text-sm leading-relaxed">
						{t('snippet.intro', { key: option.key })}
					</p>
					<pre
						dir="ltr"
						className="bg-muted mb-4 overflow-x-auto rounded-lg p-4 text-sm"
					>
						<code className="font-mono">{prettierrcSnippet(option)}</code>
					</pre>
					<Link
						href={playgroundUrl(locale, option)}
						className="border-input hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
					>
						{t('snippet.tryIt')}
					</Link>

					{option.choices.length > 0 && (
						<>
							<Separator className="my-8" />
							<h2 className="mb-3 text-xl font-bold">{t('values.title')}</h2>
							<dl className="space-y-3">
								{option.choices.map((choice) => (
									<div key={choice.value}>
										<dt>
											<code
												dir="ltr"
												className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm font-semibold"
											>
												{choice.value}
											</code>
										</dt>
										{choice.description && (
											<dd
												lang="en"
												className="text-muted-foreground mt-1 text-sm leading-relaxed"
											>
												{choice.description}
											</dd>
										)}
									</div>
								))}
							</dl>
						</>
					)}

					{related.length > 0 && (
						<>
							<Separator className="my-8" />
							<h2 className="mb-3 text-xl font-bold">
								{t('related.title', { category: option.category })}
							</h2>
							<ul className="flex flex-wrap gap-2">
								{related.map((other) => (
									<li key={other.key}>
										<Link
											href={`/options/${optionSlug(other.key)}`}
											className="bg-muted hover:bg-accent inline-block rounded-full px-3 py-1.5 font-mono text-sm transition-colors"
										>
											{other.key}
										</Link>
									</li>
								))}
							</ul>
						</>
					)}

					<p className="text-muted-foreground mt-10 text-xs">
						{t('generatedFrom', { version: PRETTIER_SNAPSHOT_VERSION })}
					</p>
				</div>
			</main>

			<Footer />
		</div>
	);
}
