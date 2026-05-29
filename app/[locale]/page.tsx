'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { PrettierOption } from '@/components/PrettierOption';
import { PrettierPanelModal } from '@/components/PrettierPanelModal';
import { PrettierPanel } from '@/components/PrettierPanel';
import { DEFAULT_PRETTIER_VERSION, VersionPicker } from '@/components/VersionPicker';
import { usePersistedConfig } from '@/hooks/usePersistedConfig';
import { usePrettierVersion } from '@/hooks/usePrettierVersion';
import { useShareableUrl } from '@/hooks/useShareableUrl';
import { toast } from 'sonner';
import { RotateCcw, FilePlus, Loader2, FileDown } from 'lucide-react';
import type { ParserId } from '@/lib/parsers';
import { ImportConfigDialog } from '@/components/ImportConfigDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { SearchBar } from '@/components/SearchBar';
import { cn } from '@/lib/utils';
import Footer from './(components)/Footer';
import Header from './(components)/Header';

type OptionValue = string | number | boolean | string[] | null;
type SelectedOptions = Record<string, OptionValue>;

function generateConfig(selected: SelectedOptions, validKeys: Set<string>): string {
	const config: SelectedOptions = {};
	for (const [key, value] of Object.entries(selected)) {
		if (!validKeys.has(key)) continue;
		if (value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
			config[key] = value;
		}
	}
	return JSON.stringify(config, null, 2);
}

