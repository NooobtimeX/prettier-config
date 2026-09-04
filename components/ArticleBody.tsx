import type { ArticleBlock, ArticleSection, InlineText } from '@/common/interface/OptionArticle';

/**
 * Renders the editorial body of an option page.
 *
 * A server component with no 'use client': the prose is serialised into the
 * static HTML and never crosses the RSC boundary as props to Header/Footer
 * (both of which are client components). That keeps ~900 words per page out of
 * the browser bundle entirely.
 *
 * There is no MDX pipeline in this repo and this deliberately does not add one.
 * Inline code is expressed with backticks inside ordinary strings and split out
 * below, so author copy is never parsed as markup and no HTML is injected.
 */

/**
 * Drops the inline-code markers for contexts that take plain text only —
 * JSON-LD `Answer.text`, meta descriptions. Rendering a literal backtick there
 * would leak the authoring convention into structured data.
 */
export function stripInlineMarkers(text: InlineText): string {
	return text.replace(/`/g, '');
}

/** `foo` -> <code>foo</code>. Odd indices are the spans that sat inside ticks. */
function renderInline(text: InlineText) {
	return text.split('`').map((segment, index) =>
		index % 2 === 1 ? (
			<code
				dir="ltr"
				key={index}
				className="bg-muted rounded px-1 py-0.5 font-mono text-[0.9em]"
			>
				{segment}
			</code>
		) : (
			segment
		),
	);
}

/** Inline-formatted prose outside a block — FAQ answers, captions. */
export function Inline({ text }: { text: InlineText }) {
	return <>{renderInline(text)}</>;
}

function Block({ block }: { block: ArticleBlock }) {
	if (block.kind === 'p') {
		return <p className="text-muted-foreground mb-4 leading-relaxed">{renderInline(block.text)}</p>;
	}

	if (block.kind === 'ul') {
		return (
			<ul className="mb-4 space-y-2">
				{block.items.map((item, index) => (
					<li
						key={index}
						className="text-muted-foreground flex gap-2 leading-relaxed"
					>
						<span
							aria-hidden="true"
							className="text-primary"
						>
							&bull;
						</span>
						<span>{renderInline(item)}</span>
					</li>
				))}
			</ul>
		);
	}

	return (
		<figure className="mb-4">
			<pre
				dir="ltr"
				className="bg-muted overflow-x-auto rounded-lg p-4 text-xs leading-relaxed"
			>
				<code className="font-mono">{block.code.trimEnd()}</code>
			</pre>
			{block.caption && (
				<figcaption className="text-muted-foreground mt-2 text-xs">
					{renderInline(block.caption)}
				</figcaption>
			)}
		</figure>
	);
}

export function ArticleBody({ sections }: { sections: readonly ArticleSection[] }) {
	return (
		<>
			{sections.map((section) => (
				<section
					key={section.heading}
					className="mb-10"
				>
					<h2 className="mb-3 text-xl font-bold">{section.heading}</h2>
					{section.blocks.map((block, index) => (
						<Block
							key={index}
							block={block}
						/>
					))}
				</section>
			))}
		</>
	);
}
