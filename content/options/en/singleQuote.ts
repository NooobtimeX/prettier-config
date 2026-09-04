import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'a preference Prettier overrides whenever escaping would suffer',
	summary:
		'`singleQuote` states which quote character you prefer for JavaScript strings. It is a preference rather than a rule: Prettier always picks the quote that produces fewer escape sequences, so a string containing an apostrophe stays double-quoted even with `singleQuote: true`.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'The default is `false`, meaning double quotes. Set it to `true` and Prettier prefers single quotes — but only as a tie-break.',
				},
				{
					kind: 'p',
					text: 'The rule Prettier actually applies is quote minimisation: whichever quote character requires fewer backslash escapes wins, and your preference decides only when the count is equal. This is why a codebase with `singleQuote: true` still contains double-quoted strings, and why that is correct rather than a bug:',
				},
				{
					kind: 'code',
					code: "const plain = 'no quotes inside';\nconst apostrophe = \"it's got one\";",
					caption: 'Both lines are what `singleQuote: true` produces.',
				},
				{
					kind: 'p',
					text: "Escaping the apostrophe to keep the single quotes would produce `'it\\'s got one'`, which is one character longer and materially harder to read. Prettier declines.",
				},
			],
		},
		{
			heading: 'What it does not touch',
			blocks: [
				{
					kind: 'ul',
					items: [
						'JSON and JSON-like files. The format only permits double quotes, so the option is ignored there — including the `prettier` key in `package.json`.',
						'JSX attributes. Those have their own option, `jsxSingleQuote`, because the prevailing convention in JSX markup differs from the one in surrounding JavaScript.',
						'Template literals. Backtick strings are never rewritten to quotes, since that could change behaviour.',
						'Object keys. Whether a key is quoted at all is `quoteProps`; this option only picks which character is used once something is being quoted.',
					],
				},
			],
		},
		{
			heading: 'Why the default is double quotes',
			blocks: [
				{
					kind: 'p',
					text: 'Double quotes are the default largely because they are the safer of the two in English-language content. Apostrophes are common in prose, and user-facing strings are prose more often than not, so double quotes minimise escaping across a typical codebase without anyone having to think about it.',
				},
				{
					kind: 'p',
					text: 'They also match JSON, which means a string copied between a JavaScript file and a JSON file needs no adjustment. Given how much configuration moves between those two formats, that is a small but real convenience.',
				},
				{
					kind: 'p',
					text: 'The counter-argument is habit rather than logic: a large share of the JavaScript ecosystem writes single quotes, and matching it makes your code look ordinary to a contributor arriving from elsewhere. Neither position is wrong, which is exactly why this is an option.',
				},
			],
		},
		{
			heading: 'Trade-offs and team conventions',
			blocks: [
				{
					kind: 'p',
					text: 'This is the cheapest option in Prettier to change and the one least worth arguing about. It has no correctness implications, no performance implications, and no effect on tooling. Pick one in the first week of a project and never revisit it.',
				},
				{
					kind: 'ul',
					items: [
						'If the project is TypeScript-first and modern, `singleQuote: true` matches the majority of what your contributors will have seen.',
						'If the project ships a lot of user-facing English text, the default saves you escapes.',
						'Whichever you pick, expect exceptions in the output. A reviewer who flags a double-quoted string in a single-quote codebase has misunderstood the option, not found a defect.',
					],
				},
			],
		},
		{
			heading: 'ESLint and editors',
			blocks: [
				{
					kind: 'p',
					text: "ESLint's `quotes` rule overlaps directly with this option and will fight it, most visibly on the escape-minimisation cases above. `eslint-config-prettier` disables `quotes` along with the rest of the stylistic set; put it last in your config.",
				},
				{
					kind: 'code',
					code: '{\n  "singleQuote": true,\n  "jsxSingleQuote": false\n}',
					caption: 'The two settings that usually travel together.',
				},
				{
					kind: 'p',
					text: 'That pairing — single quotes in JavaScript, double quotes in JSX — is the most common configuration in React codebases, because JSX attributes read like HTML and HTML attributes are conventionally double-quoted.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Reporting the escape-minimisation behaviour as a bug. It is the documented and intended rule.',
						'Expecting it to change JSX attributes. That is `jsxSingleQuote`.',
						'Expecting it to change JSON. The format forbids single quotes.',
						'Leaving ESLint’s `quotes` rule on, which produces a lint error Prettier will immediately re-create on the next format.',
					],
				},
			],
		},
	],
	faq: [
		{
			question: 'Why is this string still double-quoted with singleQuote enabled?',
			answer:
				'Because it contains an apostrophe or a single quote. Prettier chooses whichever quote character needs fewer escapes and only falls back to your preference on a tie.',
		},
		{
			question: 'Does singleQuote affect JSX?',
			answer:
				'No. JSX attribute quoting is controlled by `jsxSingleQuote`, which defaults to `false` so that JSX keeps the double quotes conventional in HTML.',
		},
		{
			question: 'Does it affect JSON or package.json?',
			answer:
				'No. JSON permits only double quotes, so Prettier leaves them alone regardless of this setting.',
		},
	],
};

export default article;
