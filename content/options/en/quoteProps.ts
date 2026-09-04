import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'when object keys get quoted, and the consistency option most people want',
	summary:
		'`quoteProps` controls when Prettier puts quotes around object property names. The default `as-needed` quotes only the keys that require it, which is minimal but can look ragged when one key in an object forces quotes; `consistent` is the value most teams settle on.',
	sections: [
		{
			heading: 'What the three values do',
			blocks: [
				{
					kind: 'ul',
					items: [
						'`as-needed` (default) — quote a key only when it is not a valid identifier, such as `user-id` or a key with a space.',
						'`consistent` — if any key in the object needs quotes, quote all of them.',
						'`preserve` — leave exactly what you wrote, quoted or not.',
					],
				},
				{
					kind: 'code',
					code: "// as-needed\nconst user = { name: 'Ada', 'user-id': 7 };\n\n// consistent\nconst user = { 'name': 'Ada', 'user-id': 7 };",
					caption: 'The same object under as-needed and consistent.',
				},
			],
		},
		{
			heading: 'Why consistent is often the better choice',
			blocks: [
				{
					kind: 'p',
					text: '`as-needed` produces objects where quoting varies key by key, which reads as accidental even though it is deliberate. In an object of HTTP headers, CSS properties or analytics event names — where hyphens are the norm and a few keys happen to be valid identifiers — the mixed form is genuinely harder to scan than either extreme.',
				},
				{
					kind: 'p',
					text: '`consistent` decides per object rather than globally, so plain objects stay unquoted and only the ones that already contain an awkward key become fully quoted. That is usually what people mean when they say they want quoting to look intentional.',
				},
			],
		},
		{
			heading: 'A number-key trap worth knowing',
			blocks: [
				{
					kind: 'p',
					text: "Numeric keys are the one case where quoting is not purely cosmetic in appearance. `{ 1: 'a' }` and `{ '1': 'a' }` are the same object — property names are strings either way — but Prettier is conservative about rewriting them, because in TypeScript the two can differ in how a type is inferred and in whether a numeric enum or index signature matches.",
				},
				{
					kind: 'p',
					text: 'If you have an object keyed by numbers and the formatting seems not to follow your setting, this is why. Reach for `preserve` on that file if you need exact control.',
				},
			],
		},
		{
			heading: 'The performance myth',
			blocks: [
				{
					kind: 'p',
					text: 'There is a persistent belief that quoted keys are slower, or that they defeat some engine optimisation. They do not. Modern JavaScript engines normalise property names during parsing, and the quoting is gone long before any hidden-class machinery sees it. Choose on legibility alone.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Assuming `consistent` quotes every object in the file. It only quotes objects that already contain a key needing quotes.',
						'Expecting `as-needed` to strip quotes from numeric keys — Prettier is deliberately cautious there.',
						'Confusing this with `singleQuote`, which picks the quote character rather than deciding whether to quote at all.',
						'Leaving ESLint’s `quote-props` rule enabled alongside Prettier.',
					],
				},
			],
		},
	],
	faq: [
		{
			question: 'Which value should I use?',
			answer:
				'`consistent` suits most codebases: plain objects stay clean, and objects containing a hyphenated or awkward key become uniformly quoted instead of mixed.',
		},
		{
			question: 'Are quoted keys slower at runtime?',
			answer:
				'No. Property names are strings regardless, and engines discard the quoting at parse time. Pick on readability.',
		},
		{
			question: 'Why did Prettier not unquote my numeric key?',
			answer:
				'It is deliberately conservative with numeric keys, because in TypeScript the quoted and unquoted forms can affect inference and index-signature matching.',
		},
	],
};

export default article;
