import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import { motion } from 'framer-motion';

import { MotionConfigProvider, useAppMotion } from '../context/MotionConfigProvider.jsx';

// Feature: responsive-ui-redesign, Task 14.3 — reduced-motion integration tests.
//
// These integration tests render a real consumer of `useAppMotion` inside the
// `MotionConfigProvider` and exercise the live `prefers-reduced-motion: reduce`
// preference end-to-end:
//
//   (7.2) With reduced motion active, the resolved variant is the final visual
//         state (zero-duration transition, no positional displacement) so the
//         control/content is immediately present and operable — it never depends
//         on an animation completing.
//   (7.4) Toggling the preference live (dispatching a matchMedia `change` event)
//         flips `useReducedMotion`/`useAppMotion` output so motion snaps to the
//         final state.
//
// Validates: Requirements 7.2, 7.4

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Build a controllable `matchMedia` mock whose `matches` value can be flipped at
 * runtime via `emitChange`, dispatching a `change` event to every registered
 * listener (this is how the OS preference toggling is simulated mid-session).
 *
 * Only the reduced-motion query reflects `reducedMotionActive`; any other query
 * resolves to `matches: false` so unrelated media queries behave predictably.
 */
function createMatchMediaMock(reducedMotionActive = false) {
    const listeners = new Set();
    let matches = reducedMotionActive;

    const matchMedia = vi.fn((query) => {
        const mql = {
            media: query,
            get matches() {
                return query === REDUCED_MOTION_QUERY ? matches : false;
            },
            addEventListener: vi.fn((event, handler) => {
                if (event === 'change') listeners.add(handler);
            }),
            removeEventListener: vi.fn((event, handler) => {
                if (event === 'change') listeners.delete(handler);
            }),
            addListener: vi.fn((handler) => listeners.add(handler)),
            removeListener: vi.fn((handler) => listeners.delete(handler)),
            dispatchEvent: vi.fn(),
            onchange: null,
        };
        return mql;
    });

    /** Flip the reduced-motion preference and notify all subscribers. */
    const emitChange = (nextMatches) => {
        matches = nextMatches;
        listeners.forEach((handler) => handler({ matches: nextMatches }));
    };

    return { matchMedia, emitChange, listeners };
}

/**
 * Minimal consumer of `useAppMotion`: a single animated, operable control
 * (a button). It requests the `pageEnter` variant and renders the resolved
 * transition duration into a test id so the test can assert the effective
 * motion without relying on framer-motion's internal animation timeline.
 */
function MotionControl() {
    const { resolveVariants } = useAppMotion();
    const variant = resolveVariants('pageEnter');

    return (
        <motion.button
            type="button"
            data-testid="control"
            data-duration={variant.transition.duration}
            data-initial-x={'x' in variant.initial ? variant.initial.x : 'none'}
            data-initial-y={'y' in variant.initial ? variant.initial.y : 'none'}
            data-initial-opacity={variant.initial.opacity}
            initial={variant.initial}
            animate={variant.animate}
            transition={variant.transition}
        >
            Open menu
        </motion.button>
    );
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('reduced-motion integration', () => {
    it('renders controls immediately in their final state when reduced motion is active (7.2)', () => {
        const { matchMedia } = createMatchMediaMock(true);
        vi.stubGlobal('matchMedia', matchMedia);

        render(
            <MotionConfigProvider>
                <MotionControl />
            </MotionConfigProvider>,
        );

        const control = screen.getByTestId('control');

        // The control is present and operable without waiting for any animation.
        expect(control).toBeInTheDocument();
        expect(control).toBeEnabled();
        expect(control).toHaveTextContent('Open menu');

        // Final-state variant: zero-duration transition and no positional drift,
        // settling directly at full opacity.
        expect(control).toHaveAttribute('data-duration', '0');
        expect(control).toHaveAttribute('data-initial-x', 'none');
        expect(control).toHaveAttribute('data-initial-y', 'none');
        expect(control).toHaveAttribute('data-initial-opacity', '1');
    });

    it('snaps to the final state when the preference is toggled on mid-session (7.4)', () => {
        const { matchMedia, emitChange } = createMatchMediaMock(false);
        vi.stubGlobal('matchMedia', matchMedia);

        render(
            <MotionConfigProvider>
                <MotionControl />
            </MotionConfigProvider>,
        );

        const control = screen.getByTestId('control');

        // Initially motion is allowed: a bounded, non-zero animation that starts
        // displaced from its final position.
        expect(Number(control.getAttribute('data-duration'))).toBeGreaterThan(0);
        expect(control).toHaveAttribute('data-initial-y', '12');

        // The user enables reduced motion while the page is live.
        act(() => emitChange(true));

        // Motion snaps to the final state: zero duration, no displacement.
        expect(control).toHaveAttribute('data-duration', '0');
        expect(control).toHaveAttribute('data-initial-y', 'none');
        expect(control).toHaveAttribute('data-initial-opacity', '1');

        // The control stays present and operable throughout the change.
        expect(control).toBeInTheDocument();
        expect(control).toBeEnabled();
    });

    it('restores bounded motion when the preference is toggled back off (7.4)', () => {
        const { matchMedia, emitChange } = createMatchMediaMock(true);
        vi.stubGlobal('matchMedia', matchMedia);

        render(
            <MotionConfigProvider>
                <MotionControl />
            </MotionConfigProvider>,
        );

        const control = screen.getByTestId('control');

        // Starts in the reduced-motion final state.
        expect(control).toHaveAttribute('data-duration', '0');

        // User turns reduced motion back off.
        act(() => emitChange(false));

        // Bounded motion is restored within the 600ms budget.
        const duration = Number(control.getAttribute('data-duration'));
        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThanOrEqual(0.6);
        expect(control).toHaveAttribute('data-initial-y', '12');
    });

    it('reflects the live preference through useAppMotion output (7.4)', () => {
        const { matchMedia, emitChange } = createMatchMediaMock(false);
        vi.stubGlobal('matchMedia', matchMedia);

        const wrapper = ({ children }) => <MotionConfigProvider>{children}</MotionConfigProvider>;
        const { result } = renderHook(() => useAppMotion(), { wrapper });

        // Initially motion is allowed.
        expect(result.current.reducedMotion).toBe(false);
        expect(result.current.resolveVariants('pageEnter').transition.duration).toBeGreaterThan(0);

        // Toggle the OS preference on mid-session.
        act(() => emitChange(true));

        // useAppMotion now reports reduced motion and resolves final-state variants.
        expect(result.current.reducedMotion).toBe(true);
        const reduced = result.current.resolveVariants('pageEnter');
        expect(reduced.transition.duration).toBe(0);
        expect(reduced.animate).not.toHaveProperty('y');
        expect(reduced.animate.opacity).toBe(1);
    });
});
