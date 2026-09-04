import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'one attribute per line, for markup diffs that read like code diffs',
	summary:
		'`singleAttributePerLine` forces every attribute of a JSX or HTML element onto its own line, even when several would fit together. It trades vertical space for diff precision, and it is the markup equivalent of the argument that makes trailing commas worthwhile.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'The default is `false`, so Prettier packs as many attributes onto each line as `printWidth` allows, breaking only when it must. Set it to `true` and each attribute gets its own line whenever the tag is broken at all.',
				},
				{
					kind: 'code',
					code: '<input\n  type="email"\n  name="email"\n  required\n  autoComplete="email"\n/>',
					caption: 'singleAttributePerLine: true',
				},
				{
					kind: 'p',
					text: 'A tag short enough to stay on one line is left alone. The option changes how a broken tag is laid out, not whether it breaks.',
				},
			],
		},
		{
			heading: 'Why it helps reviews',
			blocks: [
				{
					kind: 'p',
					text: 'When attributes share lines, the line a change lands on is an accident of width. Add one attribute near the front and the packing shifts, so several lines change even though the meaning of only one did.',
				},
				{
					kind: 'p',
					text: 'One attribute per line makes the mapping exact: one attribute, one line, one diff entry. Adding, removing or editing an attribute produces precisely the diff a reader expects, and `git blame` attributes each attribute to the commit that introduced it.',
				},
				{
					kind: 'p',
					text: 'This matters most on components with many props, which is where reviews are hardest and where the packed form is least predictable.',
				},
			],
		},
		{
			heading: 'The cost',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Files get considerably taller. A form-heavy component can grow by half again, and less fits on screen.',
						'Short tags with two small attributes look over-formatted when they break at all.',
						'It compounds with `bracketSameLine: false`, which adds another line per tag — the default combination is the most vertical of the four.',
					],
				},
				{
					kind: 'p',
					text: 'Whether that is worth it depends on how your team works. Codebases reviewed heavily in pull requests tend to conclude that it is; codebases read mostly in an editor often conclude it is not.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Expecting single-line tags to be split. The option only governs tags that are already breaking.',
						'Enabling it mid-project without a dedicated reformat commit — it touches every multi-attribute element in the codebase.',
						'Assuming it is JSX-only. It applies to HTML and Vue templates as well.',
					],
				},
			],
		},

		{
			heading: 'How it combines with the other markup options',
			blocks: [
				{
					kind: 'p',
					text: 'Three options together decide the shape of a broken tag, and their effects compound:',
				},
				{
					kind: 'ul',
					items: [
						'`printWidth` decides whether the tag breaks at all. A short tag is unaffected by anything else here.',
						'`singleAttributePerLine` decides whether the attributes share lines once it has broken.',
						'`bracketSameLine` decides whether the closing `>` gets its own line as well.',
					],
				},
				{
					kind: 'p',
					text: 'The default combination — `singleAttributePerLine: false`, `bracketSameLine: false` — packs attributes but isolates the bracket. Turning the first on gives the tallest and most diff-stable layout; turning the second on as well recovers one line per tag at some cost to that stability.',
				},
				{
					kind: 'code',
					code: '{\n  "singleAttributePerLine": true,\n  "bracketSameLine": false\n}',
					caption: 'The most diff-stable combination, which is what this repository uses.',
				},
			],
		},
		{
			heading: 'What it does not override',
			blocks: [
				{
					kind: 'p',
					text: 'A `// prettier-ignore` or `<!-- prettier-ignore -->` before an element still wins — the element is left exactly as written, attributes and all. That is the escape hatch for the occasional tag whose hand-arrangement genuinely carries meaning, such as a table of coordinates expressed as props.',
				},
				{
					kind: 'p',
					text: 'The option also does not force a break. An element with two short attributes that fits comfortably stays on one line, which surprises people who expect the name to mean one attribute per line unconditionally.',
				},
			],
		},
		{
			heading: 'Who tends to turn it on',
			blocks: [
				{
					kind: 'p',
					text: 'Adoption splits fairly cleanly along how a team reads code. Design-system and component-library repositories tend to enable it, because their components carry many props, those props change often, and reviews are about exactly which prop changed.',
				},
				{
					kind: 'p',
					text: 'Application code with lighter markup tends to leave it off, because most elements have one or two attributes and the packed form already puts each meaningful change on its own line.',
				},
				{
					kind: 'p',
					text: 'A useful test: look at a recent pull request touching your markup and ask how many of the changed lines changed meaningfully. If packing is putting unrelated attributes on the same line as your edit, the option will pay for its vertical cost.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Will it split a short tag onto several lines?',
			answer:
				'No. A tag that fits within `printWidth` stays on one line. The option decides the layout only once a tag has to break.',
		},
		{
			question: 'Does it apply outside JSX?',
			answer: 'Yes — HTML and Vue templates are covered too.',
		},
		{
			question: 'Is it worth the extra vertical space?',
			answer:
				'It depends on how much of your reading happens in diffs. Teams that review heavily in pull requests generally find the one-attribute-one-line mapping worth the height; teams that mostly read in an editor often do not.',
		},
	],
};

export default article;
