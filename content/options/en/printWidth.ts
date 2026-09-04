import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'the width Prettier aims for, not a hard limit',

	summary:
		'`printWidth` is the Prettier option people misread most often. It is not a maximum line length that Prettier promises never to exceed — it is the width the printer measures against when deciding whether an expression still fits on one line. Prettier will happily emit a longer line when there is no legal way to break it, and it will break a line well short of the limit when the structure demands it.',

	sections: [
		{
			heading: 'What printWidth actually controls',
			blocks: [
				{
					kind: 'p',
					text: 'Prettier does not format by counting characters and inserting newlines. It parses your code into an intermediate representation made of groups, then asks each group one question: does this fit in the space remaining on the current line? `printWidth` is the number that question is measured against. A group that fits is printed flat. A group that does not is broken open, and every group inside it is asked the same question again at the new indentation.',
				},
				{
					kind: 'p',
					text: 'This is why raising `printWidth` does not simply make your lines longer. It changes where whole structures collapse or expand. An object literal, a function signature, a chain of method calls — each flips between one-per-line and all-on-one-line at some threshold, and the reformat that follows a change to this option is usually far larger than the size of the change suggests.',
				},
				{
					kind: 'p',
					text: 'Three consequences follow directly, and each of them surprises somebody:',
				},
				{
					kind: 'ul',
					items: [
						'A long string literal, an import path, or a URL inside a comment will run past `printWidth`. Prettier will not break a string for you, because doing so would change the value.',
						'A deeply nested expression can break far short of `printWidth`, because the indentation is counted as part of the width. At eight levels deep you may have only forty columns of usable space left.',
						'Prose in Markdown is not governed by this option at all — that is `proseWrap`. `printWidth` only bounds the code Prettier prints.',
					],
				},
			],
		},
		{
			heading: 'Why the default is 80',
			blocks: [
				{
					kind: 'p',
					text: 'Eighty columns is an inheritance from the punched card, which held eighty characters, and then from the terminals that imitated it. It has outlived both, and it survives for two reasons that still hold.',
				},
				{
					kind: 'p',
					text: 'The first is legibility. Typographers have long put the comfortable measure for continuous text somewhere near sixty to ninety characters; much wider and the eye loses its place returning to the start of the next line. Code is not prose, but it is still read left to right by the same eye.',
				},
				{
					kind: 'p',
					text: 'The second is diffs, and it is the argument that matters most in a team. A narrow width forces more line breaks, and more line breaks make smaller changes. When each argument to a function sits on its own line, changing one argument touches exactly one line — so the review shows one line, `git blame` attributes one line, and a merge conflict involves one line. Widen the limit until that call collapses onto a single line, and every one of those operations now covers the whole call.',
				},
			],
		},
		{
			heading: 'When to change it, and when not to',
			blocks: [
				{
					kind: 'p',
					text: 'The honest answer is that 80 is a good default and most projects should leave it alone. The cases for raising it are real but narrower than they first appear.',
				},
				{
					kind: 'p',
					text: 'Raise it when the language itself is verbose enough that 80 columns leaves no room for content. Deeply generic TypeScript, JSX with many props, and code with long descriptive identifiers all spend their width on syntax before they reach anything meaningful. `100` is the usual first step and is a defensible default for a modern TypeScript codebase; `120` suits wide monitors and single-file review, at real cost to side-by-side diffs.',
				},
				{
					kind: 'p',
					text: 'Do not raise it to silence a linter. If `max-len` is complaining, the fix is to stop `max-len` running at all — see below. Raising `printWidth` to match a lint rule couples two settings that answer different questions, and you will change one and forget the other.',
				},
				{
					kind: 'code',
					caption: 'A common choice for TypeScript projects with long type names.',
					code: '{\n  "printWidth": 100\n}',
				},
			],
		},
		{
			heading: 'Trade-offs and team conventions',
			blocks: [
				{
					kind: 'p',
					text: 'Whatever you pick, pick it once. The cost of this option is almost entirely in changing it, not in its value: every change reformats a large fraction of the codebase, which buries real history under a formatting commit.',
				},
				{
					kind: 'ul',
					items: [
						'Change it in a dedicated commit that does nothing else, so reviewers can skip it and `git blame` can be taught to skip it too.',
						'Add that commit to a `.git-blame-ignore-revs` file and point `blame.ignoreRevsFile` at it, so authorship survives the reformat.',
						'Consider how your team reviews code. Side-by-side diffs on a laptop give each side roughly half the window — a 120-column setting will wrap in the review tool even though it fits in the editor.',
						'Check the narrowest place the code is read, not the widest place it is written.',
					],
				},
			],
		},
		{
			heading: 'ESLint, editors and CI',
			blocks: [
				{
					kind: 'p',
					text: "ESLint's `max-len` rule and `printWidth` will contradict each other, because `max-len` is a hard limit and `printWidth` is not. A line Prettier cannot legally break — a long string, a long import — will pass Prettier and fail ESLint forever.",
				},
				{
					kind: 'p',
					text: 'The fix is `eslint-config-prettier`, which turns off every ESLint rule that overlaps with formatting, `max-len` included. Put it last in your config so it wins:',
				},
				{
					kind: 'code',
					caption: 'eslint.config.mjs — the Prettier config goes last.',
					code: "import prettier from 'eslint-config-prettier';\n\nexport default [\n  // ...your rules\n  prettier,\n];",
				},
				{
					kind: 'p',
					text: 'In your editor, set a visual ruler at the same number so the limit is visible while you type — `editor.rulers` in VS Code. The ruler is a hint, not a rule; Prettier remains the only thing that decides where a line actually breaks.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Treating it as a guarantee. It is a target. Lines will exceed it, and that is correct behaviour rather than a bug to report.',
						'Setting it to match `max-len` instead of disabling `max-len`. Two sources of truth for one decision.',
						'Changing it on a large codebase in a commit that also contains real work, which makes the real work unreviewable.',
						'Expecting it to wrap Markdown paragraphs. Reach for `proseWrap` instead.',
						'Tuning it per file with overrides, which produces a codebase that looks inconsistent for no benefit a reader can perceive.',
					],
				},
			],
		},
	],

	faq: [
		{
			question: 'Does printWidth guarantee that no line exceeds it?',
			answer:
				'No. Prettier treats it as the width to aim for, not a ceiling. When there is no legal break point — inside a string literal, a long import path, a URL in a comment — the line will be longer, and no setting changes that.',
		},
		{
			question: 'What value should I choose?',
			answer:
				'Leave it at `80` unless you have a concrete reason not to. `100` is the common step up for TypeScript codebases with long type names; `120` suits wide screens but degrades side-by-side review. The value matters much less than picking one and not revisiting it.',
		},
		{
			question: 'Why did changing printWidth reformat so much of my code?',
			answer:
				'Because it does not lengthen lines, it changes which structures fit. Every object, argument list and call chain that sat near the old threshold flips between expanded and collapsed. Land the change as its own commit and add it to `.git-blame-ignore-revs`.',
		},
		{
			question: 'How does printWidth interact with tabWidth?',
			answer:
				'Indentation counts toward the measured width, and a tab is counted as `tabWidth` columns. Raising `tabWidth` therefore leaves less room for code on deeply nested lines, effectively tightening `printWidth` where nesting is deepest.',
		},
	],
};

export default article;
