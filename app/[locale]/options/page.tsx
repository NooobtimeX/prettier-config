import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/next-intl.config';
import { buildPageMetadata } from '@/lib/seo';
import { PRETTIER_SNAPSHOT_VERSION } from '@/lib/generated/prettierOptions';
import { LISTED_OPTIONS, optionSlug } from '@/lib/optionRoutes';
import { humanizeOptionName } from '@/lib/humanizeOptionName';
import { resolveOptionArticle } from '@/lib/optionArticle';
import Header from '../(components)/Header';
import Footer from '../(components)/Footer';

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'Options.index' });

	return buildPageMetadata({
		locale,
		path: '/options',
		title: t('metaTitle'),
		description: t('metaDescription'),
	});
}

/**
 * Hub page for the per-option pages. Its job is internal linking as much as
 * ranking: before this the site had exactly five internal links, all of them
 * nav chrome, so nothing distributed authority to the long-tail pages.
 */
export default async function OptionsIndexPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'Options.index' });

	/**
	 * Our own one-line description per option, replacing Prettier's `description`.
	 * That sentence used to appear here, on the home page's reference, and again
	 * on the option page itself — the same 251 borrowed words on three page types.
	 */
	const articles = new Map(
		await Promise.all(
			LISTED_OPTIONS.map(async (o) => [o.key, await resolveOptionArticle(locale, o.key)] as const),
		),
	);

	// Group by Prettier's own categories so the page has real structure.
	const byCategory = LISTED_OPTIONS.reduce<Record<string, typeof LISTED_OPTIONS>>((acc, option) => {
		acc[option.category] = [...(acc[option.category] ?? []), option];
		return acc;
	}, {});

	return (
		<div className="flex min-h-screen flex-col">
			<Header />

			<main className="flex-1">
				<div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
					<h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h1>
					<p className="text-muted-foreground mb-10 text-lg">{t('description')}</p>

					{Object.entries(byCategory).map(([category, options]) => (
						<section
							key={category}
							className="mb-10"
						>
							<h2 className="mb-4 text-xl font-bold">{category}</h2>
							<ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{options.map((option) => (
									<li key={option.key}>
										<Link
											href={`/options/${optionSlug(option.key)}`}
											className="hover:bg-accent block rounded-lg border p-4 transition-colors"
										>
											<code
												dir="ltr"
												className="font-mono text-sm font-semibold"
											>
												{option.key}
											</code>
											<span className="text-muted-foreground ml-2 text-sm">
												{humanizeOptionName(option.key)}
											</span>
											{(() => {
												const resolved = articles.get(option.key);
												return (
													<span
														lang={resolved ? (resolved.isFallback ? 'en' : undefined) : 'en'}
														className="text-muted-foreground mt-1 block text-sm leading-relaxed"
													>
														{resolved ? resolved.article.tagline : option.description}
													</span>
												);
											})()}
										</Link>
									</li>
								))}
							</ul>
						</section>
					))}

					<p className="text-muted-foreground mt-4 text-xs">
						{t('generatedFrom', { version: PRETTIER_SNAPSHOT_VERSION })}
					</p>
				</div>
			</main>

			<Footer />
		</div>
	);
}
