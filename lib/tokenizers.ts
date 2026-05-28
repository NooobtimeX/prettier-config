/**
 * Token-count utilities. Two flavours:
 *
 *  - `exact` — uses the `gpt-tokenizer` per-encoding entrypoints for OpenAI
 *    BPE counts (GPT-3 through GPT-5 / o-series).
 *  - `approx` — `Math.ceil(text.length / charsPerToken)` for model families
 *    without a usable offline JS tokenizer (Anthropic Claude, Google Gemini)
 *    or for which shipping the official tokenizer would bloat the bundle
 *    beyond what this preview tool warrants.
 *
 * The exact encoders are loaded via dynamic `import()` so each ~250KB chunk
 * is only fetched the first time the user picks that model.
 */

export type TokenModelId =
	| 'gpt-4o'
	| 'gpt-4'
	| 'gpt-3.5'
	| 'claude'
	| 'gemini'
	| 'llama-3'
	| 'mistral';

export type TokenModel = {
	id: TokenModelId;
	label: string;
	/** True when the count is a chars/N approximation rather than a real tokenizer. */
	approximate: boolean;
};

export const TOKEN_MODELS: readonly TokenModel[] = [
	{ id: 'gpt-4o', label: 'GPT-4o / o-series', approximate: false },
	{ id: 'gpt-4', label: 'GPT-4 / GPT-4.1', approximate: false },
	{ id: 'gpt-3.5', label: 'GPT-3.5', approximate: false },
	{ id: 'claude', label: 'Claude (approx)', approximate: true },
	{ id: 'gemini', label: 'Gemini (approx)', approximate: true },
	{ id: 'llama-3', label: 'Llama 3 (approx)', approximate: true },
	{ id: 'mistral', label: 'Mistral (approx)', approximate: true },
] as const;

export const DEFAULT_TOKEN_MODEL: TokenModelId = 'gpt-4o';

type ExactSpec = { kind: 'exact'; load: () => Promise<{ countTokens: (s: string) => number }> };
type ApproxSpec = { kind: 'approx'; charsPerToken: number };

/**
 * Per-model spec. Bumping a new exact-tokenizer-backed model is two lines:
 * an entry above and a corresponding `case` here.
 */
const SPECS: Record<TokenModelId, ExactSpec | ApproxSpec> = {
	'gpt-4o': {
		kind: 'exact',
		load: () =>
			import('gpt-tokenizer/encoding/o200k_base').then((m) => ({
				countTokens: (s: string) => m.countTokens(s),
			})),
	},
	'gpt-4': {
		kind: 'exact',
		load: () =>
			import('gpt-tokenizer/encoding/cl100k_base').then((m) => ({
				countTokens: (s: string) => m.countTokens(s),
			})),
	},
	'gpt-3.5': {
		kind: 'exact',
		load: () =>
			import('gpt-tokenizer/encoding/cl100k_base').then((m) => ({
				countTokens: (s: string) => m.countTokens(s),
			})),
	},
	// Empirical ratios from public benchmarks; close enough for prompt-cost
	// sanity-checks, not for billing-precise estimates.
	claude: { kind: 'approx', charsPerToken: 3.6 },
	gemini: { kind: 'approx', charsPerToken: 3.8 },
	'llama-3': { kind: 'approx', charsPerToken: 3.5 },
	mistral: { kind: 'approx', charsPerToken: 3.5 },
};

// Cache loaded exact encoders so we only pay the dynamic-import cost once per
// model per session.
const encoderCache = new Map<TokenModelId, Promise<{ countTokens: (s: string) => number }>>();

function getEncoder(modelId: TokenModelId): Promise<{ countTokens: (s: string) => number }> | null {
	const spec = SPECS[modelId];
	if (spec.kind !== 'exact') return null;
	let pending = encoderCache.get(modelId);
	if (!pending) {
		pending = spec.load();
		pending.catch(() => encoderCache.delete(modelId));
		encoderCache.set(modelId, pending);
	}
	return pending;
}

export function isApproximate(modelId: TokenModelId): boolean {
	return SPECS[modelId].kind === 'approx';
}

/**
 * Returns the token count for `text` under the chosen model.
 * Exact for OpenAI encodings, length-based estimate otherwise.
 */
export async function countTokens(text: string, modelId: TokenModelId): Promise<number> {
	if (!text) return 0;
	const spec = SPECS[modelId];
	if (spec.kind === 'approx') {
		return Math.ceil(text.length / spec.charsPerToken);
	}
	const encoder = await getEncoder(modelId)!;
	return encoder.countTokens(text);
}
