'use client';

import { useEffect, useRef } from 'react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { ParserId } from '@/lib/parsers';

/**
 * `version` + `selected` + `code` + (optional) `parser` override travel through
 * the URL hash as a single LZ-compressed JSON blob. Same idea as
 * `play.prettier.io`, so configs can be shared in tweets/issues/Slack.
 *
 * Precedence: on first mount, if the hash holds a valid payload it wins and
 * is pushed into the local-storage-backed state via the setters; subsequent
 * changes to that state are written back to the hash (debounced, replaceState).
 * Personal prefs (diff settings, token model) are deliberately not part of the
 * shared artifact.
 */

export type SharedState = {
	version: string;
	selected: Record<string, unknown>;
	code: string;
	parserOverride: ParserId | null;
};

type StoredPayload = {
	v: string;
	o: Record<string, unknown>;
	c: string;
	p: ParserId | null;
};

const HASH_PREFIX = '#s=';
const WRITE_DEBOUNCE_MS = 400;

function readHash(): StoredPayload | null {
	if (typeof window === 'undefined') return null;
	const hash = window.location.hash;
	if (!hash.startsWith(HASH_PREFIX)) return null;
	const raw = hash.slice(HASH_PREFIX.length);
	if (!raw) return null;
	try {
		const json = decompressFromEncodedURIComponent(raw);
		if (!json) return null;
		const parsed = JSON.parse(json) as Partial<StoredPayload>;
		if (typeof parsed.v !== 'string') return null;
		return {
			v: parsed.v,
			o: parsed.o && typeof parsed.o === 'object' && !Array.isArray(parsed.o) ? parsed.o : {},
			c: typeof parsed.c === 'string' ? parsed.c : '',
			p: typeof parsed.p === 'string' ? (parsed.p as ParserId) : null,
		};
	} catch {
		return null;
	}
}

function writeHash(payload: StoredPayload) {
	if (typeof window === 'undefined') return;
	const json = JSON.stringify(payload);
	const compressed = compressToEncodedURIComponent(json);
	const next = `${HASH_PREFIX}${compressed}`;
	if (window.location.hash === next) return;
	// replaceState — no history spam on every keystroke.
	const url = `${window.location.pathname}${window.location.search}${next}`;
	window.history.replaceState(null, '', url);
}

export type ShareableUrlSeeders = {
	setVersion: (v: string) => void;
	setSelected: (s: Record<string, unknown>) => void;
	setCode: (c: string) => void;
	setParserOverride: (p: ParserId | null) => void;
};

/**
 * Seeds state from the URL on mount (once), then mirrors state → URL on change.
 * Returns `share()` which copies the current URL to clipboard.
 */
export function useShareableUrl(state: SharedState, seeders: ShareableUrlSeeders) {
	const seedersRef = useRef(seeders);
	useEffect(() => {
		seedersRef.current = seeders;
	}, [seeders]);
	const hasSeeded = useRef(false);

	// Seed once on first client mount.
	useEffect(() => {
		if (hasSeeded.current) return;
		hasSeeded.current = true;
		const payload = readHash();
		if (!payload) return;
		const s = seedersRef.current;
		s.setVersion(payload.v);
		s.setSelected(payload.o);
		s.setCode(payload.c);
		s.setParserOverride(payload.p);
	}, []);

	// Debounced mirror of state → hash.
	useEffect(() => {
		if (!hasSeeded.current) return;
		const t = setTimeout(() => {
			writeHash({
				v: state.version,
				o: state.selected,
				c: state.code,
				p: state.parserOverride,
			});
		}, WRITE_DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [state.version, state.selected, state.code, state.parserOverride]);

	return {
		share: async (): Promise<string> => {
			// Force-flush a fresh write before reading the URL so the user gets
			// the up-to-date hash even if they click during the debounce window.
			writeHash({
				v: state.version,
				o: state.selected,
				c: state.code,
				p: state.parserOverride,
			});
			const url = typeof window === 'undefined' ? '' : window.location.href;
			if (url && typeof navigator !== 'undefined' && navigator.clipboard) {
				await navigator.clipboard.writeText(url);
			}
			return url;
		},
	};
}
