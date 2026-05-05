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
	[Locale.ZH]: {
		code: Locale.ZH,
		name: "Chinese",
		flag: "🇨🇳",
		nativeName: "中文",
	},
	[Locale.ES]: {
		code: Locale.ES,
		name: "Spanish",
		flag: "🇪🇸",
		nativeName: "Español",
	},
	[Locale.HI]: {
		code: Locale.HI,
		name: "Hindi",
		flag: "🇮🇳",
		nativeName: "हिन्दी",
	},
	[Locale.DE]: {
		code: Locale.DE,
		name: "German",
		flag: "🇩🇪",
		nativeName: "Deutsch",
	},
	[Locale.FR]: {
		code: Locale.FR,
		name: "French",
		flag: "🇫🇷",
		nativeName: "Français",
	},
	[Locale.PT]: {
		code: Locale.PT,
		name: "Portuguese",
		flag: "🇧🇷",
		nativeName: "Português",
	},
	[Locale.JA]: {
		code: Locale.JA,
		name: "Japanese",
		flag: "🇯🇵",
		nativeName: "日本語",
	},
	[Locale.KO]: {
		code: Locale.KO,
		name: "Korean",
		flag: "🇰🇷",
		nativeName: "한국어",
	},
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);
