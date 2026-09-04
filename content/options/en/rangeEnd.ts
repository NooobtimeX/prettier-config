import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'the exclusive end of a partial format',
	summary:
		'`rangeEnd` is the character offset at which Prettier stops formatting, and it is the companion to `rangeStart`. The offset is exclusive — the character at that position is not included — and like its partner it is an API option rather than a configuration file setting.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: '`rangeEnd` bounds the slice of the file Prettier will rewrite. Everything from that offset onwards is emitted unchanged. It defaults to the end of the file, so formatting is whole-file unless you narrow it.',
				},
				{
					kind: 'p',
					text: 'The exclusivity is the detail people get wrong. `rangeStart: 0, rangeEnd: 10` covers characters 0 through 9. It is a half-open interval, matching `String.prototype.slice` — which is convenient, because that is usually how you obtained the offsets.',
				},
			],
		},
		{
			heading: 'Where the offsets come from',
			blocks: [
				{
					kind: 'p',
					text: 'In practice you rarely compute these by hand. An editor extension asks the editor for the selected range and passes it through:',
				},
				{
					kind: 'code',
					code: "const { start, end } = editor.selection;\n\nconst output = await prettier.format(document.getText(), {\n  parser: 'typescript',\n  rangeStart: document.offsetAt(start),\n  rangeEnd: document.offsetAt(end),\n  cursorOffset: document.offsetAt(editor.cursor),\n});",
					caption: 'The shape of a Format Selection integration.',
				},
				{
					kind: 'p',
					text: '`cursorOffset` is usually passed alongside so the caret can be restored afterwards — the three options are designed to be used together.',
				},
			],
		},
		{
			heading: 'Behaviour worth knowing',
			blocks: [
				{
					kind: 'ul',
					items: [
						'The range is expanded outwards to enclosing statement boundaries before formatting, so the affected region is usually larger than what you asked for.',
						'A `rangeEnd` before `rangeStart` is not meaningful and will not produce useful output.',
						'A range that covers the whole file is equivalent to not passing one, and is the simplest way for an integration to handle "no selection".',
						'Offsets are characters, so they stay correct for non-ASCII source without any byte arithmetic.',
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
						'Treating the offset as inclusive and dropping the last character of the selection.',
						'Setting it in `.prettierrc`, where it would truncate every file at that offset.',
						'Passing byte offsets from a language whose string indexing is byte-based.',
						'Expecting the formatted result to match a whole-file format exactly. Context outside the range can change layout decisions.',
					],
				},
			],
		},

		{
			heading: 'Handling the no-selection case',
			blocks: [
				{
					kind: 'p',
					text: 'An editor command has to cope with the user invoking Format Selection without a selection. The simplest correct behaviour is to omit both range options entirely, which formats the whole document — rather than passing a zero-width range, which expands to whatever statement the caret happens to be inside and produces a surprising partial format.',
				},
				{
					kind: 'code',
					code: "const opts = { parser: 'typescript' };\n\nif (!editor.selection.isEmpty) {\n  opts.rangeStart = document.offsetAt(editor.selection.start);\n  opts.rangeEnd = document.offsetAt(editor.selection.end);\n}\n\nconst output = await prettier.format(document.getText(), opts);",
					caption: 'Fall back to a whole-document format when nothing is selected.',
				},
			],
		},
		{
			heading: 'Idempotence is not guaranteed across a range',
			blocks: [
				{
					kind: 'p',
					text: 'Formatting the whole file twice gives the same result the second time — that property is one of the things Prettier tests hardest. A ranged format does not carry the same guarantee, because the layout chosen inside the range depends on the surrounding indentation, and that surrounding text is itself unformatted.',
				},
				{
					kind: 'p',
					text: 'In practice this means a file assembled from many ranged formats can differ from the same file formatted once in full. If that matters — in CI, for instance — run a whole-file format as the source of truth and treat ranged formatting as an editing convenience.',
				},
			],
		},
		{
			heading: 'Syntax errors and unparseable input',
			blocks: [
				{
					kind: 'p',
					text: 'Prettier parses the whole file even when you ask it to format only part of one, because it needs the surrounding syntax tree to know where statement boundaries fall. A syntax error anywhere in the file therefore fails the format, even if the error is far outside your range.',
				},
				{
					kind: 'p',
					text: 'This surprises people using Format Selection while mid-edit: the selection is valid, the file is not, and nothing happens. It is not a bug and there is no setting that relaxes it — a partial parse could not tell Prettier where the range should expand to.',
				},
			],
		},
		{
			heading: 'One range per call',
			blocks: [
				{
					kind: 'p',
					text: 'There is no way to pass several disjoint ranges. An editor with a multi-cursor or block selection has to choose: format the span from the first offset to the last, which covers the gaps between the selections, or call Prettier once per range and reconcile the results itself.',
				},
				{
					kind: 'p',
					text: 'Formatting once per range is harder than it looks, because each call returns a whole document and the offsets shift after the first edit. Most integrations take the simpler route and format the enclosing span.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Is rangeEnd inclusive or exclusive?',
			answer:
				'Exclusive. The character at that offset is not formatted, which matches how `slice` works and how editors report selections.',
		},
		{
			question: 'Can I put it in a config file?',
			answer:
				'You can, but you should not. It applies per invocation; in a config file it would truncate formatting for every file in the project.',
		},
	],
};

export default article;
