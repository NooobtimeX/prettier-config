'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RotateCcw } from 'lucide-react';
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

interface PrettierPanelProps {
	/** The JSON string representation of the generated Prettier configuration. */
	config: string;
	/** Callback function to reset all selected options. */
	onReset: () => void;
	/** Indicates whether any options have been selected. */
	hasConfig: boolean;
	/** The current Prettier option selections (used for live preview). */
	selectedOptions: Record<string, unknown>;
	/** Version-bound formatter from the active `prettier/standalone` bundle. */
	format: FormatFn;
	/** Optional controlled user code (lifted for share-URL syncing). */
	userCode?: string;
	onUserCodeChange?: (code: string) => void;
	/** Optional controlled parser override (`null` = auto-detect). */
	parserOverride?: ParserId | null;
	onParserOverrideChange?: (parser: ParserId | null) => void;
	/** Optional Share button handler — when provided, a Share button appears. */
	onShare?: () => void;
}

/**
 * Desktop config panel — the right half of the resizable split. Owns its
 * sticky-footer scroll-column chrome; all behaviour comes from
 * `usePrettierPanel` and all inner rendering from the shared `PanelParts`.
 */
export function PrettierPanel({
	config,
	onReset,
	hasConfig,
	selectedOptions,
	format,
	userCode,
	onUserCodeChange,
	parserOverride,
	onParserOverrideChange,
	onShare,
}: PrettierPanelProps) {
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

	return (
		<div className="relative flex h-full flex-col overflow-hidden rounded-lg border-l">
			{/* Sticky header — just the tab bar (constant width). */}
			<div className="bg-background/95 sticky top-0 z-10 shrink-0 rounded-t-lg border-b backdrop-blur">
				<div className="flex items-center gap-2 p-2">
					<PanelTabBar
						viewMode={viewMode}
						onViewModeChange={panel.setViewMode}
						t={t}
					/>
				</div>
			</div>

			{/* ── CONFIG TAB ── */}
			{viewMode === 'config' && (
				<div className="flex min-h-0 flex-1 flex-col overflow-auto">
					{hasConfig && displayConfig ? (
						<>
							<div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b p-2">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger
											render={
												<Button
													size="sm"
													variant="secondary"
													onClick={onReset}
													aria-label={t('resetTooltip')}
												>
													<RotateCcw className="mr-2 h-4 w-4" />
													{t('resetButton')}
												</Button>
											}
										/>
										<TooltipContent>{t('resetTooltip')}</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<PanelSortControls
									sortOrder={panel.sortOrder}
									onSortOrderChange={panel.setSortOrder}
									t={t}
								/>
							</div>

							<div className="min-h-0 flex-1 overflow-auto p-2">
								<PanelConfigJson displayConfig={displayConfig} />
							</div>

							<p className="text-muted-foreground shrink-0 px-4 py-2 text-center text-xs">
								{t('copyInstructions')}
							</p>

							<div className="bg-background/95 sticky bottom-0 z-10 shrink-0 rounded-b-lg border-t p-2 backdrop-blur">
								<PanelCopyShare
									onCopy={panel.copyConfig}
									label={t('copyConfig')}
									ariaLabel={t('copyConfig')}
									disabled={!displayConfig}
									onShare={onShare}
									t={t}
								/>
							</div>
						</>
					) : (
						<div className="flex flex-1 items-center justify-center p-2">
							<div className="text-muted-foreground text-center">
								<p className="mb-2 text-sm">{t('noConfig')}</p>
								<p className="text-xs">{t('selectOptions')}</p>
							</div>
						</div>
					)}
				</div>
			)}

			{/* ── PREVIEW TAB ── */}
			{viewMode === 'preview' && (
				<div className="flex min-h-0 flex-1 flex-col overflow-auto">
					<div className="shrink-0 border-b p-2">
						<PanelToolbar
							parserValue={panel.diffSettings.previewParser}
							onParserChange={(previewParser) => panel.updateDiffSettings({ previewParser })}
							panel={panel}
						/>
					</div>
					<div className="min-h-0 flex-1 overflow-auto p-2">
						<PanelPreviewDiff panel={panel} />
					</div>
					<div className="bg-background/95 sticky bottom-0 z-10 shrink-0 rounded-b-lg border-t p-2 backdrop-blur">
						<PanelCopyShare
							onCopy={() => panel.copyFormatted(panel.formattedPreview)}
							label={t('copyFormatted')}
							ariaLabel={t('copyFormatted')}
							disabled={!panel.formattedPreview}
							onShare={onShare}
							t={t}
						/>
					</div>
				</div>
			)}

			{/* ── YOUR CODE TAB ── */}
			{viewMode === 'yourcode' && (
				<div className="flex min-h-0 flex-1 flex-col overflow-auto">
					<div className="shrink-0 border-b p-2">
						<PanelToolbar
							parserValue={panel.activeParser}
							onParserChange={(p) => panel.setParserOverride(p)}
							autoDetected={panel.parserOverride === null}
							panel={panel}
						/>
					</div>
					<div className="flex-1 space-y-3 overflow-auto p-2">
						<PanelYourCode panel={panel} />
					</div>
					<div className="bg-background/95 sticky bottom-0 z-10 shrink-0 rounded-b-lg border-t p-2 backdrop-blur">
						<PanelCopyShare
							onCopy={() => panel.copyFormatted(panel.formattedUser)}
							label={t('copyFormatted')}
							ariaLabel={t('copyFormatted')}
							disabled={!panel.formattedUser}
							onShare={onShare}
							t={t}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
