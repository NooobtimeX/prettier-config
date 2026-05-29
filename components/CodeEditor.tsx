'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
	bracketMatching,
	defaultHighlightStyle,
	indentOnInput,
	syntaxHighlighting,
} from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import type { ParserId } from '@/lib/parsers';

/**
 * Lazy import each language pack only when the user picks (or auto-detects)
 * that parser, mirroring the pattern in `lib/tokenizers.ts`. Keeps the initial
 * bundle small — only the JS/TS pack is on the critical path.
 */
async function loadLanguage(parser: ParserId): Promise<Extension | null> {
	switch (parser) {
		case 'typescript':
		case 'babel':
		case 'flow': {
			const { javascript } = await import('@codemirror/lang-javascript');
			return javascript({ jsx: true, typescript: parser === 'typescript' });
		}
		case 'css': {
			const { css } = await import('@codemirror/lang-css');
			return css();
		}
		case 'scss': {
			const { sass } = await import('@codemirror/lang-sass');
			return sass({ indented: false });
		}
		case 'less': {
			const { less } = await import('@codemirror/lang-less');
			return less();
		}
		case 'html': {
			const { html } = await import('@codemirror/lang-html');
			return html();
		}
		case 'vue': {
			const { vue } = await import('@codemirror/lang-vue');
			return vue();
		}
		case 'angular': {
			const { angular } = await import('@codemirror/lang-angular');
			return angular();
		}
		case 'json':
		case 'json5':
		case 'jsonc': {
			const { json } = await import('@codemirror/lang-json');
			return json();
		}
		case 'markdown':
		case 'mdx': {
			const { markdown } = await import('@codemirror/lang-markdown');
			return markdown();
		}
		case 'yaml': {
			const { yaml } = await import('@codemirror/lang-yaml');
			return yaml();
		}
		case 'graphql':
			return null;
		default:
			return null;
	}
}

interface CodeEditorProps {
	value: string;
	onChange: (value: string) => void;
	parser: ParserId;
	placeholder?: string;
	minHeight?: string;
}

/**
 * Client-only CodeMirror 6 wrapper. Persistent `EditorView` instance with
 * `Compartment`-driven language + theme so we never remount on parser/theme
 * changes.
 */
export function CodeEditor({
	value,
	onChange,
	parser,
	placeholder = '// Paste your code here…',
	minHeight = '12rem',
}: CodeEditorProps) {
	const hostRef = useRef<HTMLDivElement | null>(null);
	const viewRef = useRef<EditorView | null>(null);
	const langCompartment = useRef(new Compartment());
	const themeCompartment = useRef(new Compartment());
	const onChangeRef = useRef(onChange);
	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	// Mount once.
	useEffect(() => {
		if (!hostRef.current || viewRef.current) return;

		const baseExtensions: Extension[] = [
			lineNumbers(),
			highlightActiveLine(),
			history(),
			indentOnInput(),
			bracketMatching(),
			syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
			keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
			EditorView.lineWrapping,
			EditorView.theme({
				'&': { fontSize: '0.75rem' },
				'.cm-content': {
					fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
				},
				'.cm-scroller': { minHeight },
			}),
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					onChangeRef.current(update.state.doc.toString());
				}
			}),
			langCompartment.current.of([]),
			themeCompartment.current.of(isDark ? oneDark : []),
		];

		const state = EditorState.create({
			doc: value,
			extensions: baseExtensions,
		});
		viewRef.current = new EditorView({ state, parent: hostRef.current });

		return () => {
			viewRef.current?.destroy();
			viewRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
	}, []);

	// Sync external value changes (e.g. share-URL load) without breaking cursor
	// during local typing.
	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;
		const current = view.state.doc.toString();
		if (current === value) return;
		view.dispatch({
			changes: { from: 0, to: current.length, insert: value },
		});
	}, [value]);

	// Swap language extension when parser changes.
	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;
		let cancelled = false;
		void (async () => {
			const ext = await loadLanguage(parser);
			if (cancelled || !viewRef.current) return;
			viewRef.current.dispatch({
				effects: langCompartment.current.reconfigure(ext ?? []),
			});
		})();
		return () => {
			cancelled = true;
		};
	}, [parser]);

	// Swap theme on light/dark toggle.
	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;
		view.dispatch({
			effects: themeCompartment.current.reconfigure(isDark ? oneDark : []),
		});
	}, [isDark]);

	return (
		<div
			ref={hostRef}
			role="textbox"
			aria-label={placeholder}
			className="bg-background focus-within:ring-ring overflow-hidden rounded-md border focus-within:ring-1"
		/>
	);
}

export default CodeEditor;
