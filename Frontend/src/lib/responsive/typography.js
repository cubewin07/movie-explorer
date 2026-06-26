// Typography scaling core.
//
// Pure, framework-free helpers that decide legal body-text sizes per breakpoint
// and scale heading sizes relative to the body size. No DOM or React imports,
// so these stay testable in isolation (see Property 4 and Property 5).

/** Minimum body font size in CSS px, enforced at every breakpoint. */
export const BODY_MIN = 16;

/** Maximum body font size in CSS px at the tablet/desktop breakpoints. */
export const BODY_MAX = 20;

/** Smallest allowed heading size as a multiple of the body size. */
export const HEADING_MIN_RATIO = 1.25;

/** Largest allowed heading size as a multiple of the body size. */
export const HEADING_MAX_RATIO = 2.5;

/**
 * Clamp a desired body font size into the legal band for a breakpoint.
 *
 * - At `mobile`, the result is at least `BODY_MIN` (16) with no upper bound.
 * - At `tablet`/`desktop` (and any other value), the result is clamped into
 *   the inclusive band `[BODY_MIN, BODY_MAX]` (16–20).
 *
 * Invalid (`NaN`/non-finite) inputs fall back to `BODY_MIN` so the function
 * always returns a renderable value rather than throwing.
 *
 * @param {number} px - Desired body font size in CSS px.
 * @param {string} breakpoint - 'mobile' | 'tablet' | 'desktop'.
 * @returns {number} A legal body font size in CSS px.
 */
export function clampBodySize(px, breakpoint) {
    const desired = Number.isFinite(px) ? px : BODY_MIN;

    if (breakpoint === 'mobile') {
        return Math.max(BODY_MIN, desired);
    }

    // tablet, desktop, and any unrecognized breakpoint use the bounded band.
    return Math.min(BODY_MAX, Math.max(BODY_MIN, desired));
}

/**
 * Compute a heading font size within `[1.25x, 2.5x]` of the body size.
 *
 * The requested ratio is clamped into `[HEADING_MIN_RATIO, HEADING_MAX_RATIO]`
 * before scaling, guaranteeing the result stays within the allowed band of the
 * body size. A non-finite ratio falls back to the minimum ratio.
 *
 * @param {number} bodyPx - The resolved body font size in CSS px.
 * @param {number} ratio - Desired heading-to-body ratio.
 * @returns {number} A heading font size in CSS px.
 */
export function scaleHeading(bodyPx, ratio) {
    const requested = Number.isFinite(ratio) ? ratio : HEADING_MIN_RATIO;
    const clampedRatio = Math.min(
        HEADING_MAX_RATIO,
        Math.max(HEADING_MIN_RATIO, requested)
    );

    return bodyPx * clampedRatio;
}
