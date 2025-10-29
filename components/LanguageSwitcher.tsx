"use client";

import { useLocale } from "next-intl";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { LANGUAGES, LANGUAGE_LIST } from "@/common/constants";
import { Locale } from "@/common/enum/locale";

export default function LanguageSwitcher() {
	const locale = useLocale() as Locale;
	const params = useParams();
	const pathname = usePathname();
	const router = useRouter();

	// Get current locale from params or fallback to useLocale
	const currentLocale = (params?.locale as Locale) || locale;

	const handleLanguageChange = (newLocale: string) => {
		// Remove the current locale from the pathname if it exists
		const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
		const newPath = `/${newLocale}${pathWithoutLocale}`;
		router.push(newPath);
	};

	const currentLanguage = LANGUAGES[currentLocale];

	return (
		<Select value={currentLocale} onValueChange={handleLanguageChange}>
			<SelectTrigger className="w-[140px]">
				<div className="flex items-center gap-2">
					<Globe className="h-4 w-4" />
					{currentLanguage && (
						<span className="flex items-center gap-2">
							<span>{currentLanguage.flag}</span>
							<span className="hidden sm:inline">
								{currentLanguage.nativeName}
							</span>
						</span>
					)}
				</div>
			</SelectTrigger>
			<SelectContent>
				{LANGUAGE_LIST.map((language) => (
					<SelectItem key={language.code} value={language.code}>
						<div className="flex items-center gap-2">
							<span>{language.flag}</span>
							<span>{language.nativeName}</span>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
