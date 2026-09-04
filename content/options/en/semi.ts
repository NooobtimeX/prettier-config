import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'semicolons, and the ASI hazards behind the default',
	summary:
		"`semi` decides whether Prettier ends statements with a semicolon. The default is `true`, and the reason is not aesthetic: JavaScript's automatic semicolon insertion has a small number of genuinely surprising failure cases, and printing semicolons removes them from consideration entirely.",
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'With `semi: true` — the default — Prettier terminates every statement that can take a semicolon. With `semi: false` it omits them, except where leaving one out would change what the program means.',
				},
				{
					kind: 'p',
					text: 'That exception is the whole story. JavaScript does not actually require semicolons, because the parser inserts them for you under a rule called automatic semicolon insertion, or ASI. ASI works by noticing that the next token cannot continue the current statement and closing the statement off. It is right almost always, and wrong in a handful of cases that bite hard.',
				},
				{
					kind: 'p',
					text: 'The classic failure is a line that begins with a bracket or a parenthesis. The parser reads it as a continuation of the previous line — an index access, or a function call — rather than as a new statement:',
				},
				{
					kind: 'code',
					code: 'const value = compute()\n[1, 2, 3].forEach(run)\n\n// parsed as:\nconst value = compute()[1, 2, 3].forEach(run)',
					caption: 'Without a semicolon, the second line is parsed as an index into `value`.',
				},
			],
		},
		{
			heading: 'What Prettier does when you turn semicolons off',
			blocks: [
				{
					kind: 'p',
					text: '`semi: false` is safe in Prettier in a way that hand-written semicolon-free code is not. When a line would otherwise start with a character that continues the previous statement, Prettier prefixes it with a defensive semicolon:',
				},
				{
					kind: 'code',
					code: 'const value = compute()\n;[1, 2, 3].forEach(run)',
					caption: 'The leading semicolon is inserted by Prettier, not by you.',
				},
				{
					kind: 'p',
					text: 'The characters that trigger this are `[`, `(`, a backtick, `+`, `-`, `/`, and a couple of rarer ones. You will see those leading semicolons in any semicolon-free codebase that uses Prettier. They look odd at first and they are not optional — removing one by hand reintroduces exactly the bug the style was supposed to avoid.',
				},
			],
		},
		{
			heading: 'Why the default is true',
			blocks: [
				{
					kind: 'p',
					text: "Prettier's defaults lean towards the option that needs the least explanation to a newcomer, and semicolons win that test. A reader who has never heard of ASI can read semicolon-terminated code correctly; the reverse is not true, because the leading-semicolon idiom is genuinely confusing until someone explains it.",
				},
				{
					kind: 'p',
					text: 'There is also a smaller, practical argument. Semicolons make each statement self-delimiting, so a line moved, duplicated or reordered by an editor or a merge stays valid. Without them, moving a line can silently join it to its new neighbour.',
				},
			],
		},
		{
			heading: 'When to choose false',
			blocks: [
				{
					kind: 'p',
					text: 'The case for `semi: false` is real. Semicolons carry no information a formatter cannot supply, and a codebase without them is measurably less dense on screen. Several large ecosystems — the `standard` style, much of the Vue and Nuxt world — settled on omitting them, so a project in that orbit will feel more at home matching its neighbours.',
				},
				{
					kind: 'ul',
					items: [
						'Choose `false` if your team already writes this way, or your framework community does. Consistency with the code your contributors read elsewhere is worth more than the marginal safety.',
						'Choose `true` if you have contributors at mixed experience levels, or if the codebase is long-lived and you would rather not explain leading semicolons in review.',
						'Do not choose based on typing effort. Prettier writes them; you never type one.',
					],
				},
			],
		},
		{
			heading: 'ESLint, TypeScript and CI',
			blocks: [
				{
					kind: 'p',
					text: 'ESLint has both a `semi` rule and a `no-unexpected-multiline` rule, and the first will fight Prettier if both are active. Disable the stylistic rules with `eslint-config-prettier`, placed last in your config, and let Prettier own the decision.',
				},
				{
					kind: 'p',
					text: '`no-unexpected-multiline` is the interesting one and worth keeping if it survives your config: it catches the ASI hazards above at lint time rather than at runtime. It is not a formatting rule, so it does not conflict.',
				},
				{
					kind: 'p',
					text: 'TypeScript is unaffected by this setting — semicolons are optional there for the same reasons and with the same hazards. Class property declarations are the one place where the emitted punctuation differs slightly between the two settings, and Prettier handles that for you.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Deleting the leading semicolons Prettier inserts under `semi: false`. They are load-bearing.',
						'Leaving ESLint’s `semi` rule enabled alongside Prettier, which produces an unfixable loop where each tool undoes the other.',
						'Flipping the setting on a mature codebase without a dedicated reformat commit — it touches nearly every line in the project.',
						'Assuming `semi: false` means no semicolons appear anywhere. `for` loops still need theirs; they are syntax, not statement terminators.',
					],
				},
			],
		},
	],
	faq: [
		{
			question: 'Is semi: false actually dangerous?',
			answer:
				'Not when Prettier is the thing writing your code. Prettier inserts a defensive leading semicolon on any line that would otherwise be misparsed. The danger is in hand-written semicolon-free code, or in editing Prettier output by hand and removing one of those leading semicolons.',
		},
		{
			question: 'Why does my file start a line with a semicolon?',
			answer:
				'Because that line begins with `[`, `(`, a backtick or an operator, and without the semicolon JavaScript would join it to the previous statement. Prettier added it deliberately under `semi: false`.',
		},
		{
			question: 'Does this option affect TypeScript, JSON or CSS?',
			answer:
				'It applies to JavaScript and TypeScript. JSON has no statements and is unaffected. CSS declarations always end in a semicolon as a matter of syntax, so the option does not apply there either.',
		},
	],
};

export default article;
