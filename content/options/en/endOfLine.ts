import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'line endings, and the Windows diff problem this option was created to end',
	summary:
		'`endOfLine` sets the line-ending characters Prettier writes. The default `lf` is the right answer on every platform including Windows, and the reason is that line endings are a repository-level decision that should never vary by who checked the code out.',
	sections: [
		{
			heading: 'What the four values do',
			blocks: [
				{
					kind: 'ul',
					items: [
						'`lf` (default) — a single `\\n`. The Unix convention and the one Git stores internally.',
						'`crlf` — `\\r\\n`. The Windows convention.',
						'`cr` — a bare `\\r`. Classic Mac OS, effectively obsolete; included for completeness.',
						'`auto` — keep whatever the first line ending in the file already uses.',
					],
				},
			],
		},
		{
			heading: 'Why the default is lf everywhere',
			blocks: [
				{
					kind: 'p',
					text: "Before Prettier 2, the default was `auto`, and the result was a recurring and thoroughly unpleasant bug. A Windows developer would check out a repository with Git's `core.autocrlf` converting endings to CRLF, run Prettier, and produce a diff in which every line of every touched file appeared modified — because every line ending had changed.",
				},
				{
					kind: 'p',
					text: 'Prettier 2 changed the default to `lf` precisely to stop that. With `lf`, the file on disk has the same bytes regardless of platform, so the diff shows only real changes.',
				},
				{
					kind: 'p',
					text: 'Windows is not a reason to choose `crlf`. Every current Windows editor, and Notepad since 2018, reads LF files correctly. The convention costs nothing on Windows and saves a great deal everywhere else.',
				},
			],
		},
		{
			heading: 'Getting Git to agree',
			blocks: [
				{
					kind: 'p',
					text: "Setting `endOfLine` alone is not enough if Git is still converting on checkout. The reliable fix is a `.gitattributes` file, which applies to everyone who clones the repository rather than depending on each developer's local configuration:",
				},
				{
					kind: 'code',
					code: '* text=auto eol=lf',
					caption: '.gitattributes — normalise in the repository, LF in the working tree.',
				},
				{
					kind: 'p',
					text: "With that in place, Git stores LF and checks out LF on every platform, and Prettier's `lf` setting agrees with it. If you add this to an existing repository you will need one normalising commit — `git add --renormalize .` — and it will be large.",
				},
			],
		},
		{
			heading: 'When to use crlf or auto',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Use `crlf` only if something downstream genuinely requires it — certain Windows-only build tools, or files consumed by legacy systems. Scope it with an `overrides` block rather than setting it globally.',
						'Use `auto` only for a repository that already contains a deliberate mix and that you are not ready to normalise. It is a way of postponing the decision, not making one.',
						'Otherwise leave it at `lf` and add the `.gitattributes` line.',
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
						'Setting `endOfLine` but not `.gitattributes`, so Git converts on checkout and Prettier converts back on save.',
						'Choosing `crlf` because the team uses Windows. It is not necessary and it exports the problem to everyone else.',
						'Normalising line endings in a commit that also contains real changes, which makes the real changes impossible to find.',
						'Leaving ESLint’s `linebreak-style` rule enabled, which will disagree with Prettier on at least one machine.',
					],
				},
			],
		},
	],
	faq: [
		{
			question: 'Why does every line show as changed in my diff?',
			answer:
				'Almost always a line-ending mismatch: Git is checking out CRLF while Prettier writes LF, or the reverse. Add `* text=auto eol=lf` to `.gitattributes` and run `git add --renormalize .` once.',
		},
		{
			question: 'Should Windows developers use crlf?',
			answer:
				'No. Every current Windows editor handles LF, and `crlf` creates cross-platform diff noise for everyone else. Keep `lf` and let `.gitattributes` enforce it.',
		},
		{
			question: 'What does auto actually do?',
			answer:
				'It preserves whichever ending the file already uses, judged from its first line. It was the pre-Prettier-2 default and is the cause of most historical line-ending churn.',
		},
	],
};

export default article;
