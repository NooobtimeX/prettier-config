'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
	Copy,
	ArrowUpAZ,
	ArrowDownAZ,
	RotateCcw,
	FileJson,
	Play,
	Code2,
	Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { sortConfig, type SortOrder } from '@/lib/sortConfig';
import { useTranslations } from 'next-intl';
import { DEFAULT_SAMPLE } from '@/lib/sample';
import type { FormatFn } from '@/lib/prettierLoader';
import { CodeDiff } from '@/components/CodeDiff';
import { DiffViewToggle } from '@/components/DiffViewToggle';
import { useDiffSettings } from '@/hooks/useDiffSettings';

type ViewMode = 'config' | 'preview' | 'yourcode';

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
}

export function PrettierPanel({
	config,
	onReset,
	hasConfig,
	selectedOptions,
	format,
}: PrettierPanelProps) {
	const t = useTranslations('Page.ConfigAside');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
	const [viewMode, setViewMode] = useState<ViewMode>('config');
	const [userCode, setUserCode] = useState('');
	const [formattedPreview, setFormattedPreview] = useState('');
	const [formattedUser, setFormattedUser] = useState('');
	const [isFormattingPreview, setIsFormattingPreview] = useState(false);
	const [isFormattingUser, setIsFormattingUser] = useState(false);
	const [diffSettings, updateDiffSettings] = useDiffSettings();

	const displayConfig = useMemo(() => sortConfig(config, sortOrder), [config, sortOrder]);

	// Format preview sample whenever options/version change or preview tab is active.
	useEffect(() => {
		let cancelled = false;
		void (async () => {
			if (viewMode !== 'preview') return;
			setIsFormattingPreview(true);
			const result = await format(DEFAULT_SAMPLE, selectedOptions);
			if (!cancelled) {
				setFormattedPreview(result);
				setIsFormattingPreview(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [selectedOptions, viewMode, format]);

	// Format user code whenever user types or options/version change.
	useEffect(() => {
		let cancelled = false;
		void (async () => {
			if (viewMode !== 'yourcode' || !userCode.trim()) {
				if (!cancelled) setFormattedUser('');
				return;
			}
			setIsFormattingUser(true);
			const result = await format(userCode, selectedOptions);
			if (!cancelled) {
				setFormattedUser(result);
				setIsFormattingUser(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [userCode, selectedOptions, viewMode, format]);

	const copyConfig = async () => {
		if (displayConfig) {
			await navigator.clipboard.writeText(displayConfig);
			toast.success('Config copied to clipboard!');
		}
	};

	const copyFormatted = async (text: string) => {
		if (text) {
			await navigator.clipboard.writeText(text);
			toast.success('Copied to clipboard!');
		}
	};

	return (
		<div className="relative flex h-full flex-col overflow-hidden rounded-lg border-l">
			{/* Sticky Header */}
			<div className="bg-background/95 sticky top-0 z-10 shrink-0 rounded-t-lg border-b backdrop-blur">
				<div className="flex items-center gap-2 p-2">
					{/* Tab bar */}
					<div className="flex flex-1 gap-1">
						<Button
							variant={viewMode === 'config' ? 'default' : 'secondary'}
							size="sm"
							className="flex-1 text-xs"
							onClick={() => setViewMode('config')}
						>
							<FileJson className="mr-1 h-3 w-3" />
							{t('configTab')}
						</Button>
						<Button
							variant={viewMode === 'preview' ? 'default' : 'secondary'}
							size="sm"
							className="flex-1 text-xs"
							onClick={() => setViewMode('preview')}
						>
							<Play className="mr-1 h-3 w-3" />
							{t('previewTab')}
						</Button>
						<Button
							variant={viewMode === 'yourcode' ? 'default' : 'secondary'}
							size="sm"
							className="flex-1 text-xs"
							onClick={() => setViewMode('yourcode')}
						>
							<Code2 className="mr-1 h-3 w-3" />
							{t('yourCodeTab')}
						</Button>
					</div>
					{viewMode !== 'config' && (
						<DiffViewToggle
							splitView={diffSettings.splitView}
							onChange={(splitView) => updateDiffSettings({ splitView })}
						/>
					)}
				</div>
			</div>

			{/* ── CONFIG TAB ── */}
			{viewMode === 'config' && (
				<div className="flex min-h-0 flex-1 flex-col overflow-auto">
					{hasConfig && displayConfig ? (
						<>
							{/* Sort Controls */}
							<div className="shrink-0 border-b p-2">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex justify-center gap-2">
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger
													render={
														<Button
															size="sm"
															variant="secondary"
															onClick={onReset}
															aria-label="Reset Config"
														>
															<RotateCcw className="mr-2 h-4 w-4" />
															Reset
														</Button>
													}
												/>
												<TooltipContent>Reset Selections</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									<div className="flex flex-1 items-center justify-end gap-2">
										<span className="text-muted-foreground text-sm font-medium">Sort:</span>
										<div className="flex gap-1">
											<Button
												variant={sortOrder === 'asc' ? 'default' : 'outline'}
												size="sm"
												onClick={() => setSortOrder('asc')}
												className="text-xs"
												aria-label="Sort A to Z"
											>
												<ArrowDownAZ className="mr-1 h-3 w-3" />
												A-Z
											</Button>
											<Button
												variant={sortOrder === 'desc' ? 'default' : 'outline'}
												size="sm"
												onClick={() => setSortOrder('desc')}
												className="text-xs"
												aria-label="Sort Z to A"
											>
												<ArrowUpAZ className="mr-1 h-3 w-3" />
												Z-A
											</Button>
										</div>
									</div>
								</div>
							</div>

							{/* Config Display */}
							<div className="min-h-0 flex-1 overflow-auto p-2">
								<SyntaxHighlighter
									language="json"
									style={atomDark}
									customStyle={{ fontSize: '0.75rem', borderRadius: '0.375rem', margin: 0 }}
								>
									{displayConfig}
								</SyntaxHighlighter>
							</div>

							<p className="text-muted-foreground shrink-0 px-4 py-2 text-center text-xs">
								Copy and paste this into .prettierrc file.
							</p>

							<div className="bg-background/95 sticky bottom-0 z-10 shrink-0 rounded-b-lg border-t p-2 backdrop-blur">
								<Button
									variant="outline"
									onClick={copyConfig}
									aria-label="Copy Config"
									className="w-full"
									disabled={!displayConfig}
								>
									<Copy className="mr-2 h-4 w-4" />
									{t('copyConfig')}
								</Button>
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
					<div className="min-h-0 flex-1 overflow-auto p-2">
						{isFormattingPreview || !formattedPreview ? (
							<div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
								<Loader2 className="h-4 w-4 animate-spin" />
								{t('formatting')}
							</div>
						) : (
							<CodeDiff
								oldValue={DEFAULT_SAMPLE}
								newValue={formattedPreview}
								splitView={diffSettings.splitView}
								tokenModel={diffSettings.tokenModel}
								onTokenModelChange={(tokenModel) => updateDiffSettings({ tokenModel })}
							/>
						)}
					</div>

					<div className="bg-background/95 sticky bottom-0 z-10 shrink-0 rounded-b-lg border-t p-2 backdrop-blur">
						<Button
							variant="outline"
							onClick={() => copyFormatted(formattedPreview)}
							aria-label="Copy Formatted"
							className="w-full"
							disabled={!formattedPreview}
						>
							<Copy className="mr-2 h-4 w-4" />
							{t('copyFormatted')}
						</Button>
					</div>
				</div>
			)}

			{/* ── YOUR CODE TAB ── */}
			{viewMode === 'yourcode' && (
				<div className="flex min-h-0 flex-1 flex-col overflow-auto">
					<div className="flex-1 space-y-3 overflow-auto p-2">
						{/* Input */}
						<div>
							<p className="text-muted-foreground mb-1 text-xs font-medium">{t('pastePrompt')}</p>
							<textarea
								className="bg-background focus:ring-ring w-full resize-none rounded-md border p-2 font-mono text-xs focus:ring-1 focus:outline-none"
								rows={8}
								placeholder="// Paste your JS / TS code here…"
								value={userCode}
								onChange={(e) => setUserCode(e.target.value)}
							/>
						</div>

						{/* Diff */}
						{(userCode.trim() || isFormattingUser) && (
							<div>
								<p className="text-muted-foreground mb-1 text-xs font-medium">
									{t('formattedOutput')}
								</p>
								{isFormattingUser ? (
									<div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
										<Loader2 className="h-4 w-4 animate-spin" />
										{t('formatting')}
									</div>
								) : formattedUser ? (
									<CodeDiff
										oldValue={userCode}
										newValue={formattedUser}
										splitView={diffSettings.splitView}
										tokenModel={diffSettings.tokenModel}
										onTokenModelChange={(tokenModel) => updateDiffSettings({ tokenModel })}
									/>
								) : null}
							</div>
						)}
					</div>

					<div className="bg-background/95 sticky bottom-0 z-10 shrink-0 rounded-b-lg border-t p-2 backdrop-blur">
						<Button
							variant="outline"
							onClick={() => copyFormatted(formattedUser)}
							aria-label="Copy Formatted"
							className="w-full"
							disabled={!formattedUser}
						>
							<Copy className="mr-2 h-4 w-4" />
							{t('copyFormatted')}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