export default function HomePage() {
	const t = useTranslations('Page');

	const { version, setVersion, selected, setSelected } =
		usePersistedConfig<SelectedOptions>(DEFAULT_PRETTIER_VERSION);
	const { options, format, status, error } = usePrettierVersion(version);

	const [showConfig, setShowConfig] = useState(false);
	const [generatedConfig, setGeneratedConfig] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [openGenerateTooltip, setOpenGenerateTooltip] = useState(false);
	const [openResetTooltip, setOpenResetTooltip] = useState(false);
	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
	const [isImportOpen, setIsImportOpen] = useState(false);
	const [isLargeScreen, setIsLargeScreen] = useState(false);
	const [userCode, setUserCode] = useState('');
	const [parserOverride, setParserOverride] = useState<ParserId | null>(null);

	// Bidirectional URL hash sync — shareable links seed state on first load,
	// then every relevant change is mirrored to the hash.
	const { share } = useShareableUrl(
		{ version, selected, code: userCode, parserOverride },
		{
			setVersion,
			setSelected: (s) => setSelected(s as SelectedOptions),
			setCode: setUserCode,
			setParserOverride,
		},
	);

	const tConfigAside = useTranslations('Page.ConfigAside');
	const tErrors = useTranslations('Page.errors');
	const tImport = useTranslations('Page.import');

	const handleShare = async () => {
		const url = await share();
		if (url) toast.success(tConfigAside('shareCopiedToast'));
	};

	// Keys valid in the currently-loaded Prettier version. Selections for keys
	// that don't exist in this version (e.g. after switching from 3.5 down to 3.0)
	// stay in state but are excluded from the generated config and from
	// `hasSelectedOptions` so they don't surface in the UI.
	const validKeys = useMemo(() => new Set(options.map((o) => o.key)), [options]);

	const handleImportApply = (next: Record<string, unknown>) => {
		setSelected(next as SelectedOptions);
		setIsImportOpen(false);
		if (isLargeScreen) {
			setGeneratedConfig(generateConfig(next as SelectedOptions, validKeys));
		}
	};

	const hasSelectedOptions = Object.entries(selected).some(
		([key, value]) =>
			validKeys.has(key) &&
			value !== null &&
			value !== '' &&
			!(Array.isArray(value) && value.length === 0),
	);

	useEffect(() => {
		const checkScreenSize = () => {
			const newIsLargeScreen = window.innerWidth >= 1024;
			setIsLargeScreen(newIsLargeScreen);

			if (newIsLargeScreen && !isLargeScreen && hasSelectedOptions) {
				setGeneratedConfig(generateConfig(selected, validKeys));
			}
		};
		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);
		return () => window.removeEventListener('resize', checkScreenSize);
	}, [isLargeScreen, hasSelectedOptions, selected, validKeys]);

	useEffect(() => {
		const showTimer = setTimeout(() => {
			setOpenGenerateTooltip(true);
			setOpenResetTooltip(true);
		}, 0);
		const hideTimer = setTimeout(() => {
			setOpenGenerateTooltip(false);
			setOpenResetTooltip(false);
		}, 10000);
		return () => {
			clearTimeout(showTimer);
			clearTimeout(hideTimer);
		};
	}, []);

	useEffect(() => {
		if (isLargeScreen && hasSelectedOptions && !generatedConfig) {
			const timer = setTimeout(() => {
				setGeneratedConfig(generateConfig(selected, validKeys));
			}, 0);
			return () => clearTimeout(timer);
		}
	}, [isLargeScreen, hasSelectedOptions, selected, generatedConfig, validKeys]);

	const filteredOptions = useMemo(() => {
		if (!searchQuery.trim()) return options;
		const query = searchQuery.toLowerCase();
		return options.filter(
			(option) =>
				option.name.toLowerCase().includes(query) ||
				option.description.toLowerCase().includes(query),
		);
	}, [searchQuery, options]);

	const handleChange = (key: string, value: OptionValue) => {
		setSelected((prev) => {
			const newSelected = { ...prev, [key]: value };
			if (isLargeScreen) {
				setGeneratedConfig(generateConfig(newSelected, validKeys));
			}
			return newSelected;
		});
	};

	const handleGenerate = () => {
		setGeneratedConfig(generateConfig(selected, validKeys));
		if (!isLargeScreen) {
			setShowConfig(true);
		}
	};

	const executeReset = () => {
		setSelected({});
		setGeneratedConfig('');
		setShowConfig(false);
		setSearchQuery('');
	};

	const optionsSurface = (
		<div className="flex h-full flex-col">
			<div className="bg-background/95 sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b p-2 backdrop-blur">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					className="flex-1"
				/>
				<VersionPicker
					value={version}
					onChange={setVersion}
					disabled={status === 'loading'}
				/>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger
							render={
								<Button
									size="icon"
									variant="outline"
									className="h-8 w-8"
									onClick={() => setIsImportOpen(true)}
									disabled={status !== 'ready'}
									aria-label={tImport('ariaLabel')}
								>
									<FileDown className="h-4 w-4" />
								</Button>
							}
						/>
						<TooltipContent>{tImport('button')}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
			<div className="flex-1 overflow-auto p-2">
				{searchQuery && (
					<div className="text-muted-foreground mb-4 text-center text-sm">
						{t('search.found', {
							count: filteredOptions.length,
							total: options.length,
						})}
					</div>
				)}

				{status === 'loading' && (
					<div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
						<Loader2 className="h-4 w-4 animate-spin" />
						{tConfigAside('loadingPrettier', { version })}
					</div>
				)}

				{status === 'error' && (
					<div className="border-destructive/40 bg-destructive/5 text-destructive mx-auto my-6 max-w-md rounded-md border p-4 text-sm">
						{tErrors('prettierLoadFailed', { version })}
						{error ? `: ${error.message}` : ''}. {tErrors('networkTip')}
					</div>
				)}

				<div className={cn('grid gap-2 pb-2', 'grid-cols-[repeat(auto-fill,minmax(220px,1fr))]')}>
					{filteredOptions.map((opt) => (
						<PrettierOption
							key={opt.key}
							option={opt}
							value={selected[opt.key] ?? null}
							onChange={(val) => handleChange(opt.key, val)}
						/>
					))}
				</div>

				{status === 'ready' && searchQuery && filteredOptions.length === 0 && (
					<div className="py-12 text-center">
						<div className="text-muted-foreground mb-2 text-lg">{t('search.noOptions')}</div>
						<div className="text-muted-foreground text-sm">
							{t('search.tryOtherTerms')}{' '}
							<button
								onClick={() => setSearchQuery('')}
								className="text-primary hover:underline"
							>
								{t('search.clearSearch')}
							</button>
						</div>
					</div>
				)}

				<Footer />
			</div>
		</div>
	);

	return (
		<div className="flex h-screen flex-col">
			<div className="bg-background border-border/40 sticky top-0 z-40 shrink-0 rounded-b-3xl border-b px-2 py-2">
				<Header />
			</div>

			{isLargeScreen ? (
				<ResizablePanelGroup
					direction="horizontal"
					autoSaveId="prettier-config-layout-v2"
					className="min-h-0 flex-1"
				>
					<ResizablePanel
						defaultSize="40%"
						minSize="20%"
						maxSize="70%"
					>
						{optionsSurface}
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel
						defaultSize="60%"
						minSize="30%"
						maxSize="80%"
					>
						<PrettierPanel
							config={generatedConfig}
							onReset={() => setIsResetDialogOpen(true)}
							hasConfig={hasSelectedOptions}
							selectedOptions={selected}
							format={format}
							userCode={userCode}
							onUserCodeChange={setUserCode}
							parserOverride={parserOverride}
							onParserOverrideChange={setParserOverride}
							onShare={handleShare}
						/>
					</ResizablePanel>
				</ResizablePanelGroup>
			) : (
				<main className="flex flex-1 flex-col overflow-hidden">{optionsSurface}</main>
			)}

			{!isLargeScreen && (
				<TooltipProvider>
					<div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
						<Tooltip
							open={openGenerateTooltip}
							onOpenChange={setOpenGenerateTooltip}
						>
							<TooltipTrigger
								render={
									<Button
										size="icon"
										variant="default"
										className="h-12 w-12 rounded-full shadow-md"
										onClick={handleGenerate}
										aria-label={t('fab.generateConfig')}
									>
										<FilePlus className="h-5 w-5" />
									</Button>
								}
							/>
							<TooltipContent
								side="left"
								sideOffset={8}
							>
								{t('fab.generateConfig')}
							</TooltipContent>
						</Tooltip>

						<Tooltip
							open={openResetTooltip}
							onOpenChange={setOpenResetTooltip}
						>
							<TooltipTrigger
								render={
									<Button
										size="icon"
										variant="secondary"
										className="h-12 w-12 rounded-full shadow-md"
										onClick={() => setIsResetDialogOpen(true)}
										aria-label={t('fab.resetSelections')}
									>
										<RotateCcw className="h-5 w-5" />
									</Button>
								}
							/>
							<TooltipContent
								side="left"
								sideOffset={8}
							>
								{t('fab.resetSelections')}
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										size="icon"
										variant="outline"
										className="h-12 w-12 rounded-full shadow-md"
										onClick={() => setIsImportOpen(true)}
										disabled={status !== 'ready'}
										aria-label={tImport('ariaLabel')}
									>
										<FileDown className="h-5 w-5" />
									</Button>
								}
							/>
							<TooltipContent
								side="left"
								sideOffset={8}
							>
								{tImport('button')}
							</TooltipContent>
						</Tooltip>
					</div>
				</TooltipProvider>
			)}

			<PrettierPanelModal
				open={showConfig}
				config={generatedConfig}
				onClose={() => setShowConfig(false)}
				selectedOptions={selected}
				format={format}
				userCode={userCode}
				onUserCodeChange={setUserCode}
				parserOverride={parserOverride}
				onParserOverrideChange={setParserOverride}
				onShare={handleShare}
			/>

			<ImportConfigDialog
				open={isImportOpen}
				onOpenChange={setIsImportOpen}
				options={options}
				format={format}
				version={version}
				onApply={handleImportApply}
			/>

			<AlertDialog
				open={isResetDialogOpen}
				onOpenChange={setIsResetDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t('resetDialog.title')}</AlertDialogTitle>
						<AlertDialogDescription>{t('resetDialog.description')}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t('resetDialog.cancel')}</AlertDialogCancel>
						<AlertDialogAction onClick={executeReset}>
							{t('resetDialog.continue')}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
