'use client';

import { useCallback, useSyncExternalStore, type Dispatch, type SetStateAction } from 'react';

/**
 * Persists the user's Prettier version + option selections to localStorage so
 * picks aren't lost on reload. Built on `useSyncExternalStore` so we don't
 * trigger SSR/CSR mismatches or `setState`-in-effect warnings.
 *
 * Stored as a single JSON blob under one key to keep version & selections
 * atomic — when both change in the same render we only do one write.
 */

type Selections = Record<string, unknown>;

export type PersistedConfig<S extends Selections = Selections> = {
	version: string;
	selected: S;
	pluginIds: string[];
};

const STORAGE_KEY = 'prettier-config-state';

// Cache last-parsed value so `getSnapshot` returns a stable reference between
// renders when nothing has changed (required by `useSyncExternalStore`).
let cached: PersistedConfig | null = null;
let cachedRaw: string | null = null;

// Per-default-version stable references for `getServerSnapshot`. Returning a
// fresh object on every call would trigger React's infinite-loop guard.
const serverSnapshotCache = new Map<string, PersistedConfig>();
function getServerSnapshot(defaultVersion: string): PersistedConfig {
	let snap = serverSnapshotCache.get(defaultVersion);
	if (!snap) {
		snap = { version: defaultVersion, selected: {}, pluginIds: [] };
		serverSnapshotCache.set(defaultVersion, snap);
	}
	return snap;
}

function readFromStorage(defaultVersion: string): PersistedConfig {
	if (typeof window === 'undefined') {
		return { version: defaultVersion, selected: {}, pluginIds: [] };
	}
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (raw === cachedRaw && cached) return cached;
	cachedRaw = raw;
	if (!raw) {
		cached = { version: defaultVersion, selected: {}, pluginIds: [] };
		return cached;
	}
	try {
		const parsed = JSON.parse(raw) as Partial<PersistedConfig>;
		cached = {
			version: typeof parsed.version === 'string' ? parsed.version : defaultVersion,
			selected:
				parsed.selected && typeof parsed.selected === 'object' && !Array.isArray(parsed.selected)
					? (parsed.selected as Selections)
					: {},
			pluginIds:
				Array.isArray(parsed.pluginIds) && parsed.pluginIds.every((s) => typeof s === 'string')
					? (parsed.pluginIds as string[])
					: [],
		};
	} catch {
		cached = { version: defaultVersion, selected: {}, pluginIds: [] };
	}
	return cached;
}

const listeners = new Set<() => void>();

function subscribe(notify: () => void): () => void {
	listeners.add(notify);
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

function writeToStorage(next: PersistedConfig) {
	cached = next;
	cachedRaw = JSON.stringify(next);
	if (typeof window !== 'undefined') {
		try {
			window.localStorage.setItem(STORAGE_KEY, cachedRaw);
		} catch {
			/* quota / disabled — non-fatal */
		}
	}
	listeners.forEach((notify) => notify());
}

/**
 * Hook returning `[version, setVersion, selected, setSelected]` whose setters
 * are compatible with the usual `Dispatch<SetStateAction<...>>` signature
 * (including functional updates), and any write transparently persists.
 */
export function usePersistedConfig<S extends Selections = Selections>(
	defaultVersion: string,
): {
	version: string;
	setVersion: Dispatch<SetStateAction<string>>;
	selected: S;
	setSelected: Dispatch<SetStateAction<S>>;
	pluginIds: string[];
	setPluginIds: Dispatch<SetStateAction<string[]>>;
} {
	const config = useSyncExternalStore(
		subscribe,
		() => readFromStorage(defaultVersion),
		() => getServerSnapshot(defaultVersion),
	);

	const setVersion = useCallback<Dispatch<SetStateAction<string>>>(
		(next) => {
			const current = readFromStorage(defaultVersion);
			const value = typeof next === 'function' ? next(current.version) : next;
			if (value === current.version) return;
			writeToStorage({ ...current, version: value });
		},
		[defaultVersion],
	);

	const setSelected = useCallback<Dispatch<SetStateAction<S>>>(
		(next) => {
			const current = readFromStorage(defaultVersion);
			const value =
				typeof next === 'function' ? (next as (prev: S) => S)(current.selected as S) : next;
			writeToStorage({ ...current, selected: value });
		},
		[defaultVersion],
	);

	const setPluginIds = useCallback<Dispatch<SetStateAction<string[]>>>(
		(next) => {
			const current = readFromStorage(defaultVersion);
			const value = typeof next === 'function' ? next(current.pluginIds) : next;
			writeToStorage({ ...current, pluginIds: value });
		},
		[defaultVersion],
	);

	return {
		version: config.version,
		setVersion,
		selected: config.selected as S,
		setSelected,
		pluginIds: config.pluginIds,
		setPluginIds,
	};
}
