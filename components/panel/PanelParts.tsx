'use client';

/**
 * Shared presentational leaves for the Prettier config panel. The desktop
 * `PrettierPanel` and the mobile `PrettierPanelModal` both compose these so
 * the only thing each shell owns is its outer container chrome (sticky-footer
 * scroll columns vs. Dialog/Drawer flow). All behaviour lives in
 * `usePrettierPanel`; these components are pure rendering.
 */

import dynamic from 'next/dynamic';
import { ArrowDownAZ, ArrowUpAZ, Code2, FileJson, Loader2, Play, Share2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CodeDiff } from '@/components/CodeDiff';
import { CopyButton } from '@/components/CopyButton';
import { DiffViewToggle } from '@/components/DiffViewToggle';
import { FormatError } from '@/components/FormatError';
import { ParserPicker } from '@/components/ParserPicker';
import type { SortOrder } from '@/lib/sortConfig';
import type { ParserId } from '@/lib/parsers';
import type { PanelViewMode } from '@/common/interface/panel';
import type { UsePrettierPanelResult } from '@/hooks/usePrettierPanel';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
	ssr: false,
	loading: () => (
		<div className="bg-muted/30 text-muted-foreground flex h-48 items-center justify-center rounded-md border text-xs">
			<Loader2
				className="h-4 w-4 animate-spin"
				aria-hidden
			/>
		</div>
	),
});

type Translate = UsePrettierPanelResult['t'];

/** Inline spinner used by every "formatting…" state so they look identical. */
export function PanelLoading({ label }: { label: string }) {
	return (
		<div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
			<Loader2 className="h-4 w-4 animate-spin" />
			{label}
		</div>
	);
}

/** The three-tab segmented control. Constant width so switching never shifts it. */
export function PanelTabBar({
	viewMode,
	onViewModeChange,
	t,
}: {
	viewMode: PanelViewMode;
	onViewModeChange: (m: PanelViewMode) => void;
	t: Translate;
}) {
	const tabs: { mode: PanelViewMode; icon: typeof FileJson; label: string }[] = [
		{ mode: 'config', icon: FileJson, label: t('configTab') },
		{ mode: 'preview', icon: Play, label: t('previewTab') },
		{ mode: 'yourcode', icon: Code2, label: t('yourCodeTab') },
	];
	return (
		<div className="flex flex-1 gap-1">
			{tabs.map(({ mode, icon: Icon, label }) => (
				<Button
					key={mode}
					variant={viewMode === mode ? 'default' : 'secondary'}
					size="sm"
					className="flex-1 text-xs"
					onClick={() => onViewModeChange(mode)}
				>
					<Icon className="mr-1 h-3 w-3" />
					{label}
				</Button>
			))}
		</div>
	);
}

/** A→Z / Z→A sort toggle for the Config tab. */
export function PanelSortControls({
	sortOrder,
	onSortOrderChange,
	t,
}: {
	sortOrder: SortOrder;
	onSortOrderChange: (o: SortOrder) => void;
	t: Translate;
}) {
	return (
		<div className="flex items-center gap-2">
			<span className="text-muted-foreground text-sm font-medium">{t('sortLabel')}</span>
			<div className="flex gap-1">
				<Button
					variant={sortOrder === 'asc' ? 'default' : 'outline'}
					size="sm"
					onClick={() => onSortOrderChange('asc')}
					className="text-xs"
					aria-label={t('sortAsc')}
				>
					<ArrowDownAZ className="mr-1 h-3 w-3" />
					{t('sortAsc')}
				</Button>
				<Button
					variant={sortOrder === 'desc' ? 'default' : 'outline'}
					size="sm"
					onClick={() => onSortOrderChange('desc')}
					className="text-xs"
					aria-label={t('sortDesc')}
				>
					<ArrowUpAZ className="mr-1 h-3 w-3" />
					{t('sortDesc')}
				</Button>
			</div>
		</div>
	);
}

/** Syntax-highlighted generated JSON. */
export function PanelConfigJson({ displayConfig }: { displayConfig: string }) {
	return (
		<SyntaxHighlighter
			language="json"
			style={atomDark}
			customStyle={{ fontSize: '0.75rem', borderRadius: '0.375rem', margin: 0 }}
		>
			{displayConfig}
		</SyntaxHighlighter>
	);
}

