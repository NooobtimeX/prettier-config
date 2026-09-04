import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
	STATIC_PRETTIER_OPTIONS,
	PRETTIER_SNAPSHOT_VERSION,
} from '@/lib/generated/prettierOptions';
import { IGNORED_OPTION_KEYS } from '@/lib/adaptSupportInfo';
import { humanizeOptionName } from '@/lib/humanizeOptionName';
import type { StaticPrettierOption } from '@/common/interface/StaticPrettierOption';
import { optionSlug } from '@/lib/optionRoutes';
import { resolveOptionArticle } from '@/lib/optionArticle';

/**
 * Server-rendered reference for every Prettier option.
 *
 * The whole point is that this is NOT a client component. The interactive
 * option grid is populated from jsDelivr inside a useEffect, so before this
 * existed the home page shipped ~53 crawlable words — all of it header and
 * footer chrome — and not one Prettier option name. Every option name,
 * default and description now reaches Googlebot on the first pass.
 *
 * Each card now shows our own one-line description, taken from that option's
 * article, and links to it. Previously it printed Prettier's `description`
 * verbatim — the same 251 words that appeared on /options and again on every
 * option page, which is precisely the replicated content AdSense flagged.
 * Where no article exists yet we still fall back to upstream's sentence, marked
 * `lang="en"` so the run is honest inside e.g. <html lang="ja">.
 */

function formatDefault(value: StaticPrettierOption['default']): string {
	if (value === null || value === '') return '—';
	if (Array.isArray(value)) return value.length === 0 ? '[]' : `[${value.join(', ')}]`;
	return typeof value === 'string' ? `"${value}"` : String(value);
}

export default async function OptionReference({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: 'Page.optionReference' });

	const options = STATIC_PRETTIER_OPTIONS.filter((o) => !IGNORED_OPTION_KEYS.has(o.key));

	// Build-time only: these resolve to static imports that Node caches across
	// all 20 locales, so this is 26 module loads for the whole build.
	const articles = new Map(
		await Promise.all(
			options.map(async (o) => [o.key, await resolveOptionArticle(locale, o.key)] as const),
		),
	);

	return (
		<section
			aria-labelledby="option-reference-heading"
			className="mx-auto mt-12 w-full max-w-3xl px-4 pb-8"
		>
			<h2
				id="option-reference-heading"
				className="mb-2 text-2xl font-bold"
			>
				{t('title')}
			</h2>
			<p className="text-muted-foreground mb-8 text-sm leading-relaxed">
				{t('intro', { version: PRETTIER_SNAPSHOT_VERSION })}
			</p>

			<div className="space-y-6">
				{options.map((option) => (
					<article
						// Anchor so the FAQ, llms.txt and external links can deep-link a
						// single option, and so Google can surface it as a sitelink.
						id={`option-${option.key}`}
						key={option.key}
						className="rounded-lg border p-5"
					>
						<h3 className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
							{/* Both spellings deliberately: `printWidth` is what people type
							    into Google, `Print Width` is what the UI shows. Before this,
							    the camelCase key appeared nowhere as text on the whole site. */}
							<Link
								href={`/options/${optionSlug(option.key)}`}
								className="hover:bg-accent rounded transition-colors"
							>
								<code
									dir="ltr"
									className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm font-semibold underline-offset-2 hover:underline"
								>
									{option.key}
								</code>
							</Link>
							<span className="text-muted-foreground text-sm font-medium">
								{humanizeOptionName(option.key)}
							</span>
						</h3>

						{(() => {
							const resolved = articles.get(option.key);
							return (
								<p
									lang={resolved ? (resolved.isFallback ? 'en' : undefined) : 'en'}
									className="text-muted-foreground mb-3 text-sm leading-relaxed"
								>
									{resolved ? resolved.article.tagline : option.description}
								</p>
							);
						})()}

						<dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
							<div className="flex gap-2">
								<dt className="text-muted-foreground shrink-0">{t('defaultLabel')}</dt>
								{/* dir="ltr" on every code run: ar and fa render <html dir="rtl">,
								    and without isolation `--no-semi` puts its dashes on the wrong side. */}
								<dd>
									<code
										dir="ltr"
										className="font-mono"
									>
										{formatDefault(option.default)}
									</code>
								</dd>
							</div>
							<div className="flex gap-2">
								<dt className="text-muted-foreground shrink-0">{t('cliLabel')}</dt>
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
								<div className="flex gap-2 sm:col-span-2">
									<dt className="text-muted-foreground shrink-0">{t('valuesLabel')}</dt>
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
					</article>
				))}
			</div>
		</section>
	);
}
