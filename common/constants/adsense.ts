/**
 * Google AdSense wiring.
 *
 * The publisher ID is public information — it ships in the page source and in
 * every ad request — so it lives here rather than behind an env var. That keeps
 * the "no env vars are required" deploy story in CLAUDE.md intact.
 *
 * Three places must agree, in three different spellings:
 *   - `CLIENT_ID` (`ca-pub-…`) → `<meta name="google-adsense-account">` in
 *     app/[locale]/layout.tsx, the loader's `?client=`, and each unit's
 *     `data-ad-client`.
 *   - `public/ads.txt` → the bare `pub-…` form, no `ca-` prefix.
 */
export const ADSENSE = {
	CLIENT_ID: 'ca-pub-6034794215506479',
	SCRIPT_SRC: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
} as const;

/**
 * Ad unit slot IDs from AdSense → Ads → By ad unit (the 10-digit number in the
 * generated `data-ad-slot`).
 *
 * `null` means "unit not created yet" — `<AdSlot>` renders nothing at all for a
 * null slot, so these can ship before the units exist without leaving empty
 * boxes or console errors on the live site. Fill one in and its placement goes
 * live on the next deploy.
 *
 * Auto ads do NOT need entries here; they are driven entirely by the loader
 * script plus the AdSense dashboard.
 */
export const AD_SLOTS: Record<'homeOptionsFooter' | 'aboutInline' | 'faqInline', string | null> = {
	/** End of the scrollable options list on /[locale], just above the footer. */
	homeOptionsFooter: '6085556414',
	/** In-content on /[locale]/about, between the intro and the feature grid. */
	aboutInline: '6931734227',
	/** In-content on /[locale]/faq, below the question accordion. */
	faqInline: '3818485720',
};
