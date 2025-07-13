export type SortOrder = "asc" | "desc";

export function sortConfig(config: string, sortOrder: SortOrder): string {
	if (!config) {
		return "";
	}

	try {
		const parsedConfig = JSON.parse(config);
		let sortedConfig: Record<string, unknown>;

		if (sortOrder === "asc") {
			// Sort keys A-Z
			const sortedKeys = Object.keys(parsedConfig).sort();
			sortedConfig = sortedKeys.reduce(
				(acc, key) => {
					acc[key] = parsedConfig[key];
					return acc;
				},
				{} as Record<string, unknown>
			);
		} else if (sortOrder === "desc") {
			// Sort keys Z-A
			const sortedKeys = Object.keys(parsedConfig).sort().reverse();
			sortedConfig = sortedKeys.reduce(
				(acc, key) => {
					acc[key] = parsedConfig[key];
					return acc;
				},
				{} as Record<string, unknown>
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
