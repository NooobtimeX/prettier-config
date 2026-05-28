'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { DEFAULT_TOKEN_MODEL, TOKEN_MODELS, type TokenModelId } from '@/lib/tokenizers';

/**
 * Diff settings persisted to localStorage so the user's preferred view sticks
 * across reloads — unified vs split layout, and the chosen AI tokenizer.
 */
export type DiffSettings = {
	splitView: boolean;
	tokenModel: TokenModelId;
};

const STORAGE_KEY = 'prettier-config-diff-settings';

const DEFAULTS: DiffSettings = {
	splitView: false,
	tokenModel: DEFAULT_TOKEN_MODEL,
};

const VALID_MODELS = new Set<TokenModelId>(TOKEN_MODELS.map((m) => m.id));

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
