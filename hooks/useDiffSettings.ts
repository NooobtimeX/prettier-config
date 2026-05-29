'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { DEFAULT_TOKEN_MODEL, TOKEN_MODELS, type TokenModelId } from '@/lib/tokenizers';
import { DEFAULT_PARSER, PARSERS, type ParserId } from '@/lib/parsers';

/**
 * Diff settings persisted to localStorage so the user's preferred view sticks
 * across reloads — unified vs split layout, the chosen AI tokenizer, and the
 * parser used to format the built-in Preview sample.
 */
export type DiffSettings = {
	splitView: boolean;
	tokenModel: TokenModelId;
	previewParser: ParserId;
};

const STORAGE_KEY = 'prettier-config-diff-settings';

const DEFAULTS: DiffSettings = {
	splitView: false,
	tokenModel: DEFAULT_TOKEN_MODEL,
	previewParser: DEFAULT_PARSER,
};

const VALID_MODELS = new Set<TokenModelId>(TOKEN_MODELS.map((m) => m.id));
const VALID_PARSERS = new Set<ParserId>(PARSERS.map((p) => p.id));

// Cache the last parsed value so `getSnapshot` returns a stable reference
// between unrelated re-renders (required by `useSyncExternalStore`).
let cached: DiffSettings = DEFAULTS;
let cachedRaw: string | null = null;

function readFromStorage(): DiffSettings {
	if (typeof window === 'undefined') return DEFAULTS;
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (raw === cachedRaw) return cached;
	cachedRaw = raw;
	if (!raw) {
		cached = DEFAULTS;
		return cached;
	}
	try {
		const parsed = JSON.parse(raw) as Partial<DiffSettings>;
		cached = {
			splitView: typeof parsed.splitView === 'boolean' ? parsed.splitView : DEFAULTS.splitView,
			tokenModel:
				typeof parsed.tokenModel === 'string' && VALID_MODELS.has(parsed.tokenModel as TokenModelId)
					? (parsed.tokenModel as TokenModelId)
					: DEFAULTS.tokenModel,
			previewParser:
				typeof parsed.previewParser === 'string' &&
				VALID_PARSERS.has(parsed.previewParser as ParserId)
					? (parsed.previewParser as ParserId)
					: DEFAULTS.previewParser,
		};
	} catch {
		cached = DEFAULTS;
	}
	return cached;
}

const listeners = new Set<() => void>();

function subscribe(notify: () => void): () => void {
	listeners.add(notify);
	// Pick up changes made in other tabs.
	const onStorage = (e: StorageEvent) => {
		if (e.key === STORAGE_KEY) notify();
	};
	if (typeof window !== 'undefined') {
		window.addEventListener('storage', onStorage);
	}
	return () => {
		listeners.delete(notify);
		if (typeof window !== 'undefined') {
			window.removeEventListener('storage', onStorage);
		}
	};
}

function writeToStorage(next: DiffSettings) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {
		/* localStorage quota / disabled — non-fatal */
	}
	cached = next;
	cachedRaw = JSON.stringify(next);
	listeners.forEach((notify) => notify());
}

export function useDiffSettings(): [DiffSettings, (next: Partial<DiffSettings>) => void] {
	const settings = useSyncExternalStore(subscribe, readFromStorage, () => DEFAULTS);

	const update = useCallback((next: Partial<DiffSettings>) => {
		writeToStorage({ ...readFromStorage(), ...next });
	}, []);

	return [settings, update];
}
