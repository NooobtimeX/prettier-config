import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'the option that lets a huge codebase adopt Prettier one file at a time',
	summary:
		'`requirePragma` makes Prettier format only files that already carry a `@format` or `@prettier` marker in their first block comment. It exists for one purpose: introducing Prettier to a large existing codebase without a single commit that rewrites every file.',
	sections: [
		{
			heading: 'The problem it solves',
			blocks: [
				{
					kind: 'p',
					text: 'Adopting Prettier on a mature codebase normally means one enormous commit. Every file changes, `git blame` points at that commit for most lines, every open pull request conflicts, and reviewers have no way to check that nothing broke.',
				},
				{
					kind: 'p',
					text: "For a small project that is an afternoon's inconvenience. For a codebase with hundreds of thousands of lines and dozens of concurrent branches it can be enough to stop adoption entirely.",
				},
				{
					kind: 'p',
					text: '`requirePragma` inverts the default. With it enabled, Prettier formats nothing unless the file explicitly opts in:',
				},
				{
					kind: 'code',
					code: '/**\n * @format\n */\n\nexport function run() {}',
					caption: 'A file that has opted in.',
				},
				{
					kind: 'p',
					text: 'Either `@format` or `@prettier` works, and the comment must be the first block comment in the file.',
				},
			],
		},
		{
			heading: 'The adoption workflow',
			blocks: [
				{
					kind: 'p',
					text: 'On its own the option would mean adding pragmas by hand. Paired with `insertPragma` it becomes a workflow:',
				},
				{
					kind: 'ul',
					items: [
						'Enable `requirePragma` so nothing is formatted by default.',
						'Enable `insertPragma` so that any file Prettier does format gains the marker automatically.',
						'Run Prettier explicitly on a file when you are already changing it for other reasons. It gets formatted and marked, and stays formatted from then on.',
						'The formatted share of the codebase grows in step with the code people are actually touching, and each reformat rides along with a change that was going to be reviewed anyway.',
					],
				},
				{
					kind: 'p',
					text: 'When the proportion of unmarked files is small enough to reformat in one go, drop both options and format the remainder.',
				},
			],
		},
		{
			heading: 'How it differs from .prettierignore',
			blocks: [
				{
					kind: 'p',
					text: '`.prettierignore` is a path-based deny list: you name what to exclude. `requirePragma` is a content-based allow list: the file itself says whether it participates.',
				},
				{
					kind: 'p',
					text: 'That difference matters when files move. A renamed or relocated file keeps its pragma and keeps its behaviour, whereas a `.prettierignore` entry silently stops matching. For gradual adoption, where files are being refactored constantly, the content-based marker is the more robust of the two.',
				},
			],
		},
		{
			heading: 'Editor and CI considerations',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Format-on-save quietly does nothing on unmarked files, which surprises people. Say so in your contributing guide.',
						'A `--check` run in CI passes trivially for unmarked files, so CI enforces formatting only on the opted-in set — which is exactly what you want during a migration, and a gap to close once it is over.',
						'Remember to remove both options when the migration finishes. A forgotten `requirePragma` means new files silently escape formatting.',
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
						'Enabling it and wondering why Prettier appears broken. It is working; nothing has opted in yet.',
						'Putting the pragma in a line comment. It must be a block comment, and it must be the first one in the file.',
						'Enabling it without `insertPragma`, which leaves you adding markers by hand.',
						'Leaving it enabled indefinitely, so the codebase permanently contains two classes of file.',
					],
				},
			],
		},
	],
	faq: [
		{
			question: 'Why has Prettier stopped formatting anything?',
			answer:
				'If `requirePragma` is enabled, only files whose first block comment contains `@format` or `@prettier` are formatted. Everything else is left untouched by design.',
		},
		{
			question: 'Should I use this or .prettierignore?',
			answer:
				'Use `requirePragma` for gradual adoption of an existing codebase, because the marker travels with the file when it is renamed. Use `.prettierignore` for permanently excluding paths such as generated output.',
		},
		{
			question: 'Which pragma should I write?',
			answer:
				'Either `@format` or `@prettier`, inside the first block comment in the file. `insertPragma` writes `@format`.',
		},
	],
};

export default article;
