import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Reads the current `prefers-reduced-motion: reduce` preference.
 * Guards against missing `window`/`matchMedia` (SSR, tests, older runtimes)
 * by defaulting to `false`.
 *
 * @returns {boolean} `true` when the user prefers reduced motion.
 */
function getInitialReducedMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Tracks the `prefers-reduced-motion: reduce` media query live, updating when
 * the user changes their OS-level motion preference.
 *
 * SSR-safe: returns `false` when `window`/`matchMedia` is unavailable.
 *
 * @returns {boolean} Whether reduced motion is currently preferred.
 */
export function useReducedMotion() {
    const [reducedMotion, setReducedMotion] = useState(getInitialReducedMotion);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return undefined;
        }

        const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

        const handleChange = (event) => {
            setReducedMotion(event.matches);
        };

        // Sync in case the preference changed between initial render and effect.
        setReducedMotion(mediaQuery.matches);

        // Modern browsers expose addEventListener; older Safari uses addListener.
        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    return reducedMotion;
}

export default useReducedMotion;
