import { getRequestConfig } from "next-intl/server";
import { routing } from "../next-intl.config";

export default getRequestConfig(async ({ locale }) => {
	// Validate that the incoming `locale` parameter is valid
	if (!locale || !routing.locales.includes(locale as any)) {
		return {
			locale: routing.defaultLocale,
			messages: (
				await import(`../common/messages/${routing.defaultLocale}.json`)
			).default,
		};
	}

	return {
		locale,
		messages: (await import(`../common/messages/${locale}.json`)).default,
	};
});
