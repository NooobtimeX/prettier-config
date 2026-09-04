/**
 * The editorial layer that sits on top of `StaticPrettierOption`.
 *
 * Prettier's own `description` is one sentence, it is upstream's wording, and it
 * is the same English string on all 20 locales. Rendering it as the body of a
 * page was what made /options/[option] thin enough to trip AdSense's
 * "Low value content" policy. These articles are the site's own explanation —
 * why a default exists, when to move off it, what it costs — and the borrowed
 * sentence is demoted to an attributed quote beside them.
 *
 * Content lives in content/options/<locale>/<optionKey>.ts rather than in
 * common/messages/*.json: i18n/request.ts imports each locale's messages *whole*
 * on every route, so 26 articles per locale would ship on every page load.
 */

/**
 * Prose with `backticks` around identifiers. The renderer splits on the
 * backtick and wraps odd segments in <code>, so authors write plain strings and
 * nothing is ever interpreted as markup — see components/ArticleBody.tsx.
 */
export type InlineText = string;

export type ArticleBlock =
	| { kind: 'p'; text: InlineText }
	| { kind: 'ul'; items: InlineText[] }
	/** A fenced sample. Hand-written, so keep it short and obviously illustrative —
	 *  the authoritative before/after output is generated in `option.examples`. */
	| { kind: 'code'; code: string; caption?: InlineText };

export type ArticleSection = {
	heading: string;
	blocks: ArticleBlock[];
};

export type OptionArticleFaq = {
	question: string;
	answer: InlineText;
};

export type OptionArticle = {
	/**
	 * Completes the h1: `printWidth` — {tagline}. The h1 used to be the bare
	 * identifier, which gave the page no descriptive heading text at all.
	 */
	tagline: string;
	/** Our lede. Replaces Prettier's sentence as the first prose on the page. */
	summary: InlineText;
	sections: ArticleSection[];
	/** Feeds a FAQPage node in the existing JSON-LD @graph. Keep 2-4. */
	faq: OptionArticleFaq[];
};
