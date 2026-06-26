import { createContext, useContext, useMemo } from 'react';
import { MotionConfig } from 'framer-motion';

import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { resolveVariants as resolveVariantsCore, staggerDelay as staggerDelayCore } from '../lib/responsive/motion.js';

/**
 * @typedef {Object} MotionContextValue
 * @property {boolean} reducedMotion - Whether the user prefers reduced motion.
 * @property {(name: string, opts?: { essential?: boolean }) => object} resolveVariants
 *   Resolve a named framer-motion variant, with the active reduced-motion
 *   preference injected automatically.
 * @property {(index: number) => number} staggerDelay - Per-item entrance delay in seconds.
 */

/**
 * Context backing {@link useAppMotion}. Defaults mirror the "no reduced motion"
 * case so consumers rendered outside a provider still receive working helpers.
 *
 * @type {import('react').Context<MotionContextValue>}
 */
const MotionContext = createContext({
    reducedMotion: false,
    resolveVariants: (name, opts = {}) => resolveVariantsCore(name, { reducedMotion: false, ...opts }),
    staggerDelay: staggerDelayCore,
});

/**
 * Provides app-wide motion configuration.
 *
 * Wraps the tree in framer-motion's `MotionConfig` with `reducedMotion="user"`
 * so framer-motion automatically zeroes transform/opacity transitions when the
 * OS-level `prefers-reduced-motion: reduce` setting is on. It also exposes a
 * context consumed via {@link useAppMotion} that surfaces the current
 * reduced-motion preference and the responsive-core motion helpers, injecting
 * the live `reducedMotion` value into every `resolveVariants` call so callers
 * don't have to thread the preference through manually.
 *
 * @param {{ children: import('react').ReactNode }} props
 * @returns {import('react').ReactElement}
 */
export function MotionConfigProvider({ children }) {
    const reducedMotion = useReducedMotion();

    const value = useMemo(
        () => ({
            reducedMotion,
            resolveVariants: (name, opts = {}) => resolveVariantsCore(name, { reducedMotion, ...opts }),
            staggerDelay: staggerDelayCore,
        }),
        [reducedMotion],
    );

    return (
        <MotionContext.Provider value={value}>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </MotionContext.Provider>
    );
}

/**
 * Access the app motion context.
 *
 * @returns {MotionContextValue} The current reduced-motion preference and the
 *   `resolveVariants` / `staggerDelay` helpers (with reduced motion pre-applied).
 */
export function useAppMotion() {
    return useContext(MotionContext);
}

export default MotionConfigProvider;
