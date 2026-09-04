import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'quote style for JSX attributes, kept separate from your JavaScript strings',
	summary:
		'`jsxSingleQuote` picks the quote character for JSX attribute values. It exists as its own option because JSX markup reads like HTML, and HTML attributes are conventionally double-quoted even in codebases whose JavaScript uses single quotes.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'The default is `false`, so JSX attributes use double quotes. Set it to `true` for single quotes. It governs attribute values only — the JavaScript inside a JSX expression container is formatted by `singleQuote` as normal.',
				},
				{
					kind: 'code',
					code: 'const label = \'Save\';\n\nconst button = (\n  <button\n    type="submit"\n    aria-label={label}\n  >\n    {label}\n  </button>\n);',
					caption: 'The default pairing: single quotes in JS, double quotes in JSX.',
				},
			],
		},
		{
			heading: 'Why it is a separate option',
			blocks: [
				{
					kind: 'p',
					text: 'JSX occupies an awkward middle ground. It is JavaScript syntactically, so one instinct is to format it like the surrounding code. But it is read as markup, and every reader arrives with years of HTML habit in which attributes are double-quoted.',
				},
				{
					kind: 'p',
					text: 'Splitting the decision lets a codebase satisfy both: `singleQuote: true` for the JavaScript, `jsxSingleQuote: false` for the markup. That combination is the most common configuration in React projects and is worth adopting unless you have a reason not to.',
				},
			],
		},
		{
			heading: 'Escaping behaves the same way',
			blocks: [
				{
					kind: 'p',
					text: 'As with `singleQuote`, this is a preference rather than a rule. Prettier still minimises escaping, so an attribute value containing an apostrophe stays double-quoted even with `jsxSingleQuote: true`. A reviewer who flags that has found the intended behaviour, not a bug.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Expecting `singleQuote` to change JSX attributes. It does not; that is this option.',
						'Expecting this option to change the JavaScript inside `{ }` expression containers. It does not; that is `singleQuote`.',
						'Setting both to `true` and finding the markup looks unlike every HTML example your team has ever read.',
					],
				},
			],
		},

		{
			heading: 'Why HTML settled on double quotes',
			blocks: [
				{
					kind: 'p',
					text: 'The convention JSX inherits is older than JSX. HTML has permitted unquoted, single-quoted and double-quoted attribute values since the beginning, but double quotes won decisively, and for a practical reason: attribute values frequently contain apostrophes, in ordinary English text such as `alt="Ada\'s portrait"`. Single quotes would need escaping there constantly.',
				},
				{
					kind: 'p',
					text: 'Because JSX attributes are read as markup, that habit carries across. A `title` or `aria-label` in a React component is prose as often as not, so the same argument that shaped HTML applies unchanged.',
				},
			],
		},
		{
			heading: 'Linters and per-file overrides',
			blocks: [
				{
					kind: 'p',
					text: "ESLint's core `jsx-quotes` rule covers the same ground and will contradict this option if left enabled. `eslint-config-prettier` switches it off along with the rest of the stylistic set; put it last in your flat config so it wins.",
				},
				{
					kind: 'p',
					text: 'If part of your codebase genuinely wants different behaviour — a design-system package with a different house style, say — scope it with an `overrides` block rather than splitting the setting across repositories:',
				},
				{
					kind: 'code',
					code: '{\n  "singleQuote": true,\n  "jsxSingleQuote": false,\n  "overrides": [\n    {\n      "files": "packages/legacy-ui/**/*.jsx",\n      "options": { "jsxSingleQuote": true }\n    }\n  ]\n}',
					caption: 'Scoping the option to one directory.',
				},
			],
		},
		{
			heading: 'It governs attributes, not children',
			blocks: [
				{
					kind: 'p',
					text: 'Only the quoted value of a JSX attribute is affected. Text between tags is a JSX text node, not a string literal, and has no quotes to choose. A quotation mark you type in visible text is a character in the content and stays exactly as written.',
				},
				{
					kind: 'code',
					code: '<button type="submit">\n  She said "hello"\n</button>',
					caption: 'Only the type attribute is governed by this option.',
				},
				{
					kind: 'p',
					text: 'The same applies to string literals inside expression containers — those are ordinary JavaScript and follow `singleQuote`. In one line of JSX you can therefore have two different quote conventions in play, both correct.',
				},
			],
		},
		{
			heading: 'Other template languages are not covered',
			blocks: [
				{
					kind: 'p',
					text: 'Vue, Angular and Svelte templates are HTML rather than JSX, and Prettier formats their attributes as HTML — always double-quoted, with no option to change it. This setting applies to JSX and TSX files only.',
				},
				{
					kind: 'p',
					text: 'That is worth knowing in a repository that mixes React with any of those, because setting `jsxSingleQuote: true` produces single quotes in the React components and leaves everything else double-quoted, which looks less consistent than leaving the default alone.',
				},
			],
		},
	],
	faq: [
		{
			question: 'What is the usual configuration?',
			answer:
				'`singleQuote: true` with `jsxSingleQuote: false` — single quotes in JavaScript, double quotes in JSX attributes, matching HTML convention.',
		},
		{
			question: 'Does it affect expressions inside braces?',
			answer:
				'No. Anything inside a JSX expression container is ordinary JavaScript and follows `singleQuote`.',
		},

		{
			question: 'Does escaping still take priority over my preference?',
			answer:
				'Yes. As with `singleQuote`, Prettier picks whichever quote needs fewer escapes and only uses your preference to break a tie. An attribute containing an apostrophe stays double-quoted even with `jsxSingleQuote: true`.',
		},
	],
};

export default article;
