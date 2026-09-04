import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'the start of a partial format, and how Format Selection actually works',
	summary:
		"`rangeStart` is the character offset where Prettier begins formatting, leaving everything before it untouched. Together with `rangeEnd` it is the mechanism behind every editor's Format Selection command, and it is an API option rather than something you put in a config file.",
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'Prettier normally reformats a whole file. `rangeStart` and `rangeEnd` narrow that to a slice, measured in characters from the beginning of the file. Text outside the range is emitted exactly as it was.',
				},
				{
					kind: 'code',
					code: "import * as prettier from 'prettier';\n\nconst output = await prettier.format(source, {\n  parser: 'typescript',\n  rangeStart: 120,\n  rangeEnd: 340,\n});",
					caption: 'Formatting only part of a file through the API.',
				},
				{
					kind: 'p',
					text: 'The default is `0` — the start of the file — and `rangeEnd` defaults to the end, so together they format everything unless you narrow them.',
				},
			],
		},
		{
			heading: 'Why the range gets widened',
			blocks: [
				{
					kind: 'p',
					text: 'Prettier will not format a fragment of a statement, because a fragment usually is not parseable and would not have a well-defined layout in isolation. So the range you request is expanded outwards to the nearest enclosing statement boundaries before anything is formatted.',
				},
				{
					kind: 'p',
					text: 'This is why selecting the middle of an expression in your editor and asking for Format Selection reformats the whole statement. It is not the editor being imprecise — it is Prettier refusing to produce output whose correctness it cannot guarantee.',
				},
				{
					kind: 'p',
					text: 'Indentation of the surrounding context is preserved, so the formatted slice lines up with the code around it rather than being re-indented to column zero.',
				},
			],
		},
		{
			heading: 'Practical limits',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Offsets are characters, not bytes and not line/column pairs. Multi-byte characters count as one.',
						'Not every parser supports ranges equally well; the CSS and Markdown parsers are more restrictive than the JavaScript ones.',
						'Range formatting can produce output that differs from formatting the whole file, because decisions such as where a line breaks depend on context the range excludes.',
						'It is not a substitute for `.prettierignore` or `// prettier-ignore`. Those express a durable intent; a range is a one-off instruction.',
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
						'Putting `rangeStart` in `.prettierrc`. It is meaningful per invocation, and a config file applies to every invocation — the result is a project that only ever formats from that offset.',
						'Expecting the exact selection to be formatted rather than the enclosing statements.',
						'Computing offsets in bytes on a file containing non-ASCII characters.',
						'Assuming a ranged format gives the same result as a whole-file format. It often does, but it is not guaranteed.',
					],
				},
			],
		},
		{
			heading: 'How far the range actually expands',
			blocks: [
				{
					kind: 'p',
					text: 'The expansion is to statement boundaries, not to the nearest newline or the nearest brace. Prettier walks up the syntax tree from the offsets you gave until it reaches nodes it can print independently, and formats from the start of the first to the end of the last.',
				},
				{
					kind: 'p',
					text: 'In practice that means selecting half of one function and half of the next reformats both in full. Selecting a single property of an object literal reformats the whole literal, because a property is not something Prettier can lay out without knowing whether its siblings fit.',
				},
				{
					kind: 'p',
					text: 'Text outside the expanded region is copied through byte for byte, including trailing whitespace and unusual indentation. A ranged format never tidies what it did not touch.',
				},
			],
		},
		{
			heading: 'On the command line',
			blocks: [
				{
					kind: 'p',
					text: 'Both range options exist as CLI flags, though they are rarely the right tool there because the CLI has no notion of a selection:',
				},
				{
					kind: 'code',
					code: 'npx prettier --range-start 120 --range-end 340 src/app.ts',
					caption: 'Formatting a slice from the shell.',
				},
				{
					kind: 'p',
					text: 'Combining them with `--write` across a glob is a mistake worth naming: the same offsets would be applied to every matched file, slicing each at positions that mean nothing in that file. Ranges are a single-file operation.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Why did Format Selection reformat more than I selected?',
			answer:
				'Prettier expands the range to the nearest enclosing statement boundaries, because a partial statement has no well-defined formatting.',
		},
		{
			question: 'Should I set rangeStart in my .prettierrc?',
			answer:
				'No. It is a per-invocation API option. In a config file it would apply to every format and skip the beginning of every file.',
		},
		{
			question: 'Are the offsets in bytes?',
			answer: 'Characters. A multi-byte character counts once.',
		},
	],
};

export default article;
