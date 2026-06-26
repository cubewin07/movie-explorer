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

// ---------------------------------------------------------------------------
// resolveVariants
// ---------------------------------------------------------------------------

/**
 * Hard ceilings on transition duration, in seconds.
 *
 * Requirements bound every entrance/transition to <=600ms, and hover/card
 * transitions to <=300ms. These act as defensive caps so a named variant can
 * never exceed its budget regardless of how it was defined.
 */
const MAX_DURATION_S = 0.6;
const MAX_HOVER_DURATION_S = 0.3;

/** Maximum positional displacement (px) permitted for essential variants under reduced motion. */
const MAX_ESSENTIAL_DISPLACEMENT_PX = 5;

/**
 * Whether a variant name denotes a hover/card transition (stricter 300ms budget).
 * @param {string} name
 * @returns {boolean}
 */
function isHoverOrCard(name) {
    const n = String(name).toLowerCase();
    return n.includes('hover') || n.includes('card');
}

/**
 * Clamp a transition duration (in seconds) to the budget for the given variant.
 * Non-finite or negative durations fall back to the ceiling.
 * @param {number} durationS
 * @param {string} name
 * @returns {number}
 */
function clampDuration(durationS, name) {
    const ceiling = isHoverOrCard(name) ? MAX_HOVER_DURATION_S : MAX_DURATION_S;
    const safe = Number.isFinite(durationS) && durationS >= 0 ? durationS : ceiling;
    return Math.min(safe, ceiling);
}

/**
 * Return a copy of a visual state with positional (x/y) displacement removed.
 * Opacity and scale targets are preserved.
 * @param {Record<string, number>} state
 * @returns {Record<string, number>}
 */
function stripDisplacement(state) {
    const { x, y, ...rest } = state ?? {};
    return rest;
}

/**
 * Return a copy of a visual state whose positional (x/y) displacement is capped
 * to +/- MAX_ESSENTIAL_DISPLACEMENT_PX on each axis.
 * @param {Record<string, number>} state
 * @returns {Record<string, number>}
 */
function clampDisplacement(state) {
    const out = { ...(state ?? {}) };
    if (typeof out.x === 'number') {
        out.x = clamp(out.x, -MAX_ESSENTIAL_DISPLACEMENT_PX, MAX_ESSENTIAL_DISPLACEMENT_PX);
    }
    if (typeof out.y === 'number') {
        out.y = clamp(out.y, -MAX_ESSENTIAL_DISPLACEMENT_PX, MAX_ESSENTIAL_DISPLACEMENT_PX);
    }
    return out;
}

/**
 * Resolve a named framer-motion variant, honoring the active motion budgets and
 * the user's reduced-motion preference.
 *
 * Behavior:
 * - Unknown `name`: returns a no-op, final-state variant (full opacity, no
 *   displacement, zero-duration transition) so rendering never breaks.
 * - `reducedMotion` + non-essential: returns the variant's final visual state
 *   with `duration: 0` and no x/y displacement, so the element appears directly
 *   in place with no intermediate animation.
 * - `reducedMotion` + essential: retains the animation but caps positional
 *   displacement to +/-5px on any axis, keeping the duration within budget.
 * - Otherwise: returns the named variant with its transition duration clamped to
 *   the budget (<=600ms in general, <=300ms for hover/card variants).
 *
 * The returned object is always a fresh copy; the shared `VARIANTS` definitions
 * are never mutated.
 *
 * @param {string} name - Named variant key (e.g. 'pageEnter', 'cardHover').
 * @param {{ reducedMotion?: boolean, essential?: boolean }} [options]
 * @returns {{ initial: Record<string, number>, animate: Record<string, number>, exit?: Record<string, number>, transition: { duration: number, delay?: number, ease?: string } }}
 */
export function resolveVariants(name, options = {}) {
    const { reducedMotion = false, essential = false } = options;
    const variant = VARIANTS[name];

    // Unknown variant: no-op final-state variant.
    if (!variant) {
        return {
            initial: { opacity: 1 },
            animate: { opacity: 1 },
            transition: { duration: 0 },
        };
    }

    if (reducedMotion) {
        if (!essential) {
            // Non-essential: snap to the final visual state with no transition
            // and no positional displacement.
            const finalState = stripDisplacement(variant.animate);
            const resolved = {
                initial: { ...finalState },
                animate: { ...finalState },
                transition: { duration: 0 },
            };
            if (variant.exit) {
                resolved.exit = stripDisplacement(variant.exit);
            }
            return resolved;
        }

        // Essential: keep the animation but cap positional displacement.
        const resolved = {
            initial: clampDisplacement(variant.initial),
            animate: clampDisplacement(variant.animate),
            transition: {
                ...variant.transition,
                duration: clampDuration(variant.transition?.duration, name),
            },
        };
        if (variant.exit) {
            resolved.exit = clampDisplacement(variant.exit);
        }
        return resolved;
    }

    // Normal motion: preserve terminal states, enforce duration budgets.
    const resolved = {
        initial: { ...variant.initial },
        animate: { ...variant.animate },
        transition: {
            ...variant.transition,
            duration: clampDuration(variant.transition?.duration, name),
        },
    };
    if (variant.exit) {
        resolved.exit = { ...variant.exit };
    }
    return resolved;
}
