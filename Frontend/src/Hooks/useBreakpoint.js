import { useState, useEffect } from 'react';
import { breakpointQuery, resolveBreakpoint } from '../lib/responsive/breakpoints.js';

// Default breakpoint used when the DOM media APIs are unavailable (SSR, tests,
// older runtimes). Desktop is the safest default because it renders the full
// multi-column layout (Requirements 1.1, 1.2, 1.3).
const DEFAULT_BREAKPOINT = 'desktop';

/**
 * Determine whether the `matchMedia` API is usable in the current runtime.
 *
 * @returns {boolean}
 */
function hasMatchMedia() {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

/**
 * Resolve the current breakpoint name from the browser.
 *
 * Prefers `matchMedia` (the canonical source derived from BREAKPOINTS via
 * `breakpointQuery`) and falls back to `window.innerWidth` so the hook stays
 * correct even if a query somehow fails to match. When `window`/`matchMedia`
 * is unavailable, it returns the SSR-safe default.
 *
 * @returns {'mobile' | 'tablet' | 'desktop'}
 */
function readBreakpoint() {
    if (!hasMatchMedia()) {
        return DEFAULT_BREAKPOINT;
    }
    if (window.matchMedia(breakpointQuery('mobile')).matches) {
        return 'mobile';
    }
    if (window.matchMedia(breakpointQuery('tablet')).matches) {
        return 'tablet';
    }
    if (window.matchMedia(breakpointQuery('desktop')).matches) {
        return 'desktop';
    }
    // Fallback: derive from the viewport width directly.
    return resolveBreakpoint(window.innerWidth);
}

/**
 * Subscribe to viewport breakpoint changes.
 *
 * Listens to `matchMedia` change events for each breakpoint query and updates
 * its state when the viewport crosses a boundary, well within the 500ms budget
 * (Requirement 1.4). Decisions are delegated to the pure responsive core so the
 * hook stays a thin browser adapter. SSR-safe: defaults to `desktop` when
 * `window`/`matchMedia` is unavailable (Requirements 1.1, 1.2, 1.3).
 *
 * @returns {{ breakpoint: 'mobile' | 'tablet' | 'desktop', isMobile: boolean, isTablet: boolean, isDesktop: boolean }}
 */
export function useBreakpoint() {
    const [breakpoint, setBreakpoint] = useState(readBreakpoint);

    useEffect(() => {
        if (!hasMatchMedia()) {
            return undefined;
        }

        const update = () => setBreakpoint(readBreakpoint());

        // Sync once on mount in case the viewport changed before listeners were
        // attached (e.g. between initial render and effect).
        update();

        const queryLists = ['mobile', 'tablet', 'desktop'].map((name) =>
            window.matchMedia(breakpointQuery(name))
        );

        queryLists.forEach((mql) => {
            if (typeof mql.addEventListener === 'function') {
                mql.addEventListener('change', update);
            } else if (typeof mql.addListener === 'function') {
                // Legacy Safari / older browsers.
                mql.addListener(update);
            }
        });

        return () => {
            queryLists.forEach((mql) => {
                if (typeof mql.removeEventListener === 'function') {
                    mql.removeEventListener('change', update);
                } else if (typeof mql.removeListener === 'function') {
                    mql.removeListener(update);
                }
            });
        };
    }, []);

    return {
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
    };
}

export default useBreakpoint;
