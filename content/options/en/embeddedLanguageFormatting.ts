import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'formatting the CSS, HTML and GraphQL hiding inside your template literals',
	summary:
		'`embeddedLanguageFormatting` decides whether Prettier formats code embedded inside another language — the CSS in a styled-component, the GraphQL in a `gql` tag, the JavaScript in a Markdown code fence. The default `auto` formats it when it can identify it confidently.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'With `auto` (the default), Prettier looks for template literals and code blocks whose language it can recognise, parses the contents with the appropriate parser, and formats them in place. With `off`, embedded content is left exactly as written.',
				},
				{
					kind: 'code',
					code: 'const Button = styled.button`\n  color: red;\n  padding: 4px 8px;\n`;',
					caption: 'The CSS inside this tagged template is formatted by Prettier.',
				},
			],
		},
		{
			heading: 'How Prettier decides what is embedded',
			blocks: [
				{
					kind: 'p',
					text: 'Recognition is heuristic, and knowing the heuristics explains most surprises:',
				},
				{
					kind: 'ul',
					items: [
						'Tag name. `styled.foo`, `styled(Component)`, `css`, `createGlobalStyle` and `keyframes` are treated as CSS; `gql` and `graphql` as GraphQL; `html` as HTML; `markdown` as Markdown.',
						'A leading block comment. `/* CSS */`, `/* HTML */` or `/* GraphQL */` immediately inside the backtick tells Prettier the language explicitly. This is the escape hatch when your tag has a name Prettier does not know.',
						'Markdown fences. A fenced block labelled with a language Prettier supports is formatted with that parser.',
					],
				},
				{
					kind: 'code',
					code: 'const styles = myCustomTag/* CSS */ `\n  color: red;\n`;',
					caption: 'The comment form, for a tag Prettier would not otherwise recognise.',
				},
			],
		},
		{
			heading: 'When to turn it off',
			blocks: [
				{
					kind: 'ul',
					items: [
						'When a template literal contains something that only looks like CSS or GraphQL, and Prettier mangles it or fails to parse it.',
						'When interpolations make the embedded content syntactically invalid on its own — heavy `${...}` use inside a CSS block is the usual culprit.',
						'When the embedded formatting produces diffs you do not want in files you otherwise need Prettier to touch.',
					],
				},
				{
					kind: 'p',
					text: 'Turning it off globally is a blunt instrument. Prefer a targeted `// prettier-ignore` on the offending literal, or an `overrides` block scoped to the files that need it, so the rest of the codebase keeps the benefit.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Assuming any template literal containing CSS will be formatted. Without a recognised tag or a language comment, Prettier leaves it alone.',
						'Setting `off` to fix one broken literal, losing formatting across every styled-component in the project.',
						'Expecting Markdown code fences to be formatted when the fence has no language label — the label is what selects the parser.',
						'Expecting embedded formatting to apply inside ordinary strings. It only applies to template literals and fenced blocks.',
					],
				},
			],
		},
		{
			heading: 'Why interpolations are the usual failure',
			blocks: [
				{
					kind: 'p',
					text: "Embedded formatting works by extracting the literal's contents and handing them to another parser. A template with `${...}` holes is not, on its own, valid CSS or GraphQL — so Prettier substitutes placeholders, formats, and substitutes back.",
				},
				{
					kind: 'p',
					text: 'That works when the interpolation sits where a value or a declaration would go. It fails when the interpolation spans structure — a hole containing a whole block, a selector and its braces, or a conditional that emits different numbers of declarations:',
				},
				{
					kind: 'code',
					code: 'const Box = styled.div`\n  color: red;\n  ${(p) => p.active && `\n    border: 1px solid;\n    padding: 8px;\n  `}\n`;',
					caption:
						'The interpolation spans a block boundary, so the contents no longer parse as CSS.',
				},
				{
					kind: 'p',
					text: 'When that happens Prettier leaves the literal alone rather than producing broken output. If you see one styled-component formatted and its neighbour untouched, this is usually why — and it is a signal that the component might be clearer with the conditional pulled out into a named fragment.',
				},
			],
		},
		{
			heading: 'A note on plugins and performance',
			blocks: [
				{
					kind: 'p',
					text: 'Embedded formatting invokes a second parser per literal, so a file with hundreds of styled-components is measurably slower to format than the same file with `embeddedLanguageFormatting: "off"`. On a normal codebase the difference is not worth thinking about; on a generated file with thousands of literals it can be.',
				},
				{
					kind: 'p',
					text: 'Plugins can register their own embedded languages, so the set of recognised tags is not fixed. If you have added a plugin and a literal has started being formatted that previously was not, the plugin is the reason.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Why is the CSS in my template literal not formatted?',
			answer:
				'Prettier did not recognise the tag. Use a known tag such as `css` or `styled.x`, or add a `/* CSS */` comment immediately after the tag and before the backtick.',
		},
		{
			question: 'How do I stop it formatting one particular literal?',
			answer:
				'Put `// prettier-ignore` on the line before it. Setting `embeddedLanguageFormatting: "off"` disables the feature everywhere, which is usually more than you want.',
		},
		{
			question: 'Does it format code blocks in Markdown?',
			answer:
				'Yes, when the fence carries a language label Prettier supports. An unlabelled fence is left alone.',
		},
	],
};

export default article;
