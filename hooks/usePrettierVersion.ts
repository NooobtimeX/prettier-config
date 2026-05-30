'use client';

import { useEffect, useState } from 'react';
import { adaptSupportInfo } from '@/lib/adaptSupportInfo';
import { loadPrettier, type FormatFn, type PluginLoadFailure } from '@/lib/prettierLoader';
import type { PrettierOptionType } from '@/common/interface/PrettierOptionType';
import { useRequestId } from '@/hooks/useRequestId';

export type PrettierLoadStatus = 'loading' | 'ready' | 'error';

export type UsePrettierVersionResult = {
	options: PrettierOptionType[];
	format: FormatFn;
	status: PrettierLoadStatus;
	error: Error | null;
	/** Third-party plugin URLs that failed to load on the last completed load. */
	pluginFailures: PluginLoadFailure[];
};

type Loaded = {
	version: string;
	pluginKey: string;
	options: PrettierOptionType[];
	format: FormatFn;
	error: Error | null;
	pluginFailures: PluginLoadFailure[];
};

const passthroughFormat: FormatFn = async (code) => ({ code, error: null });

const initialLoaded: Loaded = {
	version: '',
	pluginKey: '',
	options: [],
	format: passthroughFormat,
	error: null,
	pluginFailures: [],
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
/**
 * Pulls a stable key out of an array so `useEffect` can dep on it without
 * thrashing whenever a parent re-creates the array literal.
 */
function joinUrls(urls: readonly string[]): string {
	if (urls.length === 0) return '';
	return [...urls].sort().join('|');
}

export function usePrettierVersion(
	version: string,
	pluginUrls: readonly string[] = [],
): UsePrettierVersionResult {
	const [loaded, setLoaded] = useState<Loaded>(initialLoaded);
	// Guards against out-of-order completions when the user flips versions / plugins quickly.
	const { next: nextRequestId, isCurrent: isCurrentRequest } = useRequestId();
	const pluginKey = joinUrls(pluginUrls);

	useEffect(() => {
		const id = nextRequestId();
		const urls = pluginKey ? pluginKey.split('|') : [];
		loadPrettier(version, urls)
			.then((res) => {
				if (!isCurrentRequest(id)) return;
				const filterVersion = version === 'latest' ? null : version;
				setLoaded({
					version,
					pluginKey,
					options: adaptSupportInfo(res.supportInfo, filterVersion),
					format: res.format,
					error: null,
					pluginFailures: res.pluginFailures,
				});
			})
			.catch((err: unknown) => {
				if (!isCurrentRequest(id)) return;
				setLoaded({
					version,
					pluginKey,
					options: [],
					format: passthroughFormat,
					error: err instanceof Error ? err : new Error(String(err)),
					pluginFailures: [],
				});
			});
	}, [version, pluginKey, nextRequestId, isCurrentRequest]);

	const isCurrent = loaded.version === version && loaded.pluginKey === pluginKey;
	const status: PrettierLoadStatus = !isCurrent ? 'loading' : loaded.error ? 'error' : 'ready';

	return {
		options: isCurrent ? loaded.options : [],
		format: isCurrent ? loaded.format : passthroughFormat,
		status,
		error: isCurrent ? loaded.error : null,
		pluginFailures: isCurrent ? loaded.pluginFailures : [],
	};
}
