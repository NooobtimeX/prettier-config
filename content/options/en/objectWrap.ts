import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: "Prettier's one deliberate escape hatch, and how to switch it off",
	summary:
		"`objectWrap` decides whether Prettier respects a newline you place immediately after an object's opening brace. The default `preserve` treats that newline as an instruction to keep the object expanded — one of the very few places where Prettier lets the author, rather than the printer, decide the shape of the output.",
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'Prettier normally decides layout entirely on its own: an object that fits within `printWidth` is collapsed to one line, and one that does not is expanded. Object literals are the exception.',
				},
				{
					kind: 'p',
					text: 'With `objectWrap: preserve` — the default — Prettier looks at whether you put a line break between the `{` and the first key. If you did, the object stays expanded even when it would comfortably fit on one line. If you did not, normal width-based rules apply.',
				},
				{
					kind: 'code',
					code: '// newline after { — preserved\nconst a = {\n  x: 1,\n  y: 2,\n};\n\n// no newline after { — collapsed\nconst b = { x: 1, y: 2 };',
					caption: 'Both fit on one line; only the first stays expanded.',
				},
				{
					kind: 'p',
					text: 'Set `objectWrap: collapse` and the first form is reformatted to match the second. Prettier then owns the decision completely, as it does for every other construct.',
				},
			],
		},
		{
			heading: 'Why the escape hatch exists',
			blocks: [
				{
					kind: 'p',
					text: 'Objects carry meaning that width does not capture. A configuration object, a set of related constants, a table of test cases — these are often clearer one-key-per-line even when they are short, because the vertical form invites you to read them as a list rather than as a sentence.',
				},
				{
					kind: 'p',
					text: "Prettier's usual answer to that argument is no: the whole premise of the tool is that you stop making layout decisions. Object literals got an exception because the demand was overwhelming and the mechanism is cheap — a single newline, easy to add and easy to remove, with no configuration and no comment pragma.",
				},
				{
					kind: 'p',
					text: 'It is worth knowing the same idea applies elsewhere under a different name. The so-called magic trailing comma — leaving a trailing comma in a list you want kept expanded — works on arrays, parameters and call arguments in the same spirit.',
				},
			],
		},
		{
			heading: 'When to choose collapse',
			blocks: [
				{
					kind: 'ul',
					items: [
						'When you want formatting to be genuinely deterministic from the source text alone, so that two semantically identical files always format identically.',
						'When your team keeps arguing about which objects deserve to be expanded — `collapse` ends the discussion by removing the choice.',
						'When code is generated or heavily machine-edited, and incidental newlines from a codemod would otherwise be preserved as if they were intentional.',
					],
				},
				{
					kind: 'p',
					text: 'Bear in mind the cost: `collapse` will reformat a large number of small objects across an existing codebase, and some of them will read worse. Land it as its own commit.',
				},
			],
		},
		{
			heading: 'Version note',
			blocks: [
				{
					kind: 'p',
					text: '`objectWrap` was added in Prettier 3.5. The `preserve` behaviour predates it by years — it was simply unconditional and had no option name. If you are on an older release the newline is still respected; you just cannot turn it off.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Deleting the newline after `{` while tidying up, then wondering why an object collapsed.',
						'Expecting the same preservation for arrays. Arrays use the trailing-comma mechanism instead.',
						'Assuming Prettier output is a pure function of the AST. Under `preserve` it is not — this newline is part of the input.',
						'Setting `collapse` and then trying to force expansion with comments. It will not work; the option is absolute.',
					],
				},
			],
		},
	],
	faq: [
		{
			question: 'How do I force an object to stay on multiple lines?',
			answer:
				'Put a line break directly after the opening brace and leave `objectWrap` at its default of `preserve`. Prettier keeps the object expanded even if it would fit on one line.',
		},
		{
			question: 'Why did my short object stay expanded?',
			answer:
				'Because there is a newline between `{` and the first key, and `preserve` treats that as intentional. Remove the newline to let it collapse.',
		},
		{
			question: 'Does this work for arrays and function arguments?',
			answer:
				'Not through this option. The equivalent for those is the magic trailing comma — leave a trailing comma in the list and Prettier keeps it expanded.',
		},
	],
};

export default article;
