'use client';

import { useEffect, useRef, useState } from 'react';
import { adaptSupportInfo } from '@/lib/adaptSupportInfo';
import { loadPrettier, type FormatFn } from '@/lib/prettierLoader';
import type { PrettierOptionType } from '@/common/interface/PrettierOptionType';

export type PrettierLoadStatus = 'loading' | 'ready' | 'error';

export type UsePrettierVersionResult = {
	options: PrettierOptionType[];
	format: FormatFn;
	status: PrettierLoadStatus;
	error: Error | null;
};

type Loaded = {
	version: string;
	options: PrettierOptionType[];
	format: FormatFn;
	error: Error | null;
};

const passthroughFormat: FormatFn = async (code) => code;

const initialLoaded: Loaded = {
	version: '',
	options: [],
	format: passthroughFormat,
	error: null,
};

/**
 * Loads a versioned `prettier/standalone` bundle from the CDN and derives the
 * UI option list from its `getSupportInfo()`. Re-runs when `version` changes;
 * the underlying loader caches per version, so toggling is instant after the
 * first fetch.
 *
 * `status` is derived from whether the most recently completed load matches the
 * requested `version`, so we don't write a transient "loading" state into React
 * from inside the effect (which would trigger a cascading render).
 */
export function usePrettierVersion(version: string): UsePrettierVersionResult {
	const [loaded, setLoaded] = useState<Loaded>(initialLoaded);
	// Guards against out-of-order completions when the user flips versions quickly.
	const requestId = useRef(0);

	useEffect(() => {
		const id = ++requestId.current;
		loadPrettier(version)
			.then((res) => {
				if (id !== requestId.current) return;
				const filterVersion = version === 'latest' ? null : version;
				setLoaded({
					version,
					options: adaptSupportInfo(res.supportInfo, filterVersion),
					format: res.format,
					error: null,
				});
			})
			.catch((err: unknown) => {
				if (id !== requestId.current) return;
				setLoaded({
					version,
					options: [],
					format: passthroughFormat,
					error: err instanceof Error ? err : new Error(String(err)),
				});
			});
	}, [version]);

	const isCurrent = loaded.version === version;
	const status: PrettierLoadStatus = !isCurrent ? 'loading' : loaded.error ? 'error' : 'ready';

	return {
		options: isCurrent ? loaded.options : [],
		format: isCurrent ? loaded.format : passthroughFormat,
		status,
		error: isCurrent ? loaded.error : null,
	};
}
