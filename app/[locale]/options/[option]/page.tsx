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
import { hasOptionArticle, resolveOptionArticle } from '@/lib/optionArticle';
import { ArticleBody, Inline, stripInlineMarkers } from '@/components/ArticleBody';
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
	const resolved = await resolveOptionArticle(locale, option.key);
	const translated = routing.locales.filter((l) => hasOptionArticle(l, option.key));

	return buildPageMetadata({
		locale,
		path: `/options/${slug}`,
		// The camelCase key leads: it is the literal string people search.
		title: t('meta.title', { key: option.key }),
		description: t('meta.description', {
			key: option.key,
			default: String(option.default),
		}),
		// A page serving the English article on a non-English locale is a
		// near-duplicate of /en — index it and we are asking Google to rank 20
		// copies of one article. It stays live and followable for readers.
		index: !resolved?.isFallback,
		// Before any article exists the family is untranslated everywhere, so the
		// full cluster is still the honest annotation.
		hreflangLocales: translated.length > 0 ? translated : undefined,
	});
}

export default async function OptionPage({ params }: { params: Params }) {
	const { locale, option: slug } = await params;
	const option = optionBySlug(slug);
	// dynamicParams is false so this is belt-and-braces, but it keeps the type narrow.
	if (!option) notFound();

	const t = await getTranslations({ locale, namespace: 'Options' });
	const related = relatedOptions(option);
	const resolved = await resolveOptionArticle(locale, option.key);
	const article = resolved?.article;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'TechArticle',
				headline: `Prettier ${option.key}`,
				// Our summary, not Prettier's sentence — the latter is upstream's
				// wording and identical on all 20 locales.
				description: article ? stripInlineMarkers(article.summary) : option.description,
				url: `${SITE_URL}/${locale}/options/${slug}`,
				// The language the prose is actually in, which is English whenever
				// this locale is still serving the fallback.
				inLanguage: resolved?.articleLocale ?? locale,
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
			...(article && article.faq.length > 0
				? [
						{
							'@type': 'FAQPage',
							mainEntity: article.faq.map((item) => ({
								'@type': 'Question',
								name: item.question,
								acceptedAnswer: {
									'@type': 'Answer',
									// Structured data takes plain text: the authoring
									// backticks must not leak into it.
									text: stripInlineMarkers(item.answer),
								},
							})),
						},
					]
				: []),
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

					{/* The h1 used to be the bare identifier, giving the page no
					    descriptive heading text at all. */}
					<h1 className="mb-2 text-3xl font-bold tracking-tight">
						<code
							dir="ltr"
							className="font-mono"
						>
							{option.key}
						</code>
						{article && <span> &mdash; {article.tagline}</span>}
					</h1>
					<p className="text-muted-foreground mb-6 text-lg">
						{t('hero.subtitle', { name: humanizeOptionName(option.key) })}
					</p>

					{article && (
						<p className="mb-8 text-lg leading-relaxed">
							<Inline text={article.summary} />
						</p>
					)}

					{/* Prettier's own wording, English on every locale — see
					    OptionReference.tsx. Once we have our own explanation above, this
					    stops being the page's body copy and becomes what it always was:
					    a quotation, attributed to its source. */}
					<figure className="border-muted mb-8 border-l-2 pl-4">
						<blockquote
							lang="en"
							className="text-muted-foreground leading-relaxed"
						>
							{option.description}
						</blockquote>
						<figcaption className="text-muted-foreground mt-2 text-xs">
							<a
								href="https://prettier.io/docs/options"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-foreground underline underline-offset-2"
							>
								{t('article.upstream')}
							</a>
						</figcaption>
					</figure>

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

					{article && (
						<>
							<Separator className="my-8" />
							{resolved?.isFallback && (
								<p className="text-muted-foreground mb-6 text-sm">{t('article.fallbackNotice')}</p>
							)}
							<div lang={resolved?.isFallback ? resolved.articleLocale : undefined}>
								<ArticleBody sections={article.sections} />
							</div>
						</>
					)}

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

					{option.examples.length > 0 && (
						<>
							<Separator className="my-8" />
							<h2 className="mb-3 text-xl font-bold">{t('examples.title')}</h2>
							<p className="text-muted-foreground mb-4 text-sm leading-relaxed">
								{t('examples.intro', { key: option.key })}
							</p>
							<div className="space-y-4">
								{option.examples.map((example) => (
									<div key={example.value}>
										<h3 className="mb-2 font-mono text-sm font-semibold">
											<code dir="ltr">
												{option.key}: {example.value}
											</code>
										</h3>
										{/* Real Prettier output, produced at build time by running the
										    pinned Prettier over one shared snippet — not hand-written,
										    so it cannot drift from what the tool actually does. */}
										<pre
											dir="ltr"
											className="bg-muted overflow-x-auto rounded-lg p-4 text-xs leading-relaxed"
										>
											<code className="font-mono">{example.code.trimEnd()}</code>
										</pre>
									</div>
								))}
							</div>
						</>
					)}

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

					{article && article.faq.length > 0 && (
						<>
							<Separator className="my-8" />
							<h2 className="mb-3 text-xl font-bold">{t('article.faqTitle')}</h2>
							<dl className="space-y-4">
								{article.faq.map((item) => (
									<div key={item.question}>
										<dt className="mb-1 font-semibold">{item.question}</dt>
										<dd className="text-muted-foreground leading-relaxed">
											<Inline text={item.answer} />
										</dd>
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
