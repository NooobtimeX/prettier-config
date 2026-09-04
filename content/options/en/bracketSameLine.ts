import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'where the closing angle bracket of a multi-line tag lands',
	summary:
		'`bracketSameLine` decides whether the `>` that closes a multi-line JSX or HTML opening tag sits on its own line or is tucked onto the end of the last attribute. The default `false` gives it its own line, which keeps the attribute list a clean rectangular block.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'It applies only when a tag has been broken across several lines because its attributes do not fit on one. The default puts the `>` on a line of its own, aligned with the opening `<`:',
				},
				{
					kind: 'code',
					code: '<button\n  type="submit"\n  disabled={busy}\n>\n  Save\n</button>',
					caption: 'bracketSameLine: false (default)',
				},
				{
					kind: 'code',
					code: '<button\n  type="submit"\n  disabled={busy}>\n  Save\n</button>',
					caption: 'bracketSameLine: true',
				},
			],
		},
		{
			heading: 'Why the default is false',
			blocks: [
				{
					kind: 'p',
					text: 'With the bracket on its own line, every attribute line has the same shape, and the `>` becomes a clear visual boundary between the tag and its children. In deeply nested markup that boundary is doing real work — it is the difference between seeing where a tag ends and counting indentation.',
				},
				{
					kind: 'p',
					text: 'There is a diff argument too, the same one that motivates trailing commas. When the `>` is attached to the last attribute, adding a new attribute at the end modifies that line as well as adding one. With the bracket on its own line, adding an attribute changes exactly one line.',
				},
			],
		},
		{
			heading: 'The case for true',
			blocks: [
				{
					kind: 'p',
					text: '`true` is more compact, and for markup-heavy code that difference accumulates — a page of components can be noticeably shorter. It also reads closer to how hand-written HTML is often formatted, which some teams prefer for template files.',
				},
				{
					kind: 'p',
					text: 'If you choose it, be aware it applies to HTML and Vue templates as well as JSX. There is no way to set it differently per language short of an `overrides` block in your configuration.',
				},
			],
		},
		{
			heading: 'The rename in Prettier 2.4',
			blocks: [
				{
					kind: 'p',
					text: 'This option was called `jsxBracketSameLine` until Prettier 2.4, when it was renamed and widened to cover HTML and Vue as well as JSX. The old name was deprecated then and removed in Prettier 3.',
				},
				{
					kind: 'p',
					text: 'If you are upgrading from an old configuration and the setting seems to be ignored, check for the old key — Prettier 3 will not honour it.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Confusing it with `bracketSpacing`, which is about spaces inside object braces and shares nothing but a prefix.',
						'Leaving `jsxBracketSameLine` in a config after upgrading to Prettier 3, where it is silently unrecognised.',
						'Expecting it to affect single-line tags. It only applies once a tag has already been split.',
						'Expecting it to apply to self-closing tags in the same way — the `/>` follows related but distinct rules.',
					],
				},
			],
		},
		{
			heading: 'Self-closing tags follow a different rule',
			blocks: [
				{
					kind: 'p',
					text: 'The option covers the `>` of an opening tag. A self-closing element ends in `/>`, and that is placed on its own line when the element is broken, regardless of this setting:',
				},
				{
					kind: 'code',
					code: '<input\n  type="email"\n  required\n/>',
					caption: 'The `/>` is unaffected by bracketSameLine.',
				},
				{
					kind: 'p',
					text: 'The reasoning is that `/>` closes the element rather than merely ending the tag, so attaching it to the last attribute would obscure where the element finishes. In JSX, where self-closing components are extremely common, this means the option affects fewer elements than people expect.',
				},
			],
		},
		{
			heading: 'Scoping it per language',
			blocks: [
				{
					kind: 'p',
					text: 'Because the option applies to JSX, HTML and Vue alike, a repository containing both React components and hand-written HTML templates gets one answer for both. If the two genuinely want different conventions, an `overrides` block is the only way to separate them:',
				},
				{
					kind: 'code',
					code: '{\n  "bracketSameLine": false,\n  "overrides": [\n    {\n      "files": "*.html",\n      "options": { "bracketSameLine": true }\n    }\n  ]\n}',
					caption: 'Compact HTML templates, conventional JSX.',
				},
				{
					kind: 'p',
					text: 'Consider whether the split is worth it. Two conventions in one repository is a cost paid by every reader, and the saving is one line per broken tag.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Is this the same as bracketSpacing?',
			answer:
				'No. `bracketSpacing` controls spaces inside object braces such as `{ foo }`. This option controls where the closing `>` of a multi-line tag goes. The names are similar and the behaviours are unrelated.',
		},
		{
			question: 'My jsxBracketSameLine setting stopped working — why?',
			answer:
				'It was renamed to `bracketSameLine` in Prettier 2.4 and removed in Prettier 3. Rename the key.',
		},
		{
			question: 'Does it affect HTML as well as JSX?',
			answer:
				'Yes. Since the 2.4 rename it applies to HTML and Vue templates too, which is why the `jsx` prefix was dropped.',
		},
	],
};

export default article;
