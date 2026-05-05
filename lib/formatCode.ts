/**
 * Built-in sample code that exercises the most visually impactful Prettier options:
 * singleQuote, semi, trailingComma, bracketSpacing, arrowParens, printWidth, tabWidth, useTabs
 */
export const DEFAULT_SAMPLE = `const greeting = (name,age) => {
const person = {name:name,age:age,city:'Bangkok',active:true}
const tags = ['js','ts','react','vue','prettier']
if(person.age>18){
return "Hello "+name+"! You have "+tags.length+" tags."
}
return null
}

export const add = (a,b) => a+b
export const multiply = (a,b,c) => a*b*c
`;

/**
 * Formats code in the browser using Prettier standalone.
 * Dynamically imports Prettier and its plugins to avoid SSR issues
 * and keep the initial JS bundle small (~1.5 MB saved on first load).
 *
 * @param code - The source code to format.
 * @param selectedOptions - The current Prettier option selections (may include null values).
 * @returns Formatted code string, or the original code if formatting fails.
 */
export async function formatCode(
	code: string,
	selectedOptions: Record<string, unknown>,
): Promise<string> {
	if (!code.trim()) return code;

	try {
		const { format } = await import('prettier/standalone');
		const babelPlugin = await import('prettier/plugins/babel');
		const estreePlugin = await import('prettier/plugins/estree');

		// Filter out null / empty / unset values from selectedOptions
		// and skip 'parser' and 'plugins' since we control those here.
		const filteredOptions: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(selectedOptions)) {
			if (key === 'parser' || key === 'plugins') continue;
			if (value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
				filteredOptions[key] = value;
			}
		}

		const formatted = await format(code, {
			...filteredOptions,
			parser: 'babel',
			plugins: [
				// Support both ESM default export and module-namespace objects
				(babelPlugin as { default?: unknown }).default ?? babelPlugin,
				(estreePlugin as { default?: unknown }).default ?? estreePlugin,
			],
		});

		return formatted;
	} catch {
		// Return original code unchanged on any parse / format error
		// so the UI never shows a broken state.
		return code;
	}
}
