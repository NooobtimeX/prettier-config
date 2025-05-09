export type PrettierOptionType = {
	name: string;
	key: string;
	description: string;
	type: "input" | "select" | "buttons" | "multiselect";
	options?: (string | boolean)[];
	validate: "string" | "boolean" | "integer" | "string[]";
	since?: string;
	examples?: string[];
	recommend?: string;
	images?: string[];
};
