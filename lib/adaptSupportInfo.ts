import { PrettierOptionTypeEnum, PrettierOptionValidateEnum } from '@/common/enum/prettierOption';
import type { PrettierOptionType } from '@/common/interface/PrettierOptionType';
import { optionOverrides } from './optionOverrides';
import type { PrettierSupportInfo, PrettierSupportOption } from './prettierLoader';

/**
 * Options Prettier exposes via `getSupportInfo()` that don't belong in the UI:
 *  - `parser` / `filepath` — we always format JS with babel internally.
 *  - `plugins` / `pluginSearchDirs` — not loadable in the browser.
 */
const IGNORED_OPTION_KEYS = new Set([
	'parser',
	'filepath',
	'plugins',
	'pluginSearchDirs',
	'plugin-search-dir',
]);

/** Threshold above which a `choice` option renders as SELECT instead of BUTTONS. */
const BUTTONS_MAX_CHOICES = 4;

function humanize(camelCase: string): string {
	return camelCase
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, (c) => c.toUpperCase())
		.trim();
}

/**
 * Returns 1 if `a > b`, -1 if `a < b`, 0 if equal. Compares the first three
 * numeric segments of dotted version strings (`3.4.2` vs `3.5.0`). Non-numeric
 * suffixes (`-rc.1`) are ignored.
 */
function compareVersions(a: string, b: string): number {
	const parse = (v: string) =>
		v
			.split('.')
			.slice(0, 3)
			.map((seg) => parseInt(seg, 10) || 0);
	const [a1, a2, a3] = parse(a);
	const [b1, b2, b3] = parse(b);
	const diff = a1 - b1 || a2 - b2 || a3 - b3;
	return diff === 0 ? 0 : diff > 0 ? 1 : -1;
}

function mapOption(opt: PrettierSupportOption): PrettierOptionType | null {
	let type: PrettierOptionTypeEnum;
	let validate: PrettierOptionValidateEnum;
	let choices: (string | boolean)[] | undefined;

	if (opt.array) {
		type = PrettierOptionTypeEnum.MULTISELECT;
		validate = PrettierOptionValidateEnum.STRING_ARRAY;
		choices = (opt.choices ?? []).map((c) => String(c.value));
	} else if (opt.type === 'boolean') {
		type = PrettierOptionTypeEnum.BUTTONS;
		validate = PrettierOptionValidateEnum.BOOLEAN;
		choices = [true, false];
	} else if (opt.type === 'int') {
		type = PrettierOptionTypeEnum.INPUT;
		validate = PrettierOptionValidateEnum.INTEGER;
	} else if (opt.type === 'choice') {
		const raw = (opt.choices ?? []).map((c) => c.value);
		if (raw.length === 0) return null;
		const allBool = raw.every((v) => typeof v === 'boolean');
		validate = allBool ? PrettierOptionValidateEnum.BOOLEAN : PrettierOptionValidateEnum.STRING;
		type =
			raw.length <= BUTTONS_MAX_CHOICES
				? PrettierOptionTypeEnum.BUTTONS
				: PrettierOptionTypeEnum.SELECT;
		choices = raw.map((v) => (typeof v === 'boolean' ? v : String(v)));
	} else {
		type = PrettierOptionTypeEnum.INPUT;
		validate = PrettierOptionValidateEnum.STRING;
	}

	const built: PrettierOptionType = {
		name: humanize(opt.name),
		key: opt.name,
		description: opt.description ?? '',
		type,
		validate,
		...(choices ? { options: choices } : {}),
		...(opt.since ? { since: opt.since } : {}),
	};

	const override = optionOverrides[opt.name];
	return override ? { ...built, ...override } : built;
}

/**
 * Convert Prettier's `getSupportInfo()` payload into the UI's `PrettierOptionType[]`.
 *
 * @param supportInfo - The raw result from `prettier.getSupportInfo()`.
 * @param maxVersion - If provided, options whose `since` is newer than this
 *                     version are dropped (defensive guard — `getSupportInfo`
 *                     from a versioned bundle already returns its own options).
 *                     Pass `null` to disable filtering (e.g. for the `latest` channel).
 */
export function adaptSupportInfo(
	supportInfo: PrettierSupportInfo,
	maxVersion: string | null,
): PrettierOptionType[] {
	const result: PrettierOptionType[] = [];
	for (const opt of supportInfo.options ?? []) {
		if (IGNORED_OPTION_KEYS.has(opt.name)) continue;
		if (maxVersion && opt.since && compareVersions(opt.since, maxVersion) > 0) continue;
		const mapped = mapOption(opt);
		if (mapped) result.push(mapped);
	}
	return result;
}
