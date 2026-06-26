// Responsive breakpoint core.
//
// Pure, framework-free helpers that map a viewport width (CSS px) to a canonical
// breakpoint name and produce the matchMedia query strings derived from the same
// single source of truth. No DOM or React dependencies live here.
//
// Boundaries (Requirements 1.1, 1.2, 1.3):
//   mobile  : width < 768
//   tablet  : 768 <= width <= 1023
//   desktop : width >= 1024

/**
 * Canonical breakpoint lower bounds, in CSS pixels.
 * @type {{ mobile: number, tablet: number, desktop: number }}
 */
export const BREAKPOINTS = { mobile: 0, tablet: 768, desktop: 1024 };

/**
 * Map a viewport width (CSS px) to a breakpoint name.
 *
 * Out-of-range or invalid inputs (negative numbers, NaN, non-numbers) resolve to
 * the smallest layout, `'mobile'`, rather than throwing, so callers always get a
 * renderable value.
 *
 * @param {number} width - Viewport width in CSS pixels.
 * @returns {'mobile' | 'tablet' | 'desktop'}
 */
export function resolveBreakpoint(width) {
    // Treat negative, NaN, or non-numeric widths as the smallest layout.
    if (typeof width !== 'number' || Number.isNaN(width) || width < BREAKPOINTS.tablet) {
        return 'mobile';
    }
    if (width < BREAKPOINTS.desktop) {
        return 'tablet';
    }
    return 'desktop';
}

/**
 * Build a `matchMedia`-compatible query string for a breakpoint name, derived
 * from BREAKPOINTS so CSS and JS stay in sync.
 *
 * Upper bounds use a 0.02px offset (`767.98px`, `1023.98px`) to avoid the
 * fractional overlap that can occur on high-DPI displays between an exclusive
 * `max-width` and the next `min-width`.
 *
 * @param {'mobile' | 'tablet' | 'desktop'} name
 * @returns {string} A CSS media query string.
 */
export function breakpointQuery(name) {
    switch (name) {
        case 'mobile':
            return `(max-width: ${BREAKPOINTS.tablet - 0.02}px)`;
        case 'tablet':
            return `(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINTS.desktop - 0.02}px)`;
        case 'desktop':
            return `(min-width: ${BREAKPOINTS.desktop}px)`;
        default:
            throw new Error(`Unknown breakpoint name: ${String(name)}`);
    }
}
