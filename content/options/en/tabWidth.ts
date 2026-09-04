import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'how wide one indentation level is, in columns',
	summary:
		'`tabWidth` sets how many columns one level of indentation occupies. With the default `useTabs: false` it is literally the number of spaces Prettier emits per level; with tabs enabled it becomes the width a tab is assumed to render as, which is what `printWidth` measures against.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'The default is `2`. Every nesting level — a function body, an object literal, a JSX child — is indented by one unit of `tabWidth`.',
				},
				{
					kind: 'p',
					text: 'The subtlety is that this option has two different jobs depending on `useTabs`. With spaces, it decides what Prettier writes: `tabWidth: 4` emits four spaces. With tabs, Prettier writes one tab character regardless, and `tabWidth` becomes an assumption about how wide that tab will look — used purely so that line-width measurement is accurate.',
				},
				{
					kind: 'p',
					text: 'That second role matters more than it sounds, because indentation counts toward `printWidth`. A deeply nested line at `tabWidth: 4` has half the remaining budget of the same line at `tabWidth: 2`, so raising this option quietly makes your code wrap sooner.',
				},
			],
		},
		{
			heading: 'Why the default is 2',
			blocks: [
				{
					kind: 'p',
					text: "Two spaces is the prevailing convention in JavaScript and has been since well before Prettier existed — it is what Node, React, Vue and the majority of npm packages use. Prettier's defaults generally follow the ecosystem rather than trying to correct it.",
				},
				{
					kind: 'p',
					text: 'There is a structural argument too. JavaScript nests deeply: a callback inside a method inside a class inside a module is four levels before any real code appears. At four spaces per level that is sixteen columns of the eighty available, spent on whitespace. Two keeps more of the line for content.',
				},
			],
		},
		{
			heading: 'When to change it',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Match the surrounding ecosystem when your project is not primarily JavaScript. Python projects that also contain JS often standardise on `4`; PHP and C# codebases usually do too.',
						'Raise it to `4` if your team finds two-space indentation hard to scan. This is a genuine accessibility consideration for some readers, not merely taste.',
						'Consider `useTabs: true` instead of raising it. Tabs let each reader choose their own width, which serves both preferences at once — see below.',
						'Leave it alone if you have no specific reason. It is the option with the largest reformat cost relative to the benefit of changing it.',
					],
				},
			],
		},
		{
			heading: 'Its relationship with .editorconfig',
			blocks: [
				{
					kind: 'p',
					text: 'Prettier reads `.editorconfig` when one is present and no explicit Prettier setting overrides it. `indent_size` maps to `tabWidth` and `indent_style` maps to `useTabs`, which means an `.editorconfig` you have forgotten about can silently determine your formatting.',
				},
				{
					kind: 'code',
					code: 'root = true\n\n[*]\nindent_style = space\nindent_size = 2',
					caption: 'An .editorconfig that Prettier will honour.',
				},
				{
					kind: 'p',
					text: 'If your formatting does not match your `.prettierrc`, this file is the first place to look. An explicit value in the Prettier config always wins; the ambiguity only exists when the Prettier config is silent.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Expecting `tabWidth` to change the character emitted. It only changes the count, unless `useTabs` is on — then it changes nothing that is written to disk.',
						'Setting it without noticing the knock-on effect on `printWidth`. Wider indentation means earlier wrapping.',
						'Fighting an `.editorconfig` that is quietly supplying the value.',
						'Changing it alongside real work, which makes the diff unreviewable — do it in its own commit and add that commit to `.git-blame-ignore-revs`.',
					],
				},
			],
		},
	],
	faq: [
		{
			question: 'Does tabWidth do anything when useTabs is true?',
			answer:
				'Yes, but nothing that reaches the file. Prettier writes one tab per level either way; `tabWidth` tells it how many columns to assume that tab occupies so line-width measurement against `printWidth` is correct.',
		},
		{
			question: 'Why is my indentation not what I configured?',
			answer:
				'Most often an `.editorconfig` file is supplying `indent_size` and your Prettier config is silent on `tabWidth`. An explicit Prettier setting takes precedence.',
		},
		{
			question: 'Should I use 2 or 4?',
			answer:
				'Two matches the JavaScript ecosystem and leaves more of each line for code. Four is easier for some readers to scan and matches other language communities. If the team is split, `useTabs: true` lets each reader pick their own.',
		},
	],
};

export default article;
