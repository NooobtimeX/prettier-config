'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
	Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { sortConfig, type SortOrder } from '@/lib/sortConfig';
import { useTranslations } from 'next-intl';
import { DEFAULT_SAMPLE } from '@/lib/sample';
import type { FormatFn } from '@/lib/prettierLoader';
import { detectParser, DEFAULT_PARSER, type ParserId } from '@/lib/parsers';
import { CodeDiff } from '@/components/CodeDiff';
import { DiffViewToggle } from '@/components/DiffViewToggle';
import { FormatError } from '@/components/FormatError';
import { ParserPicker } from '@/components/ParserPicker';
import { useDiffSettings } from '@/hooks/useDiffSettings';

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
	/** Optional controlled user code (lifted for share-URL syncing). */
	userCode?: string;
	onUserCodeChange?: (code: string) => void;
	/** Optional controlled parser override (`null` = auto-detect). */
	parserOverride?: ParserId | null;
	onParserOverrideChange?: (parser: ParserId | null) => void;
	/** Optional Share button handler — when provided, a Share button appears in the header. */
	onShare?: () => void;
}

export function PrettierPanel({
	config,
	onReset,
	hasConfig,
	selectedOptions,
	format,
	userCode: userCodeProp,
	onUserCodeChange,
	parserOverride: parserOverrideProp,
	onParserOverrideChange,
	onShare,
}: PrettierPanelProps) {
	const t = useTranslations('Page.ConfigAside');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
	const [viewMode, setViewMode] = useState<ViewMode>('config');
	const [userCodeLocal, setUserCodeLocal] = useState('');
	const userCode = userCodeProp ?? userCodeLocal;
	const setUserCode = onUserCodeChange ?? setUserCodeLocal;
	const [formattedPreview, setFormattedPreview] = useState('');
	const [formattedUser, setFormattedUser] = useState('');
	const [previewError, setPreviewError] = useState<string | null>(null);
	const [userError, setUserError] = useState<string | null>(null);
	const [isFormattingPreview, setIsFormattingPreview] = useState(false);
	const [isFormattingUser, setIsFormattingUser] = useState(false);
	// `null` = auto-detect from input; otherwise the user's manual override.
	const [parserOverrideLocal, setParserOverrideLocal] = useState<ParserId | null>(null);
	const parserOverride =
		parserOverrideProp !== undefined ? parserOverrideProp : parserOverrideLocal;
	const setParserOverride = onParserOverrideChange ?? setParserOverrideLocal;
	const detectedParser = useMemo(() => detectParser(userCode), [userCode]);
	const activeParser: ParserId = parserOverride ?? detectedParser;
	const [diffSettings, updateDiffSettings] = useDiffSettings();

	const displayConfig = useMemo(() => sortConfig(config, sortOrder), [config, sortOrder]);

	// Format preview sample whenever options/version change or preview tab is active.
	// The built-in sample is a JS/JSX blob — fix its parser to `typescript` so the
	// full sample (incl. JSX) formats regardless of the user's Your-Code override.
	useEffect(() => {
		let cancelled = false;
		void (async () => {
			if (viewMode !== 'preview') return;
			setIsFormattingPreview(true);
			const result = await format(DEFAULT_SAMPLE, selectedOptions, DEFAULT_PARSER);
			if (!cancelled) {
				setFormattedPreview(result.code);
				setPreviewError(result.error);
				setIsFormattingPreview(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [selectedOptions, viewMode, format]);

	// Format user code whenever user types or options/version/parser change.
	useEffect(() => {
		let cancelled = false;
		void (async () => {
			if (viewMode !== 'yourcode' || !userCode.trim()) {
				if (!cancelled) {
					setFormattedUser('');
					setUserError(null);
				}
				return;
			}
			setIsFormattingUser(true);
			const result = await format(userCode, selectedOptions, activeParser);
			if (!cancelled) {
				setFormattedUser(result.code);
				setUserError(result.error);
				setIsFormattingUser(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [userCode, selectedOptions, viewMode, format, activeParser]);

	const copyConfig = async () => {
		if (displayConfig) {
			await navigator.clipboard.writeText(displayConfig);
			toast.success(t('configCopiedToast'));
		}
	};

	const copyFormatted = async (text: string) => {
		if (text) {
			await navigator.clipboard.writeText(text);
			toast.success(t('formattedCopiedToast'));
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
					{viewMode === 'yourcode' && (
						<ParserPicker
							value={activeParser}
							onChange={(p) => setParserOverride(p)}
							autoDetected={parserOverride === null}
						/>
					)}
					{viewMode !== 'config' && (
						<DiffViewToggle
							splitView={diffSettings.splitView}
							onChange={(splitView) => updateDiffSettings({ splitView })}
						/>
					)}
					{onShare && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger
									render={
										<Button
											variant="secondary"
											size="icon"
											className="h-7 w-7"
											onClick={onShare}
											aria-label={t('shareButton')}
										>
											<Share2 className="h-3.5 w-3.5" />
										</Button>
									}
								/>
								<TooltipContent>{t('shareButton')}</TooltipContent>
							</Tooltip>
						</TooltipProvider>
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
									</div>
									<div className="flex flex-1 items-center justify-end gap-2">
										<span className="text-muted-foreground text-sm font-medium">
											{t('sortLabel')}
										</span>
										<div className="flex gap-1">
											<Button
												variant={sortOrder === 'asc' ? 'default' : 'outline'}
												size="sm"
												onClick={() => setSortOrder('asc')}
												className="text-xs"
												aria-label={t('sortAsc')}
											>
												<ArrowDownAZ className="mr-1 h-3 w-3" />
												{t('sortAsc')}
											</Button>
											<Button
												variant={sortOrder === 'desc' ? 'default' : 'outline'}
												size="sm"
												onClick={() => setSortOrder('desc')}
												className="text-xs"
												aria-label={t('sortDesc')}
											>
												<ArrowUpAZ className="mr-1 h-3 w-3" />
												{t('sortDesc')}
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
								{t('copyInstructions')}
							</p>

							<div className="bg-background/95 sticky bottom-0 z-10 shrink-0 rounded-b-lg border-t p-2 backdrop-blur">
								<Button
									variant="outline"
									onClick={copyConfig}
									aria-label={t('copyConfig')}
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
						{previewError && <FormatError message={previewError} />}
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
							aria-label={t('copyFormatted')}
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
							<CodeEditor
								value={userCode}
								onChange={setUserCode}
								parser={activeParser}
								placeholder={t('editorPlaceholder')}
							/>
						</div>

						{userError && <FormatError message={userError} />}

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
							aria-label={t('copyFormatted')}
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
