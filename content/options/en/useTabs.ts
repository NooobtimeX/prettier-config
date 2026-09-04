import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'tabs for indentation, and why accessibility is the strongest argument',
	summary:
		'`useTabs` switches indentation from spaces to tab characters. The usual framing is a matter of taste, but the substantive argument is accessibility: a tab is a single character whose displayed width each reader controls, so one file can be two columns wide for you and eight for a colleague who needs it.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'The default is `false`, so Prettier indents with spaces — `tabWidth` of them per level. Set it to `true` and each level becomes one tab character.',
				},
				{
					kind: 'p',
					text: 'Prettier is careful about the distinction between indentation and alignment. Tabs are used to indent — to express that a line is one level deeper than its parent. They are never used to align, because alignment depends on the width of preceding text and would break the moment a reader changed their tab width. Where Prettier needs to line something up, it uses spaces even in a tabs codebase.',
				},
				{
					kind: 'p',
					text: 'This is the property that makes tabs work at all. A file indented with tabs and aligned with spaces renders correctly at any tab width; a file that uses tabs for both does not.',
				},
			],
		},
		{
			heading: 'The accessibility argument',
			blocks: [
				{
					kind: 'p',
					text: 'The strongest case for tabs is not aesthetic. Developers with low vision, and many developers with dyslexia, need wider indentation to track nesting — sometimes considerably wider. With spaces the author has decided that for everyone, permanently. With tabs the reader decides, in their own editor, without touching the file or producing a diff.',
				},
				{
					kind: 'p',
					text: 'That argument cuts cleanly through the traditional debate, and it is why a number of projects have moved to tabs in recent years after years of spaces. It costs nothing to the readers who are happy at two columns and it is the difference between comfortable and unreadable for the readers who are not.',
				},
			],
		},
		{
			heading: 'Why the default is still spaces',
			blocks: [
				{
					kind: 'p',
					text: "Prettier's defaults follow the ecosystem, and the JavaScript ecosystem overwhelmingly writes spaces. Changing the default would reformat a large share of the world's npm packages for no functional gain, so it stays.",
				},
				{
					kind: 'p',
					text: 'Spaces also have one genuine technical advantage: they render identically everywhere, including in contexts that do not honour tab settings — code in a pull request diff, a snippet in a chat client, a screenshot, a printed page. If your code is read more often outside an editor than inside one, that consistency has value.',
				},
			],
		},
		{
			heading: 'Where tabs are mandatory or conventional',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Makefiles require tabs as a matter of syntax. Prettier does not format Makefiles, but the constraint is worth knowing if your repository mixes them in.',
						'Go uses tabs by convention and `gofmt` enforces it, so a polyglot repository containing Go may prefer tabs throughout for consistency.',
						'Some Prettier plugins and their ecosystems have their own leanings; check before standardising across a mixed repository.',
					],
				},
			],
		},
		{
			heading: 'Editors, .editorconfig and diffs',
			blocks: [
				{
					kind: 'p',
					text: '`.editorconfig`’s `indent_style` maps to this option, and Prettier honours it when your Prettier config is silent. Setting both to the same value in both files avoids a class of confusing bug where formatting depends on which directory you ran the command from.',
				},
				{
					kind: 'code',
					code: '{\n  "useTabs": true,\n  "tabWidth": 2\n}',
					caption: 'Keep the two files in agreement.',
				},
				{
					kind: 'p',
					text: 'On GitHub, tab width in diffs defaults to eight columns, which makes a tabs codebase look far more deeply indented in review than it does in your editor. A `.gitattributes` entry or the per-user diff setting fixes it, but it surprises people the first time and is worth mentioning when you make the switch.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Assuming tabs will break alignment. Prettier aligns with spaces precisely so it cannot.',
						'Setting `useTabs: true` and then dropping `tabWidth`, which leaves line-width measurement assuming the default of 2 regardless of how the file is read.',
						'Mixing the two within a repository, which produces files that look wrong depending on which editor opened them.',
						'Switching without a dedicated reformat commit. This option touches the leading whitespace of essentially every line in the project.',
					],
				},
			],
		},
	],
	faq: [
		{
			question: 'Do tabs break column alignment?',
			answer:
				'Not in Prettier output. Prettier uses tabs only for indentation and spaces for any alignment, so the file renders correctly at any tab width the reader chooses.',
		},
		{
			question: 'Does tabWidth still matter with useTabs on?',
			answer:
				'Yes. Prettier uses it to work out how wide a tab renders, which feeds the `printWidth` calculation that decides where lines break.',
		},
		{
			question: 'Why does my tabs codebase look over-indented on GitHub?',
			answer:
				'GitHub renders a tab as eight columns by default. Your editor is probably set to two or four. It is a display setting, not a change to the file.',
		},
	],
};

export default article;
