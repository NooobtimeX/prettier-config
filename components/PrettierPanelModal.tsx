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
import { getSample } from '@/lib/sample';
import type { FormatFn } from '@/lib/prettierLoader';
import { detectParser, type ParserId } from '@/lib/parsers';
import { CodeDiff } from '@/components/CodeDiff';
import { DiffViewToggle } from '@/components/DiffViewToggle';
import { FormatError } from '@/components/FormatError';
import { ParserPicker } from '@/components/ParserPicker';
import { useDiffSettings } from '@/hooks/useDiffSettings';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
	ssr: false,
	loading: () => (
		<div className="bg-muted/30 text-muted-foreground flex h-40 items-center justify-center rounded-md border text-xs">
			<Loader2
				className="h-4 w-4 animate-spin"
				aria-hidden
			/>
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
	const previewSample = useMemo(
		() => getSample(diffSettings.previewParser),
		[diffSettings.previewParser],
	);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			if (viewMode !== 'preview') return;
			setIsFormattingPreview(true);
			const result = await format(previewSample, selectedOptions, diffSettings.previewParser);
			if (!cancelled) {
				setFormattedPreview(result.code);
				setPreviewError(result.error);
				setIsFormattingPreview(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [selectedOptions, viewMode, format, previewSample, diffSettings.previewParser]);

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
		</div>
	);

	const shareIconButton = onShare ? (
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
	) : null;

	const content = (
		<div className="space-y-3">
			{/* ── CONFIG TAB ── */}
			{viewMode === 'config' && (
				<>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-sm font-medium">{t('sortLabel')}</span>
							<Button
								variant={sortOrder === 'asc' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setSortOrder('asc')}
								className="text-xs"
							>
								<ArrowDownAZ className="mr-1 h-3 w-3" />
								{t('sortAsc')}
							</Button>
							<Button
								variant={sortOrder === 'desc' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setSortOrder('desc')}
								className="text-xs"
							>
								<ArrowUpAZ className="mr-1 h-3 w-3" />
								{t('sortDesc')}
							</Button>
						</div>
						<div className="flex gap-2">
							<Button
								onClick={copyConfig}
								size="sm"
								disabled={!displayConfig}
							>
								<Copy className="mr-2 h-4 w-4" />
								{t('copyConfig')}
							</Button>
							{shareIconButton}
						</div>
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

					<p className="text-muted-foreground text-center text-xs">{t('copyInstructions')}</p>
				</>
			)}

			{/* ── PREVIEW TAB ── */}
			{viewMode === 'preview' && (
				<>
					<div className="flex items-center justify-end gap-2">
						<ParserPicker
							value={diffSettings.previewParser}
							onChange={(previewParser) => updateDiffSettings({ previewParser })}
						/>
						<DiffViewToggle
							splitView={diffSettings.splitView}
							onChange={(splitView) => updateDiffSettings({ splitView })}
						/>
					</div>
					{previewError && <FormatError message={previewError} />}
					{isFormattingPreview || !formattedPreview ? (
						<div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
							<Loader2 className="h-4 w-4 animate-spin" />
							{t('formatting')}
						</div>
					) : (
						<CodeDiff
							oldValue={previewSample}
							newValue={formattedPreview}
							splitView={diffSettings.splitView}
							tokenModel={diffSettings.tokenModel}
							onTokenModelChange={(tokenModel) => updateDiffSettings({ tokenModel })}
						/>
					)}

					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => copyFormatted(formattedPreview)}
							className="flex-1"
							disabled={!formattedPreview}
						>
							<Copy className="mr-2 h-4 w-4" />
							{t('copyFormatted')}
						</Button>
						{shareIconButton}
					</div>
				</>
			)}

			{/* ── YOUR CODE TAB ── */}
			{viewMode === 'yourcode' && (
				<>
					<div className="flex items-center justify-end gap-2">
						<ParserPicker
							value={activeParser}
							onChange={(p) => setParserOverride(p)}
							autoDetected={parserOverride === null}
						/>
						<DiffViewToggle
							splitView={diffSettings.splitView}
							onChange={(splitView) => updateDiffSettings({ splitView })}
						/>
					</div>
					<div>
						<p className="text-muted-foreground mb-1 text-xs font-medium">{t('pastePrompt')}</p>
						<CodeEditor
							value={userCode}
							onChange={setUserCode}
							parser={activeParser}
							placeholder={t('editorPlaceholder')}
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

					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => copyFormatted(formattedUser)}
							className="flex-1"
							disabled={!formattedUser}
						>
							<Copy className="mr-2 h-4 w-4" />
							{t('copyFormatted')}
						</Button>
						{shareIconButton}
					</div>
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