/** Parser picker + unified/split diff toggle. Shared by Preview + Your Code. */
export function PanelToolbar({
	parserValue,
	onParserChange,
	autoDetected,
	panel,
}: {
	parserValue: ParserId;
	onParserChange: (p: ParserId) => void;
	autoDetected?: boolean;
	panel: UsePrettierPanelResult;
}) {
	return (
		<div className="flex items-center justify-end gap-2">
			<ParserPicker
				value={parserValue}
				onChange={onParserChange}
				autoDetected={autoDetected}
			/>
			<DiffViewToggle
				splitView={panel.diffSettings.splitView}
				onChange={(splitView) => panel.updateDiffSettings({ splitView })}
			/>
		</div>
	);
}

/** Icon-only Share button with tooltip. Rendered only when sharing is enabled. */
export function PanelShareButton({ onShare, t }: { onShare: () => void; t: Translate }) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							variant="outline"
							size="icon"
							onClick={onShare}
							aria-label={t('shareButton')}
						>
							<Share2 className="h-4 w-4" />
						</Button>
					}
				/>
				<TooltipContent>{t('shareButton')}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

/**
 * Copy (with checkmark feedback) + optional Share, as a horizontal row. The
 * shells wrap this in either a sticky footer (desktop) or inline flow (modal).
 */
export function PanelCopyShare({
	onCopy,
	label,
	ariaLabel,
	disabled,
	onShare,
	t,
}: {
	onCopy: () => void | Promise<void>;
	label: string;
	ariaLabel: string;
	disabled?: boolean;
	onShare?: () => void;
	t: Translate;
}) {
	return (
		<div className="flex gap-2">
			<CopyButton
				onCopy={onCopy}
				label={label}
				aria-label={ariaLabel}
				disabled={disabled}
				className="flex-1"
			/>
			{onShare && (
				<PanelShareButton
					onShare={onShare}
					t={t}
				/>
			)}
		</div>
	);
}

/** Loading / formatted-diff body for the Preview tab. */
export function PanelPreviewDiff({ panel }: { panel: UsePrettierPanelResult }) {
	return (
		<>
			{panel.previewError && <FormatError message={panel.previewError} />}
			{panel.isFormattingPreview || !panel.formattedPreview ? (
				<PanelLoading label={panel.t('formatting')} />
			) : (
				<CodeDiff
					oldValue={panel.previewSample}
					newValue={panel.formattedPreview}
					splitView={panel.diffSettings.splitView}
					tokenModel={panel.diffSettings.tokenModel}
					onTokenModelChange={(tokenModel) => panel.updateDiffSettings({ tokenModel })}
				/>
			)}
		</>
	);
}

/** Paste editor + formatted-diff body for the Your Code tab. */
export function PanelYourCode({
	panel,
	editorMinHeight,
}: {
	panel: UsePrettierPanelResult;
	editorMinHeight?: string;
}) {
	return (
		<>
			<div>
				<p className="text-muted-foreground mb-1 text-xs font-medium">{panel.t('pastePrompt')}</p>
				<CodeEditor
					value={panel.userCode}
					onChange={panel.setUserCode}
					parser={panel.activeParser}
					placeholder={panel.t('editorPlaceholder')}
					minHeight={editorMinHeight}
				/>
			</div>

			{panel.userError && <FormatError message={panel.userError} />}

			{(panel.userCode.trim() || panel.isFormattingUser) && (
				<div>
					<p className="text-muted-foreground mb-1 text-xs font-medium">
						{panel.t('formattedOutput')}
					</p>
					{panel.isFormattingUser ? (
						<PanelLoading label={panel.t('formatting')} />
					) : panel.formattedUser ? (
						<CodeDiff
							oldValue={panel.userCode}
							newValue={panel.formattedUser}
							splitView={panel.diffSettings.splitView}
							tokenModel={panel.diffSettings.tokenModel}
							onTokenModelChange={(tokenModel) => panel.updateDiffSettings({ tokenModel })}
						/>
					) : null}
				</div>
			)}
		</>
	);
}
