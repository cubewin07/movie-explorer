import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { MotionConfigProvider, useAppMotion } from './MotionConfigProvider.jsx';

// Feature: responsive-ui-redesign, Task 10.2 — unit tests for the motion provider.
//
// `useAppMotion().resolveVariants` must honor the live `prefers-reduced-motion`
// preference surfaced by the provider:
// - reduced motion active  -> final-state variant (zero duration, no x/y drift)
// - reduced motion inactive -> bounded variant (0 < duration <= 0.6s)
//
// Validates: Requirements 6.7, 7.1

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Install a `window.matchMedia` stub whose `matches` reflects whether reduced
 * motion is active for the reduced-motion media query.
 * @param {boolean} reducedMotionActive
 */
function mockMatchMedia(reducedMotionActive) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === REDUCED_MOTION_QUERY ? reducedMotionActive : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

const wrapper = ({ children }) => <MotionConfigProvider>{children}</MotionConfigProvider>;

describe('MotionConfigProvider / useAppMotion', () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        vi.restoreAllMocks();
    });

    describe('when reduced motion is active', () => {
        beforeEach(() => {
            mockMatchMedia(true);
        });

        it('exposes reducedMotion === true', () => {
            const { result } = renderHook(() => useAppMotion(), { wrapper });
            expect(result.current.reducedMotion).toBe(true);
        });

        it('resolveVariants returns a zero-duration final-state variant with no displacement', () => {
            const { result } = renderHook(() => useAppMotion(), { wrapper });
            const variant = result.current.resolveVariants('pageEnter');

            // Final-state: zero-duration transition (no animation plays).
            expect(variant.transition.duration).toBe(0);

            // No positional displacement on initial or animate states.
            expect(variant.initial).not.toHaveProperty('x');
            expect(variant.initial).not.toHaveProperty('y');
            expect(variant.animate).not.toHaveProperty('x');
            expect(variant.animate).not.toHaveProperty('y');

            // Element settles directly at the final visual state (full opacity).
            expect(variant.initial.opacity).toBe(1);
            expect(variant.animate.opacity).toBe(1);
        });
    });

    describe('when reduced motion is inactive', () => {
        beforeEach(() => {
            mockMatchMedia(false);
        });

        it('exposes reducedMotion === false', () => {
            const { result } = renderHook(() => useAppMotion(), { wrapper });
            expect(result.current.reducedMotion).toBe(false);
        });

        it('resolveVariants returns a bounded variant (0 < duration <= 0.6s)', () => {
            const { result } = renderHook(() => useAppMotion(), { wrapper });
            const variant = result.current.resolveVariants('pageEnter');

            // Bounded, non-trivial animation within the 600ms budget.
            expect(variant.transition.duration).toBeGreaterThan(0);
            expect(variant.transition.duration).toBeLessThanOrEqual(0.6);

            // Bounded motion animates into its final resting position.
            expect(variant.initial.y).toBe(12);
            expect(variant.animate.y).toBe(0);
            expect(variant.animate.opacity).toBe(1);
        });
    });
});
