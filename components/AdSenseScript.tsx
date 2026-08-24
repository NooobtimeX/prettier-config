import Script from 'next/script';
import { ADSENSE } from '@/common/constants';

/**
 * The AdSense loader. Required for *both* manual `<AdSlot>` units and Auto ads —
 * the `<meta name="google-adsense-account">` tag in the layout only verifies
 * domain ownership, it never serves an ad on its own.
 *
 * `afterInteractive` rather than `beforeInteractive`: the tag is ~100 KB and
 * pulls in more once it runs, and the playground's first paint is the whole
 * product. Letting it wait for hydration keeps it off the LCP path. Ads land a
 * few hundred ms later, which costs nothing on in-content units placed below
 * the fold.
 *
 * Development is deliberately excluded: `adsbygoogle.js` throws `TagError` all
 * over the console under React Strict Mode's double-mount, and clicking your own
 * ads — even by accident on localhost — is an invalid-traffic policy violation.
 * `<AdSlot>` renders a labelled placeholder instead while developing.
 */
export function AdSenseScript() {
	if (process.env.NODE_ENV !== 'production') return null;

	return (
		<Script
			id="adsbygoogle-init"
			async
			strategy="afterInteractive"
			crossOrigin="anonymous"
			src={`${ADSENSE.SCRIPT_SRC}?client=${ADSENSE.CLIENT_ID}`}
		/>
	);
}
