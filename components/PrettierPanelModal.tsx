'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import type { FormatFn } from '@/lib/prettierLoader';
import type { ParserId } from '@/lib/parsers';
import { usePrettierPanel } from '@/hooks/usePrettierPanel';
import {
	PanelConfigJson,
	PanelCopyShare,
	PanelPreviewDiff,
	PanelSortControls,
	PanelTabBar,
	PanelToolbar,
	PanelYourCode,
} from '@/components/panel/PanelParts';

interface PrettierPanelModalProps {
	open: boolean;
	config: string;
	onClose: () => void;
	/** The current Prettier option selections (used for live preview). */
	selectedOptions: Record<string, unknown>;
	/** Version-bound formatter from the active `prettier/standalone` bundle. */
	format: FormatFn;
	userCode?: string;
	onUserCodeChange?: (code: string) => void;
	parserOverride?: ParserId | null;
	onParserOverrideChange?: (parser: ParserId | null) => void;
	onShare?: () => void;
}

/**
 * Mobile/compact config panel — rendered inside a Drawer (mobile) or Dialog
 * (narrow desktop), triggered from the floating action button. Shares all
 * behaviour and inner rendering with the desktop `PrettierPanel` via
 * `usePrettierPanel` + `PanelParts`; only the container chrome differs (flow
 * layout with inline actions instead of sticky-footer scroll columns).
 */
export function PrettierPanelModal({
	open,
	config,
	onClose,
	selectedOptions,
	format,
	userCode,
	onUserCodeChange,
	parserOverride,
	onParserOverrideChange,
	onShare,
}: PrettierPanelModalProps) {
	const isMobile = useIsMobile();
	const panel = usePrettierPanel({
		config,
		selectedOptions,
		format,
		userCode,
		onUserCodeChange,
		parserOverride,
		onParserOverrideChange,
	});
	const { t, viewMode, displayConfig } = panel;

	const tabBar = (
		<div className="flex items-center gap-2 pt-2">
			<PanelTabBar
				viewMode={viewMode}
				onViewModeChange={panel.setViewMode}
				t={t}
			/>
		</div>
	);

	const content = (
		<div className="space-y-3">
			{/* ── CONFIG TAB ── */}
			{viewMode === 'config' && (
				<>
					<div className="flex items-center justify-between gap-2">
						<PanelSortControls
							sortOrder={panel.sortOrder}
							onSortOrderChange={panel.setSortOrder}
							t={t}
						/>
						<PanelCopyShare
							onCopy={panel.copyConfig}
							label={t('copyConfig')}
							ariaLabel={t('copyConfig')}
							disabled={!displayConfig}
							onShare={onShare}
							t={t}
						/>
					</div>
					{displayConfig && <PanelConfigJson displayConfig={displayConfig} />}
					<p className="text-muted-foreground text-center text-xs">{t('copyInstructions')}</p>
				</>
			)}

			{/* ── PREVIEW TAB ── */}
			{viewMode === 'preview' && (
				<>
					<PanelToolbar
						parserValue={panel.diffSettings.previewParser}
						onParserChange={(previewParser) => panel.updateDiffSettings({ previewParser })}
						panel={panel}
					/>
					<PanelPreviewDiff panel={panel} />
					<PanelCopyShare
						onCopy={() => panel.copyFormatted(panel.formattedPreview)}
						label={t('copyFormatted')}
						ariaLabel={t('copyFormatted')}
						disabled={!panel.formattedPreview}
						onShare={onShare}
						t={t}
					/>
				</>
			)}

			{/* ── YOUR CODE TAB ── */}
			{viewMode === 'yourcode' && (
				<>
					<PanelToolbar
						parserValue={panel.activeParser}
						onParserChange={(p) => panel.setParserOverride(p)}
						autoDetected={panel.parserOverride === null}
						panel={panel}
					/>
					<PanelYourCode
						panel={panel}
						editorMinHeight="9rem"
					/>
					<PanelCopyShare
						onCopy={() => panel.copyFormatted(panel.formattedUser)}
						label={t('copyFormatted')}
						ariaLabel={t('copyFormatted')}
						disabled={!panel.formattedUser}
						onShare={onShare}
						t={t}
					/>
				</>
			)}
		</div>
	);

	if (isMobile) {
		return (
			<Drawer
				open={open}
				onOpenChange={onClose}
			>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>{t('modalTitle')}</DrawerTitle>
						{tabBar}
					</DrawerHeader>
					<div className="overflow-auto p-4">{content}</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onClose}
		>
			<DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden">
				<DialogHeader>
					<DialogTitle>{t('modalTitle')}</DialogTitle>
					{tabBar}
				</DialogHeader>
				<div className="overflow-auto">{content}</div>
			</DialogContent>
		</Dialog>
	);
}
