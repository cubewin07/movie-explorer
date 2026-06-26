// Motion core for the responsive UI redesign.
//
// Pure, framework-free motion configuration. This module exposes the motion
// timing budgets, the named framer-motion variant definitions used across the
// app, and the `staggerDelay` helper for list/grid entrance animations.
//
// Reduced-motion handling and the `resolveVariants` resolver live in a
// subsequent task; this module only provides the raw budgets, variant
// definitions, and the stagger-delay helper.

/**
 * Animation timing budgets, expressed in milliseconds.
 *
 * These mirror the durations mandated by the requirements:
 * - page / modal entrance and exit complete within 600ms
 * - hover / card transitions complete within 300ms
 * - per-item list stagger delay stays within [50, 150]ms
 */
export const MOTION = {
    pageMs: 400,
    modalMs: 300,
    hoverMs: 200,
    mobileNavMs: 250,
    staggerMinMs: 50,
    staggerMaxMs: 150,
};

// Convenience second-based durations for framer-motion (which uses seconds).
const PAGE_S = MOTION.pageMs / 1000;
const MODAL_S = MOTION.modalMs / 1000;
const HOVER_S = MOTION.hoverMs / 1000;
const MOBILE_NAV_S = MOTION.mobileNavMs / 1000;

/**
 * Standard easing used for entrance/exit transitions.
 * `easeOut` for entrances feels responsive; `easeInOut` for reversible motion.
 */
const EASE_OUT = 'easeOut';
const EASE_IN_OUT = 'easeInOut';

/**
 * Named framer-motion variant definitions.
 *
 * Each variant declares its `initial`, `animate`, optional `exit`, and a
 * `transition` whose duration stays within the budgets defined in `MOTION`.
 * Entrance variants terminate at full opacity (1); the modal exit terminates
 * at 0 opacity. The `cardHover` variant returns to its resting state so a
 * hover/un-hover cycle is a round trip with no residual change.
 */
export const VARIANTS = {
    // Primary_Page mount: fade up into final position (<= 600ms).
    pageEnter: {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: PAGE_S, ease: EASE_OUT },
    },

    // List/grid item entrance: fade up into place (<= 600ms; delay via staggerDelay).
    itemEnter: {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: PAGE_S, ease: EASE_OUT },
    },

    // Modal/dialog open: fade and scale up into final position (<= 600ms).
    modalEnter: {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: MODAL_S, ease: EASE_OUT },
    },

    // Modal/dialog close: fade and scale out, terminating at 0 opacity (<= 600ms).
    modalExit: {
        initial: { opacity: 1, scale: 1 },
        animate: { opacity: 0, scale: 0.96 },
        transition: { duration: MODAL_S, ease: EASE_IN_OUT },
    },

    // Interactive movie card hover/focus: subtle lift that reverses on exit (<= 300ms).
    cardHover: {
        initial: { scale: 1, y: 0 },
        animate: { scale: 1.03, y: -4 },
        transition: { duration: HOVER_S, ease: EASE_OUT },
    },

    // Mobile navigation overlay: slide/fade in and out (<= 600ms).
    mobileNav: {
        initial: { opacity: 0, x: -16 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -16 },
        transition: { duration: MOBILE_NAV_S, ease: EASE_IN_OUT },
    },
};

/**
 * Clamp a numeric value into an inclusive range.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
    if (Number.isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
}

/**
 * Compute the per-item entrance start delay for a staggered list/grid.
 *
 * The raw delay grows with the item index (`index * perItemMs`) but is clamped
 * to the legal stagger band of [50, 150]ms, then converted to seconds for
 * framer-motion. Negative or NaN indices are treated as the minimum delay.
 *
 * @param {number} index - Zero-based item position in the list/grid.
 * @param {number} [perItemMs=60] - Base delay added per item, in milliseconds.
 * @returns {number} Start delay in seconds, within [0.05, 0.15].
 */
export function staggerDelay(index, perItemMs = 60) {
    const safeIndex = Number.isFinite(index) && index > 0 ? index : 0;
    const safePerItem = Number.isFinite(perItemMs) ? perItemMs : 60;
    const rawMs = safeIndex * safePerItem;
    const clampedMs = clamp(rawMs, MOTION.staggerMinMs, MOTION.staggerMaxMs);
    return clampedMs / 1000;
}
