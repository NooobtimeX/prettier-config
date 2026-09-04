import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'whether a Vue SFC indents inside its script and style blocks',
	summary:
		'`vueIndentScriptAndStyle` decides whether the contents of `<script>` and `<style>` in a Vue single-file component are indented one level to sit inside their tags. The default `false` keeps them flush left, which is the prevailing Vue convention and buys back a level of indentation for the whole file.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'A Vue SFC wraps its script and its styles in tags, so strictly speaking their contents are nested. The default declines to reflect that in the indentation:',
				},
				{
					kind: 'code',
					code: '<script setup>\nconst count = ref(0);\n</script>\n\n<style scoped>\n.button {\n  color: red;\n}\n</style>',
					caption: 'vueIndentScriptAndStyle: false (default)',
				},
				{
					kind: 'p',
					text: 'Set it to `true` and everything inside those two blocks gains one level. The `<template>` block is unaffected either way — its contents are always indented, because the markup nesting there is real.',
				},
			],
		},
		{
			heading: 'Why the default is false',
			blocks: [
				{
					kind: 'p',
					text: 'The tags are a container format rather than a semantic nesting. A `.vue` file is three files glued together, and the script section is ordinary JavaScript that happens to live inside a wrapper. Indenting it makes it look nested when nothing about it is.',
				},
				{
					kind: 'p',
					text: 'There is a practical benefit as well. Script bodies in a component are already indented by functions, blocks and callbacks; giving back the outermost level leaves more of `printWidth` for actual code, which matters more in Vue than in most places because SFC scripts tend to be deeply structured.',
				},
				{
					kind: 'p',
					text: 'It also matches what the Vue documentation, the official style guide and `eslint-plugin-vue` all do, so a file formatted this way looks like the examples your contributors have read.',
				},
			],
		},
		{
			heading: 'When to choose true',
			blocks: [
				{
					kind: 'ul',
					items: [
						'When your team finds the flush-left script visually detached from its tags and would rather the structure be explicit.',
						'When you are migrating from a codebase or a tool that indented these blocks and want to avoid a large reformat.',
						'When an editor folding or outline feature you rely on behaves better with the indentation present.',
					],
				},
				{
					kind: 'p',
					text: 'None of these are strong arguments, which is why the option sees little use. If you have no view, the default is the safer social choice.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Expecting it to affect `<template>`. It does not — template contents are always indented.',
						'Enabling it and then discovering `eslint-plugin-vue` rules disagree, producing an unfixable conflict.',
						'Assuming it applies to Svelte or Astro components. It is Vue-specific.',
					],
				},
			],
		},

		{
			heading: 'The indentation budget in a single-file component',
			blocks: [
				{
					kind: 'p',
					text: 'An SFC script is usually already several levels deep in its own right: a composable inside a `setup` block, a watcher callback, a nested conditional. Adding the wrapper level pushes all of it one step further right, and because indentation counts toward `printWidth`, that step costs real horizontal space on exactly the lines that have least to spare.',
				},
				{
					kind: 'p',
					text: 'At `tabWidth: 2` the cost is two columns and mostly theoretical. At `tabWidth: 4` it is four, and on a component with deeply nested reactive logic you will see expressions wrap that previously fit. If you enable this option, be prepared for a slightly larger reformat than the indentation change alone implies.',
				},
			],
		},
		{
			heading: 'Other component formats do not have this option',
			blocks: [
				{
					kind: 'p',
					text: "Svelte and Astro components have a similar shape — markup alongside a script block — but neither has an equivalent setting, because neither wraps its script in a tag that could plausibly imply nesting. The question is specific to Vue's SFC syntax.",
				},
				{
					kind: 'p',
					text: 'If your repository contains a mix, do not expect a single setting to make them look alike. Consistency across formats is not achievable here, and chasing it is not worth the effort.',
				},
			],
		},
		{
			heading: 'Custom blocks',
			blocks: [
				{
					kind: 'p',
					text: 'Vue SFCs can carry blocks beyond the standard three — `<i18n>` for translations, `<docs>` for component documentation, and whatever a build plugin defines. This option covers `<script>` and `<style>`; other blocks are not affected by it.',
				},
				{
					kind: 'p',
					text: 'How a custom block is handled depends on whether Prettier can identify a language for it. A block with a `lang` attribute Prettier understands, such as an `<i18n lang="json">` block, is formatted with that parser. One without is left alone, since Prettier has no way to know what is inside.',
				},
				{
					kind: 'code',
					code: '<i18n lang="json">\n{\n  "en": { "save": "Save" }\n}\n</i18n>',
					caption: 'The lang attribute is what makes a custom block formattable.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Does it change the template block?',
			answer:
				'No. Only `<script>` and `<style>`. Template contents are indented regardless, because that nesting is genuine markup nesting.',
		},
		{
			question: 'Which setting matches the Vue style guide?',
			answer:
				'The default, `false`. The official documentation and `eslint-plugin-vue` both leave script and style contents flush left.',
		},
	],
};

export default article;
