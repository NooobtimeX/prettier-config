import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'parentheses around a lone arrow parameter, and the edit cost of leaving them off',
	summary:
		'`arrowParens` decides whether a single-parameter arrow function keeps its parentheses. The default `always` writes `(x) => x`; `avoid` writes `x => x`. The argument for the default is not appearance but editability — almost every change you make to that parameter requires the parentheses back.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'It applies to exactly one case: an arrow function with a single parameter and no destructuring, default value or type annotation. Every other arrow already requires parentheses as a matter of syntax.',
				},
				{
					kind: 'code',
					code: '// always (default)\nconst double = (n) => n * 2;\n\n// avoid\nconst double = n => n * 2;',
					caption: 'The only case the option affects.',
				},
			],
		},
		{
			heading: 'Why the default is always',
			blocks: [
				{
					kind: 'p',
					text: 'Because the parentheses-free form is a local optimum that you keep having to undo. Consider the ways a lone parameter commonly changes:',
				},
				{
					kind: 'ul',
					items: [
						'Adding a type annotation — `(n: number) => n * 2` — requires parentheses.',
						'Adding a default value — `(n = 1) => n * 2` — requires parentheses.',
						'Destructuring it — `({ id }) => id` — requires parentheses.',
						'Adding a second parameter requires parentheses.',
						'Adding a leading comment or a decorator requires parentheses.',
					],
				},
				{
					kind: 'p',
					text: 'Each of those edits therefore touches the parameter and its punctuation, producing a slightly noisier diff than the change deserves. `always` pays two characters up front so that none of those edits ever costs more than the change itself.',
				},
				{
					kind: 'p',
					text: 'The effect is strongest in TypeScript, where adding a type to a callback parameter is a routine edit rather than a rare one.',
				},
			],
		},
		{
			heading: 'The case for avoid',
			blocks: [
				{
					kind: 'p',
					text: '`avoid` reads better in dense functional code. A chain of small transformations — `items.map(x => x.id).filter(id => id != null)` — is genuinely lighter without the parentheses, and if your codebase is full of one-line callbacks that argument carries real weight.',
				},
				{
					kind: 'p',
					text: 'It is also the older convention: a lot of JavaScript written between roughly 2016 and 2019 omits them, so matching it can make a codebase feel consistent with its own history.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Expecting `avoid` to strip parentheses from every arrow. It only affects the single-plain-parameter case; all others are syntactically required.',
						'Choosing `avoid` in a TypeScript codebase and then fighting it every time a parameter needs a type.',
						'Leaving ESLint’s `arrow-parens` rule enabled alongside Prettier, which produces a rule that can never be satisfied.',
					],
				},
			],
		},
		{
			heading: 'The default changed in Prettier 2.0',
			blocks: [
				{
					kind: 'p',
					text: 'Prettier 1.x defaulted to `avoid`, so a great deal of code written in that era has bare single parameters. Prettier 2.0 changed the default to `always`, and the reasoning given was precisely the edit-cost argument above: the parentheses-free form has to be undone by most of the changes people actually make to a parameter.',
				},
				{
					kind: 'p',
					text: 'If you are upgrading a project that has been pinned to Prettier 1 and you see every short arrow function change, this is the cause. Setting `"arrowParens": "avoid"` reproduces the old output exactly and lets you take the version bump without the reformat.',
				},
			],
		},
		{
			heading: 'Why TypeScript pushes harder toward always',
			blocks: [
				{
					kind: 'p',
					text: 'In JavaScript a callback parameter usually stays bare for its whole life. In TypeScript it frequently does not: an implicit `any` gets flagged, an inference fails, a signature changes, and a type annotation appears. Every one of those edits requires the parentheses.',
				},
				{
					kind: 'p',
					text: 'With `strict` and `noImplicitAny` enabled — which is the default for new TypeScript projects — the compiler actively pushes you toward annotating parameters that are not contextually typed. `avoid` then means a steady trickle of diffs where the punctuation changes alongside the type.',
				},
				{
					kind: 'code',
					code: '// before\nconst byId = (u) => u.id;\n\n// after adding a type\nconst byId = (u: User) => u.id;',
					caption: 'The edit that keeps forcing parentheses back.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Why does Prettier keep the parentheses even with avoid set?',
			answer:
				'Because that particular arrow is not the single-plain-parameter case. Type annotations, default values, destructuring, rest parameters and multiple parameters all require parentheses as syntax.',
		},
		{
			question: 'Which should a TypeScript project choose?',
			answer:
				'`always` is the better fit. Annotating a callback parameter is a routine edit in TypeScript, and each one would otherwise have to add the parentheses back.',
		},
	],
};

export default article;
