'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Maximize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { diffLines } from 'diff';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TokenModelPicker } from '@/components/TokenModelPicker';
import { useTokenCount } from '@/hooks/useTokenCount';
import type { TokenModelId } from '@/lib/tokenizers';
import { cn } from '@/lib/utils';

/**
 * GitHub-Desktop-style diff (unified or split): red lines for removed, green
 * for added, unchanged lines in between. Used by the Preview and Your Code tabs
 * to highlight exactly what Prettier changed.
 *
 * `react-diff-viewer-continued` spawns a web worker for large diffs and uses
 * refs internally, so we load it client-only via `next/dynamic` to keep SSR
 * out of its path.
 */
const ReactDiffViewer = dynamic(() => import('react-diff-viewer-continued'), {
	ssr: false,
	loading: () => (
		<div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
			<Loader2
				className="h-4 w-4 animate-spin"
				aria-hidden
			/>
		</div>
	),
});

interface CodeDiffProps {
	oldValue: string;
	newValue: string;
	/** Side-by-side instead of unified (default unified). */
	splitView?: boolean;
	/** Hide gutter line numbers when horizontal space is tight. */
	hideLineNumbers?: boolean;
	/** Tokenizer model for the `N → M tokens` badge in the header. */
	tokenModel: TokenModelId;
	onTokenModelChange: (model: TokenModelId) => void;
}

/** Count added / removed lines so we can render a GitHub-style `+X −Y` header. */
function countLineChanges(oldValue: string, newValue: string) {
	const changes = diffLines(oldValue, newValue);
	let added = 0;
	let removed = 0;
	for (const change of changes) {
		if (change.added) added += change.count ?? 0;
		else if (change.removed) removed += change.count ?? 0;
	}
	return { added, removed };
}

const DIFF_VIEWER_STYLES = {
	codeFold: { display: 'none' },
	codeFoldGutter: { display: 'none' },
	variables: {
		dark: {
			diffViewerBackground: '#1d1f21',
			diffViewerColor: '#fafafa',
			addedBackground: '#0e3c2a',
			addedColor: '#e6ffe6',
			removedBackground: '#451b1f',
			removedColor: '#ffe6e6',
			wordAddedBackground: '#1b6e3e',
			wordRemovedBackground: '#7a2329',
			gutterBackground: '#161819',
			gutterBackgroundDark: '#161819',
			gutterColor: '#7c7f87',
			emptyLineBackground: '#1a1a1c',
			codeFoldGutterBackground: '#161819',
			codeFoldBackground: '#161819',
			codeFoldContentColor: '#7c7f87',
		},
	},
	contentText: {
		fontSize: '0.75rem',
		fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
	},
	lineNumber: { fontSize: '0.6875rem' },
};

export function CodeDiff({
	oldValue,
	newValue,
	splitView = false,
	hideLineNumbers = false,
	tokenModel,
	onTokenModelChange,
}: CodeDiffProps) {
	const t = useTranslations('Page.tokens');
	const tConfigAside = useTranslations('Page.ConfigAside');
	const [expanded, setExpanded] = useState(false);
	const { added, removed } = useMemo(
		() => countLineChanges(oldValue, newValue),
		[oldValue, newValue],
	);

	const unchanged = added === 0 && removed === 0;
	const tokens = useTokenCount(oldValue, newValue, tokenModel);

	const formatCount = (n: number | null) => (n === null ? '…' : n.toLocaleString());

	const renderHeader = (inDialog: boolean) => (
		<div className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-1.5">
			<span className="text-muted-foreground text-xs">
				{unchanged ? t('noChanges') : t('prettierChanges')}
			</span>
			<div className="flex flex-wrap items-center gap-3">
				<span className="flex items-center gap-2 text-xs font-medium tabular-nums">
					<span className="text-emerald-500">+{added}</span>
					<span className="text-rose-500">−{removed}</span>
				</span>
				<span
					className={cn(
						'flex items-center gap-1 text-xs tabular-nums',
						tokens.approximate ? 'text-muted-foreground/70' : 'text-muted-foreground',
					)}
					title={tokens.approximate ? t('approximateTitle') : t('exactTitle')}
				>
					<span>{tokens.approximate ? '~' : ''}</span>
					<span>{formatCount(tokens.old)}</span>
					<span aria-hidden>→</span>
					<span>{formatCount(tokens.new)}</span>
					<span className="text-muted-foreground/70">{t('tokensLabel')}</span>
				</span>
				<TokenModelPicker
					value={tokenModel}
					onChange={onTokenModelChange}
				/>
				{!inDialog && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6"
										onClick={() => setExpanded(true)}
										aria-label={tConfigAside('expandView')}
									>
										<Maximize2 className="h-3.5 w-3.5" />
									</Button>
								}
							/>
							<TooltipContent>{tConfigAside('expandView')}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>
		</div>
	);

	const renderViewer = (hideLines: boolean) => (
		<ReactDiffViewer
			oldValue={oldValue}
			newValue={newValue}
			splitView={splitView}
			useDarkTheme
			hideLineNumbers={hideLines}
			hideSummary
			extraLinesSurroundingDiff={0}
			codeFoldMessageRenderer={() => <></>}
			styles={DIFF_VIEWER_STYLES}
		/>
	);

	return (
		<>
			<div className="overflow-hidden rounded-md border text-xs">
				{renderHeader(false)}
				<div className="overflow-x-auto">{renderViewer(hideLineNumbers)}</div>
			</div>

			<Dialog
				open={expanded}
				onOpenChange={setExpanded}
			>
				<DialogContent className="flex h-[95vh] max-h-[95vh] w-[95vw] max-w-[95vw] flex-col overflow-hidden p-0 sm:max-w-[95vw]">
					<DialogHeader className="shrink-0 border-b p-0">
						<DialogTitle className="sr-only">{tConfigAside('expandView')}</DialogTitle>
						{renderHeader(true)}
					</DialogHeader>
					<div className="min-h-0 flex-1 overflow-auto text-xs">{renderViewer(false)}</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
