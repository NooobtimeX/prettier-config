import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'the option that exists to make diffs smaller',
	summary:
		'`trailingComma` decides whether Prettier leaves a comma after the last item of a multi-line list. It looks like pure punctuation and is really about version control: with a trailing comma, adding an item to a list changes one line instead of two.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'The values are `all` (the default since Prettier 3), `es5`, and `none`. They apply only when a construct is already broken across multiple lines — Prettier never leaves a dangling comma on a single-line list.',
				},
				{
					kind: 'ul',
					items: [
						'`all` — trailing commas everywhere they are legal, including function parameters and call arguments.',
						'`es5` — only where ES5 allowed them: arrays and object literals. Function arguments are left alone.',
						'`none` — never.',
					],
				},
			],
		},
		{
			heading: 'Why this matters for diffs',
			blocks: [
				{
					kind: 'p',
					text: 'Without a trailing comma, appending to a list has to modify the previous last line in order to add its comma. The diff therefore shows two changed lines: one genuinely new, one changed only in punctuation.',
				},
				{
					kind: 'code',
					code: "  const roles = [\n-   'editor'\n+   'editor',\n+   'admin'\n  ];",
					caption: 'Without trailing commas — two lines change to add one item.',
				},
				{
					kind: 'code',
					code: "  const roles = [\n    'editor',\n+   'admin',\n  ];",
					caption: 'With trailing commas — one line changes.',
				},
				{
					kind: 'p',
					text: 'Across a codebase this compounds. Review diffs are smaller, `git blame` attributes each item to the commit that actually introduced it rather than to whoever added the next one, and merge conflicts on concurrent additions to the same list become rarer.',
				},
			],
		},
		{
			heading: 'Why the default changed to all',
			blocks: [
				{
					kind: 'p',
					text: 'Prettier 2 defaulted to `es5`, because trailing commas in function parameters and call arguments were an ES2017 feature and older environments choked on them. Prettier 3 changed the default to `all`, on the grounds that every runtime and build tool in current use has supported it for years.',
				},
				{
					kind: 'p',
					text: 'If you upgraded from Prettier 2 and saw a large unexpected reformat, this is almost certainly the cause. Pinning `"trailingComma": "es5"` restores the old output exactly.',
				},
			],
		},
		{
			heading: 'When to choose something other than all',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Choose `es5` if you ship untranspiled source to environments you do not control, or if a downstream tool in your pipeline parses JavaScript with an older parser.',
						'Choose `es5` when upgrading from Prettier 2 and you want the version bump separated from the reformat. You can move to `all` later as its own commit.',
						'Choose `none` essentially never. It optimises for a constraint that no longer exists and gives up the diff benefit.',
					],
				},
				{
					kind: 'p',
					text: 'JSON is unaffected in all cases: the format forbids trailing commas, and Prettier will not emit one no matter what this option says.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Blaming the Prettier 3 upgrade for a mysterious whole-repo diff without realising this default changed.',
						'Expecting trailing commas on single-line lists. They only appear when the construct is already multi-line.',
						'Assuming it applies to JSON or JSONC configuration files. It does not.',
						'Leaving ESLint’s `comma-dangle` rule enabled, which will contradict this option — disable it with `eslint-config-prettier`.',
					],
				},
			],
		},
	],
	faq: [
		{
			question: 'Why did upgrading to Prettier 3 reformat my whole project?',
			answer:
				'The default changed from `es5` to `all`, so trailing commas appeared in every multi-line function parameter list and call. Setting `"trailingComma": "es5"` reproduces the Prettier 2 output.',
		},
		{
			question: 'Is a trailing comma valid in JSON?',
			answer:
				'No, and Prettier will not emit one in `.json` files regardless of this setting. JSON5 and JSONC do allow them.',
		},
		{
			question: 'Does it add commas to single-line lists?',
			answer:
				'No. Trailing commas are only added when the construct is already split across multiple lines.',
		},
	],
};

export default article;
