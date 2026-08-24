'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ADSENSE } from '@/common/constants';
import { cn } from '@/lib/utils';

declare global {
	interface Window {
		adsbygoogle?: Record<string, unknown>[];
	}
}

type AdSlotProps = {
	/**
	 * A `data-ad-slot` value from `AD_SLOTS`. `null` renders nothing, so a
	 * placement can be committed before its unit exists in the dashboard.
	 */
	slot: string | null;
	className?: string;
	/** Mirrors `data-ad-format`. `auto` is the responsive display unit. */
	format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
	/** `data-ad-layout-key`, only used by in-feed (`fluid`) units. */
	layoutKey?: string;
	/**
	 * Pixels of space held open before the ad resolves.
	 *
	 * Left unset on purpose. Reserving height kills layout shift when an ad
	 * fills, but an *unfilled* responsive unit collapses to `height: 0` — so a
	 * reservation turns every no-fill into a permanent blank hole. On a dev-tool
	 * audience with heavy ad-blocker use, no-fill is the common case, which is
	 * why collapsing wins by default. Set it per-placement if a specific slot
	 * fills reliably enough that the shift is worse than the gap.
	 */
	reserveHeight?: number;
};

/**
 * One `<ins class="adsbygoogle">` unit, safe to drop anywhere in the tree.
 *
 * Everything interesting here is defensive — see the comments in the effect.
 */
export function AdSlot({
	slot,
	className,
	format = 'auto',
	layoutKey,
	reserveHeight,
}: AdSlotProps) {
	const t = useTranslations('Ads');
	const insRef = useRef<HTMLModElement>(null);
	const pushed = useRef(false);

	useEffect(() => {
		if (!slot || process.env.NODE_ENV !== 'production') return;
		const ins = insRef.current;
		if (!ins) return;

		const fill = () => {
			if (pushed.current) return true;
			// Set by adsbygoogle.js itself once it claims an element. It survives
			// React 19 Strict Mode's double-mount, where a second push into the
			// same <ins> throws `TagError: … already have ads in them`.
			if (ins.getAttribute('data-adsbygoogle-status')) {
				pushed.current = true;
				return true;
			}
			// A push against a zero-width container makes AdSense bail with
			// `availableWidth=0` and never retry on its own, so wait for layout.
			if (ins.getBoundingClientRect().width === 0) return false;

			try {
				(window.adsbygoogle = window.adsbygoogle ?? []).push({});
			} catch (error) {
				// Ad blockers stub the global; nothing here is recoverable by retrying.
				console.error('[AdSlot] adsbygoogle.push failed', error);
			}
			pushed.current = true;
			return true;
		};

		// The common case: the slot already has a width on first paint.
		if (fill()) return;

		// Otherwise it mounted collapsed — inside a closed panel, a not-yet-open
		// dialog, a display:none breakpoint — so push as soon as it gains width.
		const observer = new ResizeObserver(() => {
			if (fill()) observer.disconnect();
		});
		observer.observe(ins);
		return () => observer.disconnect();
	}, [slot]);

	if (!slot) return null;

	const label = t('label');

	return (
		<aside
			// Hook for the unfilled-slot collapse rule in globals.css.
			data-ad-container=""
			aria-label={label}
			className={cn('w-full', className)}
		>
			{/* Google requires ads be distinguishable from page content. A quiet
			    label is the cheapest way to satisfy that and is allowed wording —
			    unlike anything that invites a click. */}
			<span className="text-muted-foreground/70 mb-1 block text-center text-[10px] tracking-widest uppercase">
				{label}
			</span>

			{process.env.NODE_ENV === 'production' ? (
				<ins
					ref={insRef}
					// `adsbygoogle` is the hook the loader scans for — never rename it.
					className="adsbygoogle w-full"
					style={{ display: 'block', minHeight: reserveHeight }}
					data-ad-client={ADSENSE.CLIENT_ID}
					data-ad-slot={slot}
					data-ad-format={format}
					data-ad-layout-key={layoutKey}
					data-full-width-responsive="true"
				/>
			) : (
				<div
					className="text-muted-foreground/60 flex w-full items-center justify-center rounded-md border border-dashed text-xs"
					style={{ minHeight: reserveHeight ?? 90 }}
				>
					{`slot ${slot} · ${format}`}
				</div>
			)}
		</aside>
	);
}
