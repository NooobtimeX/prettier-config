'use client';

import { useTranslations } from 'next-intl';

/**
 * Thin red strip used by Preview/Your-Code panels to surface Prettier's parse
 * errors. The previous good output stays visible underneath so the user can
 * see where they were before the broken edit. The header (e.g. "Format
 * error") is localized via `Page.errors.title`; the raw Prettier message
 * stays in English since it's the compiler's own output.
 */
export function FormatError({ message }: { message: string }) {
	const t = useTranslations('Page.errors');
	return (
		<div className="border-destructive/40 bg-destructive/10 text-destructive mb-2 rounded-md border px-3 py-1.5 font-mono text-xs whitespace-pre-wrap">
			<span className="mr-2 font-sans font-semibold">{t('title')}:</span>
			{message}
		</div>
	);
}
