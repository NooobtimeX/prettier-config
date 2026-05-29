'use client';

import { useEffect } from 'react';
import { OPTION_SEARCH_INPUT_ID } from '@/components/SearchBar';

/**
 * Focuses the Prettier-option search field on `Cmd/Ctrl+K` or `/`. Ignores the
 * keypress when the user is already typing in an input/textarea/contenteditable
 * (so `/` inside the code editor or a text field still types a slash).
 */
export function useOptionSearchHotkey() {
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
			const slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey;
			if (!cmdK && !slash) return;

			const target = e.target as HTMLElement | null;
			const typingTarget =
				target &&
				(target.tagName === 'INPUT' ||
					target.tagName === 'TEXTAREA' ||
					target.isContentEditable ||
					// CodeMirror's editable surface
					target.closest('.cm-editor') !== null);
			// `/` should still type normally inside any editable surface.
			if (slash && typingTarget) return;

			const input = document.getElementById(OPTION_SEARCH_INPUT_ID) as HTMLInputElement | null;
			if (input) {
				e.preventDefault();
				input.focus();
				input.select();
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, []);
}
