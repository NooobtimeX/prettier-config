export type SortOrder = 'asc' | 'desc';

/**
 * Sorts the keys of a JSON configuration string alphabetically.
 *
 * @param config - The JSON string representation of the configuration.
 * @param sortOrder - The order to sort the keys ("asc" or "desc").
 * @returns A JSON string with sorted keys, or the original string if parsing fails.
 */
export function sortConfig(config: string, sortOrder: SortOrder): string {
	if (!config) {
		return '';
	}

	try {
		const parsedConfig = JSON.parse(config);
		let sortedConfig: Record<string, unknown>;

		if (sortOrder === 'asc') {
			// Sort keys A-Z
			const sortedKeys = Object.keys(parsedConfig).sort();
			sortedConfig = sortedKeys.reduce(
				(acc, key) => {
					acc[key] = parsedConfig[key];
					return acc;
				},
				{} as Record<string, unknown>,
			);
		} else if (sortOrder === 'desc') {
			// Sort keys Z-A
			const sortedKeys = Object.keys(parsedConfig).sort().reverse();
			sortedConfig = sortedKeys.reduce(
				(acc, key) => {
					acc[key] = parsedConfig[key];
					return acc;
				},
				{} as Record<string, unknown>,
			);
		} else {
			// Original order
			sortedConfig = parsedConfig;
		}

		return JSON.stringify(sortedConfig, null, 2);
	} catch {
		// If JSON parsing fails, use original config
		return config;
	}
}
