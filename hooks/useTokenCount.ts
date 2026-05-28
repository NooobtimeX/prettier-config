'use client';

import { useEffect, useRef, useState } from 'react';
import { countTokens, isApproximate, type TokenModelId } from '@/lib/tokenizers';

export type TokenCountState = {
	old: number | null;
	new: number | null;
	approximate: boolean;
	isLoading: boolean;
};

const DEBOUNCE_MS = 120;

/**
 * Debounced + cancellable token counter for the "before" and "after" sides of
 * a diff. Returns `null` for `old` / `new` while the first compute is in
 * flight so the UI can render a skeleton without layout shift.
 *
 * Out-of-order completions (user types fast or flips the model mid-compute)
 * are guarded by a monotonically-incrementing request id, mirroring the
 * cancellation pattern used elsewhere for `formatCode`.
 */
export function useTokenCount(
	oldValue: string,
	newValue: string,
	modelId: TokenModelId,
): TokenCountState {
	const [state, setState] = useState<TokenCountState>({
		old: null,
		new: null,
		approximate: isApproximate(modelId),
		isLoading: true,
	});
	const requestId = useRef(0);

	useEffect(() => {
		const id = ++requestId.current;
		const approximate = isApproximate(modelId);

		const timer = setTimeout(() => {
			Promise.all([countTokens(oldValue, modelId), countTokens(newValue, modelId)])
				.then(([oldCount, newCount]) => {
					if (id !== requestId.current) return;
					setState({ old: oldCount, new: newCount, approximate, isLoading: false });
				})
				.catch(() => {
					if (id !== requestId.current) return;
					setState({ old: null, new: null, approximate, isLoading: false });
				});
		}, DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [oldValue, newValue, modelId]);

	return state;
}
