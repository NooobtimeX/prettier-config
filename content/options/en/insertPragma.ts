import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'stamps a @format marker on every file Prettier formats',
	summary:
		'`insertPragma` tells Prettier to add a `@format` comment to the top of any file it formats that does not already have one. On its own it is a curiosity; paired with `requirePragma` it is the mechanism that makes gradual adoption of Prettier practical.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'With `insertPragma: true`, a formatted file gains a marker at the top if it lacked one:',
				},
				{
					kind: 'code',
					code: '/** @format */\n\nexport function run() {}',
					caption: 'Prettier adds the first three lines.',
				},
				{
					kind: 'p',
					text: 'If the file already has a leading block comment, the pragma is added to it rather than a second comment being created. Files that already carry `@format` or `@prettier` are left alone.',
				},
			],
		},
		{
			heading: 'Why it exists',
			blocks: [
				{
					kind: 'p',
					text: "The pragma is a record that a file is under Prettier's management. That record is only useful if something reads it, and the thing that reads it is `requirePragma`.",
				},
				{
					kind: 'p',
					text: 'Together they let a large codebase migrate incrementally: `requirePragma` means only marked files are formatted, and `insertPragma` means a file becomes marked the moment you format it deliberately. The formatted portion of the codebase grows as people touch code, without any commit that rewrites everything at once.',
				},
				{
					kind: 'p',
					text: 'Used without `requirePragma`, the pragma is inert — every file is formatted regardless, and the comment is decoration. That combination is occasionally used to make the tooling visible to newcomers, but it adds a line to every file for no functional benefit.',
				},
			],
		},
		{
			heading: 'Costs to weigh',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Every file gains three lines of comment, which is visible in every diff during the migration.',
						'The marker is meaningless to anyone unfamiliar with the convention, so it needs a note in the contributing guide.',
						'Removing the pragmas afterwards is its own large mechanical commit, so many projects simply leave them.',
						'Some documentation generators pick up the leading block comment as a module description.',
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
						'Enabling it without `requirePragma`, which adds a comment to every file and changes nothing else.',
						'Expecting it to add the pragma to files Prettier did not format. It only stamps files it actually rewrites.',
						'Forgetting to disable both options when the migration is complete.',
					],
				},
			],
		},
		{
			heading: 'The pragma looks different in each language',
			blocks: [
				{
					kind: 'p',
					text: 'The marker has to be a comment, and comment syntax varies. Prettier writes the right form for the file it is formatting, which is worth knowing if you are grepping for pragmas across a mixed repository:',
				},
				{
					kind: 'ul',
					items: [
						'JavaScript, TypeScript and CSS get `/** @format */`.',
						'HTML and Vue templates get `<!-- @format -->`.',
						'Markdown gets a `<!-- @format -->` comment at the top of the document.',
						'YAML gets a `# @format` line.',
					],
				},
				{
					kind: 'p',
					text: 'A search for the pragma therefore needs to cover more than the block-comment form, and any tooling you build around the convention should not assume JavaScript syntax.',
				},
			],
		},
		{
			heading: 'Existing headers and how to remove pragmas later',
			blocks: [
				{
					kind: 'p',
					text: 'When a file already opens with a block comment — a licence header, a copyright notice, a module description — Prettier adds `@format` to that comment rather than inserting a second one above it. Licence headers survive, and tools that expect the licence to be the first comment keep working.',
				},
				{
					kind: 'p',
					text: 'When the migration ends and you want the markers gone, it is a mechanical pass. Disable both options first, then strip the pragma and reformat everything in one commit — the reformat is now a no-op, so the diff contains only the removed comments:',
				},
				{
					kind: 'code',
					code: 'npx prettier --write .\n# then strip the pragma lines and commit separately',
					caption: 'Removing the markers once the migration is complete.',
				},
				{
					kind: 'p',
					text: 'Many projects simply leave them. They are inert once `requirePragma` is off, and a mechanical commit touching every file has its own cost.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Why is Prettier adding a comment to my files?',
			answer:
				'`insertPragma` is enabled. It stamps `@format` onto files it formats so that `requirePragma` can recognise them later.',
		},
		{
			question: 'Is it useful without requirePragma?',
			answer:
				'Not really. Nothing reads the marker unless `requirePragma` is on, so all it does is add a comment to every file.',
		},
	],
};

export default article;
