/**
 * Parser registry + auto-detection used by the "Your Code" tab.
 *
 * `PARSERS` drives the dropdown shown next to the diff toggle.
 * `detectParser` is a lightweight content sniff — order matters: cheaper /
 * more specific checks first, JS/TS as the default fallback because the
 * `typescript` parser handles plain JS too.
 */

export type ParserId =
	| 'babel'
	| 'typescript'
	| 'css'
	| 'scss'
	| 'less'
	| 'html'
	| 'vue'
	| 'angular'
	| 'json'
	| 'json5'
	| 'jsonc'
	| 'markdown'
	| 'mdx'
	| 'yaml'
	| 'graphql'
	| 'flow';

export type Parser = {
	id: ParserId;
	/**
	 * File extensions this parser commonly handles. (User-facing labels live in
	 * the `Page.parserPicker.parsers.*` i18n keys, not here.)
	 */
	extensions: readonly string[];
};

export const PARSERS: readonly Parser[] = [
	{ id: 'typescript', extensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'] },
	{ id: 'babel', extensions: ['js', 'jsx'] },
	{ id: 'flow', extensions: ['js'] },
	{ id: 'css', extensions: ['css'] },
	{ id: 'scss', extensions: ['scss'] },
	{ id: 'less', extensions: ['less'] },
	{ id: 'html', extensions: ['html', 'htm'] },
	{ id: 'vue', extensions: ['vue'] },
	{ id: 'angular', extensions: ['html'] },
	{ id: 'json', extensions: ['json'] },
	{ id: 'json5', extensions: ['json5'] },
	{ id: 'jsonc', extensions: ['jsonc'] },
	{ id: 'markdown', extensions: ['md', 'markdown'] },
	{ id: 'mdx', extensions: ['mdx'] },
	{ id: 'yaml', extensions: ['yaml', 'yml'] },
	{ id: 'graphql', extensions: ['graphql', 'gql'] },
] as const;

export const DEFAULT_PARSER: ParserId = 'typescript';

const JSON_ROOT_RE = /^\s*[{[]/;
const FRONT_MATTER_RE = /^---\s*\n[\s\S]*?\n---/;
const HTML_TAG_RE = /<\s*[a-z][\w-]*(\s+[^>]*)?\s*\/?>/i;
const HTML_CLOSE_RE = /<\/\s*[a-z][\w-]*\s*>/i;
const VUE_BLOCK_RE = /<\s*(template|script|style)\b[^>]*>/i;
const GRAPHQL_RE =
	/^\s*(?:query|mutation|subscription|fragment|type|schema|enum|input|interface)\b/m;
const YAML_KEY_RE = /^[a-zA-Z_][\w-]*\s*:\s*\S/m;
const CSS_RULE_RE = /(^|\n)\s*(?:@[\w-]+\b|[.#:&*\w[\][-]+)\s*\{[\s\S]*?\}/;
const MD_HEADING_RE = /^\s{0,3}#{1,6}\s+\S/m;
const MD_LIST_RE = /^\s*[-*+]\s+\S/m;
const MD_FENCE_RE = /^\s*```/m;
const TS_HINT_RE =
	/\b(?:interface|type)\s+[A-Z]\w*\s*[<{=]|:\s*(?:string|number|boolean|any|unknown|void)\b/;

/**
 * Best-effort parser guess from input content. Falls back to TypeScript,
 * which Prettier's `typescript` parser accepts for plain JS too.
 */
export function detectParser(code: string): ParserId {
	const trimmed = code.trim();
	if (!trimmed) return DEFAULT_PARSER;

	// Markdown — front-matter, code fences, headings, or bulleted lists.
	if (FRONT_MATTER_RE.test(trimmed)) return 'markdown';
	if (MD_FENCE_RE.test(trimmed) && (MD_HEADING_RE.test(trimmed) || MD_LIST_RE.test(trimmed))) {
		return 'markdown';
	}
	if (MD_HEADING_RE.test(trimmed) && !TS_HINT_RE.test(trimmed)) return 'markdown';

	// HTML / Vue.
	if (VUE_BLOCK_RE.test(trimmed)) return 'vue';
	if (HTML_TAG_RE.test(trimmed) && HTML_CLOSE_RE.test(trimmed) && !TS_HINT_RE.test(trimmed)) {
		// Distinguish JSX (export const Button = () => <button>) from raw HTML.
		// JSX usually has `=>` or `return (` near a tag.
		if (/=>\s*[<(]|return\s*\(/.test(trimmed)) return 'typescript';
		return 'html';
	}

	// JSON family — fast root-shape test.
	if (JSON_ROOT_RE.test(trimmed)) {
		try {
			JSON.parse(trimmed);
			return 'json';
		} catch {
			// Could still be JSON5 / JSONC (trailing commas, comments) — fall through.
			if (/^\s*[{[]/.test(trimmed) && /[}\]]\s*$/.test(trimmed)) {
				if (/\/\/|\/\*/.test(trimmed)) return 'jsonc';
				return 'json5';
			}
		}
	}

	// GraphQL.
	if (GRAPHQL_RE.test(trimmed) && !TS_HINT_RE.test(trimmed)) return 'graphql';

	// CSS — `selector { ... }` shape without JS keywords.
	if (
		CSS_RULE_RE.test(trimmed) &&
		!/\b(?:const|let|var|function|=>|import|export)\b/.test(trimmed)
	) {
		return 'css';
	}

	// YAML — `key: value` lines, no JS / HTML markers.
	if (YAML_KEY_RE.test(trimmed) && !/[{};=]/.test(trimmed.split('\n')[0])) {
		return 'yaml';
	}

	return DEFAULT_PARSER;
}
