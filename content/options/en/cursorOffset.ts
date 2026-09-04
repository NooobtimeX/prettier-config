import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'the option that stops format-on-save losing your place',
	summary:
		'`cursorOffset` tells Prettier where your caret is, and Prettier reports back where that same position ended up after formatting. It is the small piece of machinery that makes format-on-save feel invisible instead of infuriating.',
	sections: [
		{
			heading: 'The problem it solves',
			blocks: [
				{
					kind: 'p',
					text: "Formatting rewrites the text of a file, so every character offset after the first change moves. If an editor simply replaced the buffer with Prettier's output, your caret would stay at the same numeric offset and therefore end up somewhere else entirely — a few lines off, mid-token, in a different function.",
				},
				{
					kind: 'p',
					text: 'On a file that reformats heavily the drift is dramatic, and it is the difference between format-on-save being pleasant and being unusable.',
				},
			],
		},
		{
			heading: 'How it works',
			blocks: [
				{
					kind: 'p',
					text: "You pass the caret's current offset; Prettier tracks that point through the transformation and returns its new position. Through the API you use `formatWithCursor`, which returns both the formatted text and the moved cursor:",
				},
				{
					kind: 'code',
					code: "import * as prettier from 'prettier';\n\nconst { formatted, cursorOffset } = await prettier.formatWithCursor(source, {\n  parser: 'typescript',\n  cursorOffset: 142,\n});",
					caption: 'What an editor integration actually calls.',
				},
				{
					kind: 'p',
					text: "The returned offset is the position in the new text corresponding to where you were in the old one. The editor writes `formatted` into the buffer and moves the caret to `cursorOffset`, and from the user's point of view nothing moved at all.",
				},
				{
					kind: 'p',
					text: 'On the command line the option exists too, but the result is printed to standard error rather than returned, since there is no caret for the CLI to restore.',
				},
			],
		},
		{
			heading: 'Why you will probably never set it',
			blocks: [
				{
					kind: 'p',
					text: 'This is an integration option. Every editor plugin worth using already passes it, so the behaviour you actually want is on by default and invisible.',
				},
				{
					kind: 'ul',
					items: [
						'Do not put it in `.prettierrc`. A fixed offset in a config file is meaningless — it would claim your caret is always at the same position in every file.',
						'Do reach for it if you are writing a formatter integration, a code-mod tool, or anything that reformats a buffer a human is editing.',
						'Combine it with `rangeStart` and `rangeEnd` for a Format Selection command that both narrows the work and preserves the caret.',
					],
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Calling `format` instead of `formatWithCursor` and wondering why no cursor is returned.',
						'Setting it in a configuration file, where it has no sensible meaning.',
						'Assuming the returned offset equals the one you passed. Its whole purpose is that it usually differs.',
						'Passing a byte offset rather than a character offset on non-ASCII source.',
					],
				},
			],
		},
		{
			heading: 'Why the offset moves so much',
			blocks: [
				{
					kind: 'p',
					text: 'It is tempting to assume the caret drifts only by the number of characters added or removed before it. In a reformat that is rarely true, because indentation changes on every line between the start of the file and the caret, and each of those changes shifts the offset.',
				},
				{
					kind: 'p',
					text: 'Reformatting a file that was indented with four spaces to use two moves a caret on line 400 by hundreds of characters. Tracking that by arithmetic is not feasible from outside, which is why Prettier does it internally and hands back the answer.',
				},
				{
					kind: 'p',
					text: 'The tracked position is a point in the text rather than a token, so it survives the caret sitting in whitespace or in the middle of an identifier. What it cannot do is preserve a selection — only a single offset is tracked, so an integration that wants to restore a selection has to make its own decision about the anchor.',
				},
			],
		},
		{
			heading: 'Using it together with the range options',
			blocks: [
				{
					kind: 'p',
					text: 'A complete Format Selection implementation passes all three. The ranges say what to format; the cursor offset says what to preserve:',
				},
				{
					kind: 'code',
					code: "const { formatted, cursorOffset } = await prettier.formatWithCursor(text, {\n  parser: 'typescript',\n  rangeStart: startOffset,\n  rangeEnd: endOffset,\n  cursorOffset: caretOffset,\n});\n\napplyEdit(formatted);\nmoveCaretTo(cursorOffset);",
					caption: 'All three options in one call.',
				},
				{
					kind: 'p',
					text: 'If the caret falls outside the formatted range the returned offset simply accounts for however much the range grew or shrank, so the call is safe regardless of where the user was pointing.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Why does my cursor jump when I save?',
			answer:
				'The integration is probably not passing `cursorOffset`, or is discarding the value Prettier returns. A plugin using `formatWithCursor` and applying the returned offset keeps the caret in place.',
		},
		{
			question: 'Should I set cursorOffset in .prettierrc?',
			answer:
				'No. It describes a caret position at one moment in one file, which a project-wide config cannot sensibly express.',
		},
		{
			question: 'What does the CLI do with it?',
			answer:
				'It prints the resulting offset to standard error. There is no caret to move, so the value is informational.',
		},
	],
};

export default article;
