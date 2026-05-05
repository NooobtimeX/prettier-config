import { defineRouting } from "next-intl/routing";
import { Locale } from "./common/enum/locale";

export const routing = defineRouting({
	// A list of all locales that are supported
	locales: ["en", "th", "zh", "es", "hi", "de", "fr", "pt", "ja", "ko"],

	// Used when no locale matches
	defaultLocale: Locale.EN,

	// Configure the routing strategy
	localePrefix: "always",
});

export default routing;
