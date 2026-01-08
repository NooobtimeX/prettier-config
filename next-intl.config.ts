import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	// A list of all locales that are supported
	locales: ["en", "th", "zh"],

	// Used when no locale matches
	defaultLocale: "en",

	// Configure the routing strategy
	localePrefix: "always",
});

export default routing;
