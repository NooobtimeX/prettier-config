import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'how Markdown paragraphs are wrapped, and why the default leaves them alone',
	summary:
		'`proseWrap` governs line breaks inside Markdown and other prose, not code. The default `preserve` leaves your paragraphs exactly as you typed them, because reflowing prose is one of the few formatting decisions where the right answer depends on how the text is version-controlled rather than how it looks.',
	sections: [
		{
			heading: 'What the three values do',
			blocks: [
				{
					kind: 'ul',
					items: [
						'`preserve` (default) — never add or remove line breaks within a paragraph. What you wrote is what you get.',
						'`always` — reflow every paragraph to fill up to `printWidth`, inserting and removing breaks as needed.',
						'`never` — join each paragraph onto a single long line, however long that turns out to be.',
					],
				},
				{
					kind: 'p',
					text: 'It applies to Markdown, MDX and the prose parts of other text formats. It has no effect on code at all — that is `printWidth`.',
				},
			],
		},
		{
			heading: 'Why this is a version-control decision',
			blocks: [
				{
					kind: 'p',
					text: 'Line breaks in prose are invisible when rendered. Markdown joins consecutive lines into one paragraph, so where you break is purely a source-level choice — and therefore purely a diff-level choice.',
				},
				{
					kind: 'p',
					text: '`never` produces one very long line per paragraph. Change a word and the diff shows the entire paragraph as modified, which makes review of a documentation change roughly useless.',
				},
				{
					kind: 'p',
					text: '`always` produces neatly filled paragraphs, but reflows. Insert a word near the start and every subsequent line shifts, so a one-word change can rewrite ten lines. It looks tidy in the file and reads badly in a pull request.',
				},
				{
					kind: 'p',
					text: 'There is a third convention Prettier cannot enforce but `preserve` permits, sometimes called semantic linefeeds: break at clause and sentence boundaries, one sentence per line. Changing a sentence then touches exactly one line, which is the best diff behaviour of the three — and it only works if the formatter leaves your breaks alone.',
				},
			],
		},
		{
			heading: 'Choosing a value',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Keep `preserve` for documentation that is reviewed in pull requests. It is the only setting compatible with one-sentence-per-line.',
						'Choose `always` for prose that is rarely diffed and often read raw — a changelog, generated docs, notes nobody reviews line by line.',
						'Choose `never` essentially never. It optimises for a rendering concern that does not exist and destroys diff legibility.',
					],
				},
			],
		},
		{
			heading: 'Interaction with printWidth and tables',
			blocks: [
				{
					kind: 'p',
					text: 'Under `always`, `printWidth` becomes the wrap column for prose. Under `preserve` and `never`, `printWidth` has no effect on paragraphs at all — a common source of confusion when someone sets `printWidth` and finds their Markdown unchanged.',
				},
				{
					kind: 'p',
					text: 'Markdown tables are formatted independently of this option. Prettier aligns table columns regardless, which is one of the more useful things it does to Markdown and is not something `proseWrap` can switch off.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Setting `printWidth` and expecting Markdown paragraphs to wrap. You also need `proseWrap: "always"`.',
						'Choosing `always` for a docs site that takes community pull requests, then finding every contribution reflows unrelated lines.',
						'Assuming `preserve` means Prettier does nothing to Markdown — it still normalises list markers, emphasis characters, and table alignment.',
						'Applying it to code and expecting line wrapping. Use `printWidth`.',
					],
				},
			],
		},
		{
			heading: 'What Prettier does to Markdown regardless',
			blocks: [
				{
					kind: 'p',
					text: '`preserve` stops Prettier reflowing paragraphs; it does not stop it formatting Markdown. The normalisations it applies either way are worth knowing, because they surprise people who expected `preserve` to mean untouched:',
				},
				{
					kind: 'ul',
					items: [
						'List markers are normalised to a single character — `-` for unordered lists — and their indentation is regularised.',
						'Emphasis markers are normalised, so `__bold__` becomes `**bold**`.',
						'Table columns are padded so the pipes line up.',
						'Ordered list numbering is made consistent.',
						'Fenced code blocks are formatted with the parser matching their language label.',
					],
				},
				{
					kind: 'p',
					text: 'That last one is often the most valuable thing Prettier does to a documentation repository, and it is entirely independent of this option.',
				},
			],
		},
		{
			heading: 'CJK text and why always can misjudge width',
			blocks: [
				{
					kind: 'p',
					text: '`always` fills lines up to `printWidth`, measured in characters. Chinese, Japanese and Korean characters render roughly twice as wide as Latin ones in a monospace font, so a line of eighty CJK characters occupies about a hundred and sixty columns.',
				},
				{
					kind: 'p',
					text: 'If you are wrapping CJK prose with `always`, expect the rendered result to be wider than the number suggests, and set `printWidth` lower for those files with an `overrides` block if it matters. For most CJK documentation `preserve` is the better answer anyway, since the language does not use spaces as break opportunities in the way the algorithm assumes.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Why is my Markdown not wrapping at printWidth?',
			answer:
				'Because `proseWrap` defaults to `preserve`, which leaves your line breaks untouched. Set it to `always` for Prettier to reflow paragraphs to `printWidth`.',
		},
		{
			question: 'What is one-sentence-per-line and does Prettier support it?',
			answer:
				'It is the convention of breaking prose at sentence boundaries so each edit touches one line. Prettier supports it only in the sense that `preserve` does not interfere — it will not produce the breaks for you.',
		},
		{
			question: 'Does proseWrap affect comments in code?',
			answer:
				'No. It applies to prose formats such as Markdown. Comments inside JavaScript are left as written.',
		},
	],
};

export default article;
