/**
 * Centralised debounce intervals (milliseconds). Kept in one place so the
 * app's responsiveness vs. work-throttling trade-offs are visible and tunable
 * from a single file instead of scattered as magic numbers across hooks.
 */

/** Re-format the Preview sample / Your Code input after edits settle. */
export const DEBOUNCE_FORMAT_MS = 120;

/** Recompute AI token counts after the diff input settles. */
export const DEBOUNCE_TOKENS_MS = 120;

/** Write the shareable-URL hash after state changes settle (avoids history spam). */
export const DEBOUNCE_URL_HASH_MS = 400;
