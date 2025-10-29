import { Locale } from "@/common/enum/locale";

export interface LanguageConfig {
	code: Locale;
	name: string;
	flag: string;
	nativeName: string;
}

export const LANGUAGES: Record<Locale, LanguageConfig> = {
	[Locale.EN]: {
		code: Locale.EN,
		name: "English",
		flag: "🇺🇸",
		nativeName: "English",
	},
	[Locale.TH]: {
		code: Locale.TH,
		name: "Thai",
		flag: "🇹🇭",
		nativeName: "ไทย",
	},
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);
