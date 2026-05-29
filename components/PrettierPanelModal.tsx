'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, ArrowUpAZ, ArrowDownAZ, FileJson, Play, Code2, Loader2, Share2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { sortConfig, type SortOrder } from '@/lib/sortConfig';
import { useIsMobile } from '@/hooks/use-mobile';
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
		<div className="bg-muted/30 text-muted-foreground flex h-40 items-center justify-center rounded-md border text-xs">
			<Loader2 className="mr-2 h-4 w-4 animate-spin" />
			Loading editor…
		</div>
	),
});

type ViewMode = 'config' | 'preview' | 'yourcode';

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

export function PrettierPanelModal({
	open,
	config,
	onClose,
	selectedOptions,
	format,
	userCode: userCodeProp,
	onUserCodeChange,
	parserOverride: parserOverrideProp,
	onParserOverrideChange,
	onShare,
}: PrettierPanelModalProps) {
	const t = useTranslations('Page.ConfigAside');
	const isMobile = useIsMobile();
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
	const [parserOverrideLocal, setParserOverrideLocal] = useState<ParserId | null>(null);
	const parserOverride =
		parserOverrideProp !== undefined ? parserOverrideProp : parserOverrideLocal;
	const setParserOverride = onParserOverrideChange ?? setParserOverrideLocal;
	const detectedParser = useMemo(() => detectParser(userCode), [userCode]);
	const activeParser: ParserId = parserOverride ?? detectedParser;
	const [diffSettings, updateDiffSettings] = useDiffSettings();

	const displayConfig = useMemo(() => sortConfig(config, sortOrder), [config, sortOrder]);

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
			toast.success('Config copied to clipboard!');
		}
	};

	const copyFormatted = async (text: string) => {
		if (text) {
			await navigator.clipboard.writeText(text);
			toast.success('Copied to clipboard!');
		}
	};

	const tabBar = (
		<div className="flex items-center gap-2 pt-2">
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
									aria-label="Copy shareable URL"
								>
									<Share2 className="h-3.5 w-3.5" />
								</Button>
							}
						/>
						<TooltipContent>Copy shareable URL</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);

	const content = (
		<div className="space-y-3">
			{/* ── CONFIG TAB ── */}
			{viewMode === 'config' && (
				<>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-sm font-medium">Sort:</span>
							<Button
								variant={sortOrder === 'asc' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setSortOrder('asc')}
								className="text-xs"
							>
								<ArrowDownAZ className="mr-1 h-3 w-3" />
								A-Z
							</Button>
							<Button
								variant={sortOrder === 'desc' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setSortOrder('desc')}
								className="text-xs"
							>
								<ArrowUpAZ className="mr-1 h-3 w-3" />
								Z-A
							</Button>
						</div>
						<Button
							onClick={copyConfig}
							size="sm"
							disabled={!displayConfig}
						>
							<Copy className="mr-2 h-4 w-4" />
							{t('copyConfig')}
						</Button>
					</div>

					{displayConfig && (
						<SyntaxHighlighter
							language="json"
							style={atomDark}
							customStyle={{ fontSize: '0.75rem', borderRadius: '0.375rem', margin: 0 }}
						>
							{displayConfig}
						</SyntaxHighlighter>
					)}

					<p className="text-muted-foreground text-center text-xs">
						Copy and paste this into .prettierrc file.
					</p>
				</>
			)}

			{/* ── PREVIEW TAB ── */}
			{viewMode === 'preview' && (
				<>
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

					<Button
						variant="outline"
						onClick={() => copyFormatted(formattedPreview)}
						className="w-full"
						disabled={!formattedPreview}
					>
						<Copy className="mr-2 h-4 w-4" />
						{t('copyFormatted')}
					</Button>
				</>
			)}

			{/* ── YOUR CODE TAB ── */}
			{viewMode === 'yourcode' && (
				<>
					<div>
						<p className="text-muted-foreground mb-1 text-xs font-medium">{t('pastePrompt')}</p>
						<CodeEditor
							value={userCode}
							onChange={setUserCode}
							parser={activeParser}
							placeholder="// Paste your code here…"
							minHeight="9rem"
						/>
					</div>

					{userError && <FormatError message={userError} />}

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

					<Button
						variant="outline"
						onClick={() => copyFormatted(formattedUser)}
						className="w-full"
						disabled={!formattedUser}
					>
						<Copy className="mr-2 h-4 w-4" />
						{t('copyFormatted')}
					</Button>
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
						<DrawerTitle>Prettier Configuration</DrawerTitle>
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
					<DialogTitle>Prettier Configuration</DialogTitle>
					{tabBar}
				</DialogHeader>
				<div className="overflow-auto">{content}</div>
			</DialogContent>
		</Dialog>
	);
}
