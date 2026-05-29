'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { sortConfig, type SortOrder } from '@/lib/sortConfig';
import { getSample } from '@/lib/sample';
import { detectParser, type ParserId } from '@/lib/parsers';
import type { FormatFn } from '@/lib/prettierLoader';
import { useDiffSettings, type DiffSettings } from '@/hooks/useDiffSettings';
import type { PanelViewMode } from '@/common/interface/panel';
import { DEBOUNCE_FORMAT_MS } from '@/lib/timing';

/**
 * All state, effects, and handlers shared by the desktop `PrettierPanel` and
 * the mobile `PrettierPanelModal`. Both render the same three tabs (Config /
 * Preview / Your Code) with identical formatting behaviour — only their outer
 * container chrome differs. This hook is the single source of that behaviour
 * so the two shells can't drift.
 *
 * `userCode` and `parserOverride` are controlled-prop aware: when the parent
 * passes them (to lift state into the share-URL hash), they win; otherwise the
 * hook keeps its own local copy.
 */

export type UsePrettierPanelArgs = {
	/** Generated `.prettierrc` JSON string. */
	config: string;
	/** The current option selections (drive the live preview). */
	selectedOptions: Record<string, unknown>;
	/** Version-bound formatter from the active `prettier/standalone` bundle. */
	format: FormatFn;
	/** Optional controlled "Your Code" input. */
	userCode?: string;
	onUserCodeChange?: (code: string) => void;
	/** Optional controlled parser override (`null` = auto-detect). */
	parserOverride?: ParserId | null;
	onParserOverrideChange?: (parser: ParserId | null) => void;
};

export type UsePrettierPanelResult = {
	t: ReturnType<typeof useTranslations>;
	viewMode: PanelViewMode;
	setViewMode: (m: PanelViewMode) => void;
	sortOrder: SortOrder;
	setSortOrder: (o: SortOrder) => void;
	/** Sorted JSON ready to display. */
	displayConfig: string;
	/** "Your Code" textarea value + setter (controlled-prop aware). */
	userCode: string;
	setUserCode: (code: string) => void;
	/** Parser override + setter, and the resolved active parser. */
	parserOverride: ParserId | null;
	setParserOverride: (p: ParserId | null) => void;
	activeParser: ParserId;
	/** Built-in Preview sample for the chosen Preview parser. */
	previewSample: string;
	formattedPreview: string;
	formattedUser: string;
	previewError: string | null;
	userError: string | null;
	isFormattingPreview: boolean;
	isFormattingUser: boolean;
	diffSettings: DiffSettings;
	updateDiffSettings: (next: Partial<DiffSettings>) => void;
	copyConfig: () => Promise<void>;
	copyFormatted: (text: string) => Promise<void>;
};

export function usePrettierPanel({
	config,
	selectedOptions,
	format,
	userCode: userCodeProp,
	onUserCodeChange,
	parserOverride: parserOverrideProp,
	onParserOverrideChange,
}: UsePrettierPanelArgs): UsePrettierPanelResult {
	const t = useTranslations('Page.ConfigAside');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
	const [viewMode, setViewMode] = useState<PanelViewMode>('config');

	const [userCodeLocal, setUserCodeLocal] = useState('');
	const userCode = userCodeProp ?? userCodeLocal;
	const setUserCode = onUserCodeChange ?? setUserCodeLocal;

	const [parserOverrideLocal, setParserOverrideLocal] = useState<ParserId | null>(null);
	const parserOverride =
		parserOverrideProp !== undefined ? parserOverrideProp : parserOverrideLocal;
	const setParserOverride = onParserOverrideChange ?? setParserOverrideLocal;
	const detectedParser = useMemo(() => detectParser(userCode), [userCode]);
	const activeParser: ParserId = parserOverride ?? detectedParser;

	const [formattedPreview, setFormattedPreview] = useState('');
	const [formattedUser, setFormattedUser] = useState('');
	const [previewError, setPreviewError] = useState<string | null>(null);
	const [userError, setUserError] = useState<string | null>(null);
	const [isFormattingPreview, setIsFormattingPreview] = useState(false);
	const [isFormattingUser, setIsFormattingUser] = useState(false);

	const [diffSettings, updateDiffSettings] = useDiffSettings();

	const displayConfig = useMemo(() => sortConfig(config, sortOrder), [config, sortOrder]);

	// The Preview sample switches with the parser dropdown so each language can
	// showcase its own Prettier options.
	const previewSample = useMemo(
		() => getSample(diffSettings.previewParser),
		[diffSettings.previewParser],
	);

	// Format the built-in sample whenever options/version/parser change while
	// the Preview tab is active. Debounced so rapid option toggling doesn't
	// queue a format per keystroke. All state writes happen inside the deferred
	// callback (never synchronously in the effect body) to avoid cascading
	// renders.
	useEffect(() => {
		if (viewMode !== 'preview') return;
		let cancelled = false;
		const timer = setTimeout(() => {
			setIsFormattingPreview(true);
			void (async () => {
				const result = await format(previewSample, selectedOptions, diffSettings.previewParser);
				if (!cancelled) {
					setFormattedPreview(result.code);
					setPreviewError(result.error);
					setIsFormattingPreview(false);
				}
			})();
		}, DEBOUNCE_FORMAT_MS);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [selectedOptions, viewMode, format, previewSample, diffSettings.previewParser]);

	// Format the user's pasted code whenever it (or options/version/parser)
	// change. Same deferred-write discipline as the preview effect.
	useEffect(() => {
		if (viewMode !== 'yourcode') return;
		let cancelled = false;
		const timer = setTimeout(() => {
			if (!userCode.trim()) {
				setFormattedUser('');
				setUserError(null);
				setIsFormattingUser(false);
				return;
			}
			setIsFormattingUser(true);
			void (async () => {
				const result = await format(userCode, selectedOptions, activeParser);
				if (!cancelled) {
					setFormattedUser(result.code);
					setUserError(result.error);
					setIsFormattingUser(false);
				}
			})();
		}, DEBOUNCE_FORMAT_MS);
		return () => {
			cancelled = true;
			clearTimeout(timer);
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

	return {
		t,
		viewMode,
		setViewMode,
		sortOrder,
		setSortOrder,
		displayConfig,
		userCode,
		setUserCode,
		parserOverride,
		setParserOverride,
		activeParser,
		previewSample,
		formattedPreview,
		formattedUser,
		previewError,
		userError,
		isFormattingPreview,
		isFormattingUser,
		diffSettings,
		updateDiffSettings,
		copyConfig,
		copyFormatted,
	};
}
