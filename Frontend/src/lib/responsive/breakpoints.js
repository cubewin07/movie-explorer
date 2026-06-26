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
 * Per-breakpoint layout column counts, in CSS-grid terms.
 *
 * Mobile is a single stacked column, tablet is capped at two columns, and
 * desktop uses a multi-column (>2) layout (Requirements 1.1, 1.2, 1.3).
 * @type {{ mobile: number, tablet: number, desktop: number }}
 */
export const LAYOUT_COLUMNS = { mobile: 1, tablet: 2, desktop: 3 };

/**
 * Resolve the layout selection for a viewport width.
 *
 * The three layout facets are decided together from the breakpoint so they stay
 * mutually consistent (Requirement 2 derives from the same breakpoint as the
 * column count and right-sidebar visibility):
 *
 *   - `columns`             : 1 at mobile, 2 at tablet (the cap), 3+ at desktop.
 *   - `navMode`             : `'overlay'` for every sub-desktop width (mobile and
 *                             tablet share the collapsed overlay), `'sidebar'` at
 *                             desktop (the expandable left sidebar).
 *   - `rightSidebarVisible` : `true` only at desktop; hidden at mobile and tablet.
 *
 * Out-of-range or invalid widths resolve via `resolveBreakpoint` to `'mobile'`,
 * yielding the smallest, safest layout.
 *
 * @param {number} width - Viewport width in CSS pixels.
 * @returns {{ columns: number, navMode: 'overlay' | 'sidebar', rightSidebarVisible: boolean }}
 */
export function resolveLayout(width) {
    const breakpoint = resolveBreakpoint(width);
    const isDesktop = breakpoint === 'desktop';
    return {
        columns: LAYOUT_COLUMNS[breakpoint],
        navMode: isDesktop ? 'sidebar' : 'overlay',
        rightSidebarVisible: isDesktop,
    };
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
