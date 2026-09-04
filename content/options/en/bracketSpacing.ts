import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'the spaces inside object braces, and everywhere they follow',
	summary:
		'`bracketSpacing` decides whether Prettier prints `{ foo: bar }` or `{foo: bar}`. It is a small option with a wide blast radius: the same setting governs object literals, destructuring patterns, and named import and export clauses.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'The default is `true`, meaning a space just inside each brace. The setting applies consistently anywhere Prettier prints braces around a comma-separated list on one line:',
				},
				{
					kind: 'code',
					code: "import { useState } from 'react';\n\nconst { id, name } = user;\n\nconst payload = { id, name };\n\nexport { payload };",
					caption: 'Everything this option touches, at the default.',
				},
				{
					kind: 'p',
					text: 'Set it to `false` and all four become `{useState}`, `{id, name}` and so on. There is no way to have it apply to imports but not to object literals — it is one decision for all of them, which is part of why the default is worth keeping unless you feel strongly.',
				},
			],
		},
		{
			heading: 'What it does not affect',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Array brackets. `[1, 2]` never gains inner spaces; this option is about braces only.',
						'Block braces. A function body or an `if` block is unaffected — those are statements, not lists.',
						'JSX expression containers. `{children}` in JSX markup keeps its own rules and is not governed here.',
						'Empty objects. `{}` stays `{}` regardless.',
					],
				},
			],
		},
		{
			heading: 'Why the default is true',
			blocks: [
				{
					kind: 'p',
					text: 'The inner spaces make the brace boundary easier to find in a dense line. In a long destructuring pattern or a wide import clause, the eye locates `{ ` and ` }` faster than a brace pressed flat against an identifier.',
				},
				{
					kind: 'p',
					text: 'It also matches the overwhelming majority of the JavaScript ecosystem, which matters more here than usual: import statements are the first three lines of nearly every file, so this option is the single most visible formatting decision in a codebase.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Expecting it to affect arrays. It does not — there is no corresponding option for `[ 1, 2 ]`, and Prettier will not produce that.',
						'Expecting it to affect JSX braces in markup.',
						'Setting it to `false` for density and then finding imports harder to scan, which is where the cost lands hardest.',
						'Leaving ESLint’s `object-curly-spacing` rule enabled alongside Prettier.',
					],
				},
			],
		},

		{
			heading: 'It counts toward printWidth',
			blocks: [
				{
					kind: 'p',
					text: 'The two spaces are characters like any other, so they are measured when Prettier decides whether a line fits. On a long import clause or a wide destructuring pattern sitting right at the limit, turning this option off can be the difference between one line and two.',
				},
				{
					kind: 'p',
					text: 'The effect is small and it is not a reason to choose either value, but it explains the occasional case where flipping this setting produces a diff larger than two characters per brace would suggest.',
				},
			],
		},
		{
			heading: 'Why there is no array equivalent',
			blocks: [
				{
					kind: 'p',
					text: 'A recurring request is for the same treatment of array brackets — `[ 1, 2 ]` rather than `[1, 2]`. Prettier has consistently declined, and the reasoning is worth knowing because it explains the shape of the option set generally.',
				},
				{
					kind: 'p',
					text: "Braces delimit named things: an object's keys, an import's bindings, a destructuring pattern's targets. The inner space separates the delimiter from an identifier, which is where the legibility gain lies. Array brackets delimit positional values, usually short literals, and the same space mostly adds width without aiding the eye.",
				},
				{
					kind: 'p',
					text: "Prettier's option surface is deliberately small — every option doubles the number of ways a codebase can look — so requests that do not clear a high bar are refused. This is one of them.",
				},
			],
		},
	],
	faq: [
		{
			question: 'Does bracketSpacing affect arrays?',
			answer:
				'No. It applies to braces only — object literals, destructuring, and import/export clauses. Array brackets never get inner spaces.',
		},
		{
			question: 'Can I have it for imports but not object literals?',
			answer: 'No. It is a single setting covering every brace-delimited list Prettier prints.',
		},
		{
			question: 'Is this the same as bracketSameLine?',
			answer:
				'No. `bracketSameLine` is about where the closing `>` of a JSX or HTML tag goes. Despite the similar name they share nothing.',
		},

		{
			question: 'Can I get spaces inside array brackets too?',
			answer:
				'No. Prettier has deliberately declined to add that option, on the grounds that the readability argument for braces does not transfer to positional array literals.',
		},
	],
};

export default article;
