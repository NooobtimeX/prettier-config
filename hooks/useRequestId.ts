'use client';

import { useCallback, useRef } from 'react';

/**
 * Monotonic request-id guard for cancelling out-of-order async work. Returns
 * `next()` (call at the start of an async run to claim the latest id) and
 * `isCurrent(id)` (call after the await to check the run is still the newest).
 *
 *   const { next, isCurrent } = useRequestId();
 *   useEffect(() => {
 *     const id = next();
 *     load().then((res) => { if (isCurrent(id)) setState(res); });
 *   }, [dep]);
 *
 * Shared by `usePrettierVersion` and `useTokenCount` so the cancellation
 * pattern is written once.
 */
export function useRequestId() {
	const ref = useRef(0);
	const next = useCallback(() => ++ref.current, []);
	const isCurrent = useCallback((id: number) => id === ref.current, []);
	return { next, isCurrent };
}
