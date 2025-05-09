import options from "./options";

// Type-safe keys from options
type OptionKey = (typeof options)[number]["key"];
type OptionValue = string | number | boolean | string[] | null;
export type SelectedOptions = {
	[key in OptionKey]: OptionValue;
};

export function generateConfig(selected: SelectedOptions): string {
	const config: Partial<SelectedOptions> = {};

	for (const [key, value] of Object.entries(selected) as [
		OptionKey,
		OptionValue,
	][]) {
		if (
			value !== null &&
			value !== "" &&
			!(Array.isArray(value) && value.length === 0)
		) {
			config[key] = value;
		}
	}

	return JSON.stringify(config, null, 2);
}
