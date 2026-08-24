import Script from 'next/script';
import { ADSENSE } from '@/common/constants';

/**
 * The AdSense loader. Required for *both* manual `<AdSlot>` units and Auto ads —
 * the `<meta name="google-adsense-account">` tag in the layout only verifies
 * domain ownership, it never serves an ad on its own.
 *
 * `lazyOnload`, not `afterInteractive`. The original comment here claimed
 * afterInteractive kept the tag off the LCP path — that was wrong: Next still
 * emits a <link rel=preload as=script> for it in <head>, so a ~100 KB
 * third-party script was competing for connections and main-thread time with
 * the jsDelivr fetch that produces the actual page content. lazyOnload defers
 * until the window load event. The ad units are below the fold, so nothing is
 * lost.
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
			strategy="lazyOnload"
			crossOrigin="anonymous"
			src={`${ADSENSE.SCRIPT_SRC}?client=${ADSENSE.CLIENT_ID}`}
		/>
	);
}
