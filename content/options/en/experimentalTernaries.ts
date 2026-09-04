import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: "an opt-in answer to Prettier's longest-running formatting argument",
	summary:
		'`experimentalTernaries` switches on an alternative layout for conditional expressions, sometimes called curious ternaries, in which the question mark sits at the end of the condition line rather than at the start of the consequent. It is opt-in and still labelled experimental, but it addresses a genuinely unresolved problem.',
	sections: [
		{
			heading: 'The problem it is trying to solve',
			blocks: [
				{
					kind: 'p',
					text: "How to format a nested ternary is the oldest open argument in Prettier's issue tracker. The difficulty is that a chain of conditionals is logically a flat list of cases, but syntactically a right-nested tree, and the two views want different indentation.",
				},
				{
					kind: 'p',
					text: 'The conventional formatting indents each level, so a chain of four conditions marches steadily to the right even though the cases are peers. Flattening it reads better but misrepresents the syntax, and every attempt to do so has broken some other case.',
				},
			],
		},
		{
			heading: 'What the option changes',
			blocks: [
				{
					kind: 'p',
					text: 'With the option enabled, the `?` moves to the end of the condition and the branches align beneath it:',
				},
				{
					kind: 'code',
					code: "const label =\n  count === 0 ?\n    'none'\n  : count === 1 ?\n    'one'\n  : 'many';",
					caption: 'experimentalTernaries: true',
				},
				{
					kind: 'p',
					text: 'The claim is that the condition now reads as a question ending in a question mark, and that the `:` at the start of each following line makes the branches scan as a list of alternatives. Chained conditionals stay flat instead of stepping rightwards.',
				},
			],
		},
		{
			heading: 'Whether to adopt it',
			blocks: [
				{
					kind: 'ul',
					items: [
						'It is genuinely easier to read for chains of three or more conditions, which is where the old formatting hurts most.',
						'It looks unfamiliar. Nobody arriving at your codebase will have seen it before, and initial reactions are frequently negative.',
						'It is still marked experimental, which means the exact output may change between releases and reformat your code again.',
						'It is all or nothing for the project — there is no way to apply it only to long chains.',
					],
				},
				{
					kind: 'p',
					text: 'A reasonable position is to leave it off in shared codebases until it loses the experimental label, and to try it in a personal project first so you have an informed opinion when it stabilises.',
				},
			],
		},
		{
			heading: 'The alternative worth considering first',
			blocks: [
				{
					kind: 'p',
					text: 'If nested ternaries are hurting, the formatting may not be the real problem. An early-return function, a lookup object keyed by the discriminant, or a `switch` will usually read better than any layout of a four-deep conditional. This option makes bad ternaries more legible; it does not make them good.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Enabling it in a shared repository without discussion. It is the most visually surprising option in Prettier.',
						'Treating experimental as merely cautious labelling. The output really can change between minor releases.',
						'Reaching for it instead of restructuring genuinely convoluted conditional logic.',
					],
				},
			],
		},
		{
			heading: 'Where the name comes from',
			blocks: [
				{
					kind: 'p',
					text: 'The layout is often called the curious ternary, a name from the discussion that produced it. The idea is that the condition should end with its question mark — reading as an actual question — and the branches below it should read as the possible answers.',
				},
				{
					kind: 'p',
					text: "The design was worked through over an unusually long and well-documented debate in Prettier's issue tracker, with a great many proposed layouts tested against real code. The experimental label reflects that the winner is still being validated in the wild rather than that it was chosen carelessly.",
				},
			],
		},
		{
			heading: 'How it behaves on a single, simple ternary',
			blocks: [
				{
					kind: 'p',
					text: 'Most of the discussion concerns nested conditionals, but the option applies to every ternary. A short one that fits on a line is unaffected — there is nothing to lay out. A single ternary that has to break gains the new shape:',
				},
				{
					kind: 'code',
					code: "const message =\n  hasUnsavedChanges ?\n    'You have unsaved changes'\n  : 'All changes saved';",
					caption: 'One conditional, broken, with the option enabled.',
				},
				{
					kind: 'p',
					text: 'Whether that reads better than the conventional form is genuinely a matter of taste when there is only one condition. The argument for it strengthens as the chain lengthens, which is why teams that adopt it tend to do so after hitting a three- or four-deep conditional they could not make legible any other way.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Is it safe to use in production code?',
			answer:
				'The output is valid and correct. The risk is churn: the option is experimental, so its exact layout may change in a future release and reformat those expressions again.',
		},
		{
			question: 'Can I enable it only for nested ternaries?',
			answer:
				'No. It applies to every conditional expression in the files it covers. You can scope it to particular files with an `overrides` block.',
		},
	],
};

export default article;
