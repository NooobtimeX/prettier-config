import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'the option that stops Prettier changing how your page renders',
	summary:
		'`htmlWhitespaceSensitivity` tells Prettier how much of the whitespace in your HTML is load-bearing. It exists because HTML is the one language Prettier formats where adding a line break can visibly change the rendered page, and the default `css` is a careful compromise rather than a stylistic preference.',
	sections: [
		{
			heading: 'Why HTML is different',
			blocks: [
				{
					kind: 'p',
					text: 'In JavaScript, whitespace between tokens is meaningless and a formatter can reflow at will. In HTML it is not. Whitespace between inline elements collapses to a single rendered space — but it does not vanish. Break a line in the wrong place and you add a space that was not there; join two lines and you remove one.',
				},
				{
					kind: 'code',
					code: '<span>Ada</span><span>,</span>\n\n<span>Ada</span>\n<span>,</span>',
					caption: 'These render differently: the second has a space before the comma.',
				},
				{
					kind: 'p',
					text: 'This is why Prettier cannot simply lay HTML out the way it lays out code. Formatting has to preserve meaning, and in HTML the meaning includes the gaps.',
				},
			],
		},
		{
			heading: 'What the three values do',
			blocks: [
				{
					kind: 'ul',
					items: [
						'`css` (default) — respect the CSS `display` property each element has by default. Whitespace matters around inline elements such as `span` and `a`; it does not matter around block elements such as `div` and `p`, so those can be reflowed freely.',
						'`strict` — treat whitespace around every element as significant. Maximum safety, minimum reformatting; the output is often cramped.',
						'`ignore` — treat whitespace around every element as insignificant. Prettier formats HTML the way it formats code, and may change how your page renders.',
					],
				},
			],
		},
		{
			heading: 'Why the default is css',
			blocks: [
				{
					kind: 'p',
					text: '`css` gets the common cases right without asking you to think. Block-level layout — the great majority of a typical template — is reflowed and indented properly, while inline runs are left intact so text does not gain or lose spaces.',
				},
				{
					kind: 'p',
					text: "Its limitation is in the name: it uses each element's *default* display, not the display your stylesheet actually gives it. A `div` you have made `display: inline-block` is still treated as a block, and a `span` you have made `display: block` is still treated as inline. Prettier does not read your CSS, and could not reliably do so.",
				},
				{
					kind: 'p',
					text: 'In practice this is rarely a problem, because the elements whose whitespace matters most — `a`, `span`, `strong`, `em` — are inline by default and stay that way.',
				},
			],
		},
		{
			heading: 'When to change it',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Choose `strict` for email templates, or any HTML where an accidental space is genuinely costly and you would rather have ugly output than risky output.',
						'Choose `ignore` only for HTML whose whitespace you know does not matter — a machine-generated fragment, or a template where every element is laid out with flexbox or grid, both of which discard inter-element whitespace anyway.',
						'Otherwise stay on `css`. It is the setting that fails safe.',
					],
				},
				{
					kind: 'p',
					text: 'You can also opt out per element rather than globally. Prettier honours `<!-- prettier-ignore -->` immediately before an element, which leaves that subtree exactly as written.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Setting `ignore` to get tidier output and then finding spacing bugs in the rendered page.',
						'Expecting `css` to read your stylesheet. It uses the element’s default display only.',
						'Blaming Prettier for cramped HTML when the real cause is that the whitespace genuinely could not be moved.',
						'Formatting an email template with `ignore`, where clients are least forgiving of stray whitespace.',
					],
				},
			],
		},
		{
			heading: 'Elements Prettier will never reflow',
			blocks: [
				{
					kind: 'p',
					text: 'Some elements have whitespace semantics that no setting overrides, because changing them would change the document rather than merely its rendering:',
				},
				{
					kind: 'ul',
					items: [
						'`<pre>` preserves whitespace by definition. Prettier leaves its contents exactly as written under every value of this option.',
						"`<textarea>` likewise — its content is the field's initial value, so a stray newline is user-visible data.",
						'`<script>` and `<style>` contain other languages and are handled by their own parsers rather than as markup.',
					],
				},
				{
					kind: 'p',
					text: 'If you have a `<pre>` block that looks badly indented relative to the markup around it, that is correct behaviour: re-indenting it would change what the browser displays.',
				},
			],
		},
		{
			heading: 'Vue and Angular templates',
			blocks: [
				{
					kind: 'p',
					text: "The option applies to Vue and Angular templates as well as plain HTML, and there it interacts with framework behaviour worth knowing about. Vue's compiler performs its own whitespace condensing by default, which means some of the whitespace Prettier is being careful to preserve will be discarded before it reaches the browser anyway.",
				},
				{
					kind: 'p',
					text: "That does not make `ignore` safe in a Vue project — the condensing rules are not identical to Prettier's, and a template compiled with `whitespace: 'preserve'` behaves like plain HTML. But it does explain why Vue developers tend to notice this option less than developers writing static markup.",
				},
			],
		},
	],
	faq: [
		{
			question: 'Why is my HTML formatted so tightly?',
			answer:
				'Because moving that whitespace would change the rendering. Under `css`, inline elements keep their exact spacing — Prettier cannot break the line without inserting a rendered space.',
		},
		{
			question: 'Does css mean Prettier reads my stylesheet?',
			answer:
				'No. It uses each element’s default CSS display value. An element restyled by your own CSS is still treated according to its default.',
		},
		{
			question: 'How do I exempt one element?',
			answer:
				'Put `<!-- prettier-ignore -->` on the line before it. That subtree is left exactly as you wrote it.',
		},
	],
};

export default article;
