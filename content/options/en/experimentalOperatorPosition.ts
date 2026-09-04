import type { OptionArticle } from '@/common/interface/OptionArticle';

const article: OptionArticle = {
	tagline: 'whether a wrapped operator trails the line above or leads the line below',
	summary:
		'`experimentalOperatorPosition` decides where the operator goes when a binary expression is too long for one line. The default `end` leaves it trailing the line above; `start` moves it to the front of the continuation, so the operator is the first thing you read on each line.',
	sections: [
		{
			heading: 'What the option does',
			blocks: [
				{
					kind: 'p',
					text: 'When a chain of `&&`, `||`, `+` or a comparison has to wrap, something must decide which side of the break the operator lands on.',
				},
				{
					kind: 'code',
					code: 'const ready =\n  isLoaded &&\n  hasPermission &&\n  !isBlocked;',
					caption: 'end (default)',
				},
				{
					kind: 'code',
					code: 'const ready =\n  isLoaded\n  && hasPermission\n  && !isBlocked;',
					caption: 'start',
				},
			],
		},
		{
			heading: 'The argument for start',
			blocks: [
				{
					kind: 'p',
					text: 'Leading operators put the connective in a fixed column, so the structure of the expression is visible down the left edge. You can tell at a glance whether a chain is all `&&` or mixes in an `||`, which is exactly the mistake that produces subtle logic bugs.',
				},
				{
					kind: 'p',
					text: 'With trailing operators the connective sits at a ragged right edge, at whatever column the previous operand happened to end. Scanning for a stray `||` in a long condition means reading to the end of every line.',
				},
				{
					kind: 'p',
					text: 'Leading operators also make diffs slightly cleaner when a condition is added or removed, since the operator travels with the operand it precedes rather than being stranded on the line above.',
				},
			],
		},
		{
			heading: 'The argument for end',
			blocks: [
				{
					kind: 'p',
					text: 'Trailing operators are what almost all JavaScript looks like, and familiarity is worth something. A line ending in `&&` also signals unambiguously that the statement continues — with leading operators you have to look at the next line to know the previous one was incomplete.',
				},
				{
					kind: 'p',
					text: 'This is why the default is `end` despite the readability case for `start` being reasonably strong.',
				},
			],
		},
		{
			heading: 'Experimental status',
			blocks: [
				{
					kind: 'p',
					text: 'The `experimental` prefix is a real caveat. The option was introduced in Prettier 3.5, its behaviour on some operator combinations is still being refined, and adopting it now means accepting that a future release may reformat those expressions again.',
				},
				{
					kind: 'p',
					text: 'For a personal project that is a fine trade. For a shared codebase, waiting until the prefix is dropped avoids paying the reformat cost twice.',
				},
			],
		},
		{
			heading: 'Common mistakes',
			blocks: [
				{
					kind: 'ul',
					items: [
						'Expecting it to change single-line expressions. It only takes effect once an expression has to wrap.',
						'Assuming it covers every operator uniformly — assignment and arrow tokens follow their own rules.',
						'Adopting an experimental option across a large codebase and then absorbing a second reformat when it changes.',
					],
				},
			],
		},
		{
			heading: 'What other languages settled on',
			blocks: [
				{
					kind: 'p',
					text: "JavaScript's trailing-operator habit is not universal, and the arguments have been rehearsed elsewhere. Haskell and Elm lead with operators as a matter of course. Python's PEP 8 was revised specifically to recommend breaking *before* a binary operator, reversing its earlier advice, on the grounds that it puts the operator next to its operand and makes long formulae easier to check.",
				},
				{
					kind: 'p',
					text: 'SQL conventions overwhelmingly lead with `AND` and `OR` for the same reason: a `WHERE` clause is read as a list of conditions, and the connective belongs with the condition it introduces.',
				},
				{
					kind: 'p',
					text: 'None of that settles the question for JavaScript, where the trailing form is entrenched. But it is worth knowing that the case for `start` is not a novelty — it is the majority position in several communities that thought about it carefully.',
				},
			],
		},
		{
			heading: 'Which operators are affected',
			blocks: [
				{
					kind: 'p',
					text: 'The option governs binary and logical operators — arithmetic, comparison, `&&`, `||`, `??`, and the bitwise family. It does not govern every token that can end a wrapped line:',
				},
				{
					kind: 'ul',
					items: [
						'Assignment stays at the end of the line; a leading `=` is not produced.',
						'The arrow of an arrow function is not repositioned.',
						'Member access in a method chain follows its own rules, and already leads with `.` on each line.',
						'Ternary `?` and `:` are governed by `experimentalTernaries`, not by this option.',
					],
				},
				{
					kind: 'p',
					text: 'So enabling `start` changes boolean and arithmetic chains while leaving chained calls looking exactly as they did — which is arguably a consistency gain, since method chains already lead.',
				},
			],
		},
	],
	faq: [
		{
			question: 'Why is my short expression unaffected?',
			answer:
				'The option only applies when a binary expression wraps. Anything that fits within `printWidth` stays on one line, and there is no operator position to decide.',
		},
		{
			question: 'Should I use start?',
			answer:
				'It has a real readability advantage in long boolean chains, because the operators line up in one column. Weigh that against unfamiliarity and the experimental label — a future release may change the output again.',
		},
	],
};

export default article;
