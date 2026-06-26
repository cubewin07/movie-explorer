import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { MOTION, VARIANTS, resolveVariants, staggerDelay } from './motion.js';

const variantNames = Object.keys(VARIANTS);

// Variant names whose transitions are subject to the stricter hover/card budget.
const isHoverOrCardName = (name) => {
    const n = String(name).toLowerCase();
    return n.includes('hover') || n.includes('card');
};

describe('staggerDelay', () => {
    // Feature: responsive-ui-redesign, Property 7: List entrance stagger delay stays within bounds.
    // For any item index, staggerDelay(index) returns a per-item start delay between 50 and 150
    // milliseconds inclusive (returned in seconds, i.e. within [0.05, 0.15]).
    // Validates: Requirements 6.2
    it('keeps the per-item stagger delay within [0.05, 0.15] seconds', () => {
        fc.assert(
            fc.property(fc.nat({ max: 200 }), (index) => {
                const delaySeconds = staggerDelay(index);

                const minSeconds = MOTION.staggerMinMs / 1000;
                const maxSeconds = MOTION.staggerMaxMs / 1000;

                expect(delaySeconds).toBeGreaterThanOrEqual(minSeconds);
                expect(delaySeconds).toBeLessThanOrEqual(maxSeconds);
            }),
            { numRuns: 100 }
        );
    });
});

describe('resolveVariants', () => {
    // Feature: responsive-ui-redesign, Property 8: Animation durations stay within their budgets and terminate in the correct visual state.
    // For any named motion variant, resolveVariants(name) produces a transition duration no greater than 600ms
    // (no greater than 300ms for hover/card variants); page-enter and modal-enter terminate at 100% opacity,
    // and modal-exit terminates at 0% opacity.
    // Validates: Requirements 6.1, 6.3, 6.4, 6.5, 6.6
    it('keeps durations within budget and terminates in the correct visual state', () => {
        const entranceFinalOpacity = {
            pageEnter: 1,
            itemEnter: 1,
            modalEnter: 1,
            modalExit: 0,
        };

        fc.assert(
            fc.property(fc.constantFrom(...variantNames), (name) => {
                const resolved = resolveVariants(name);

                const maxDuration = isHoverOrCardName(name) ? 0.3 : 0.6;
                expect(resolved.transition.duration).toBeGreaterThanOrEqual(0);
                expect(resolved.transition.duration).toBeLessThanOrEqual(maxDuration);

                if (Object.prototype.hasOwnProperty.call(entranceFinalOpacity, name)) {
                    expect(resolved.animate.opacity).toBe(entranceFinalOpacity[name]);
                }
            }),
            { numRuns: 100 }
        );
    });

    // Feature: responsive-ui-redesign, Property 9: Card hover transition returns to its resting state.
    // For any card hover variant, the visual state after the hover or focus ends equals the resting (initial)
    // state, so hovering and then un-hovering is a round trip with no residual change.
    // Validates: Requirements 6.5
    it('returns the card hover to its resting state after hover ends', () => {
        const restingState = VARIANTS.cardHover.initial;

        fc.assert(
            fc.property(fc.boolean(), (essential) => {
                const resolved = resolveVariants('cardHover', { essential });

                // The post-hover state is the variant's resting (initial) state; it must match the
                // canonical resting definition exactly, with no residual displacement or scale.
                expect(resolved.initial).toEqual(restingState);

                // The hovered state must differ from the resting state, otherwise there is no transition
                // to round-trip back from.
                expect(resolved.animate).not.toEqual(resolved.initial);
            }),
            { numRuns: 100 }
        );
    });

    // Feature: responsive-ui-redesign, Property 10: Reduced motion yields the final state with no transition or displacement.
    // For any non-essential named variant resolved with reducedMotion = true, the effective transition duration
    // is 0 and the animated state equals the final visual state with no positional (x/y) displacement.
    // Validates: Requirements 2.9, 6.7, 7.1
    it('yields a zero-duration, displacement-free final state for non-essential reduced motion', () => {
        fc.assert(
            fc.property(fc.constantFrom(...variantNames), (name) => {
                const resolved = resolveVariants(name, { reducedMotion: true, essential: false });

                expect(resolved.transition.duration).toBe(0);

                for (const state of [resolved.initial, resolved.animate, resolved.exit]) {
                    if (!state) continue;
                    expect(state.x).toBeUndefined();
                    expect(state.y).toBeUndefined();
                }

                // The animated state equals the (displacement-free) final state.
                expect(resolved.animate).toEqual(resolved.initial);
            }),
            { numRuns: 100 }
        );
    });

    // Feature: responsive-ui-redesign, Property 11: Essential animations under reduced motion limit positional displacement.
    // For any essential named variant resolved with reducedMotion = true, the animation is retained but its
    // positional displacement never exceeds 5 pixels on any axis.
    // Validates: Requirements 7.3
    it('caps positional displacement at 5px per axis for essential reduced motion', () => {
        fc.assert(
            fc.property(fc.constantFrom(...variantNames), (name) => {
                const resolved = resolveVariants(name, { reducedMotion: true, essential: true });

                for (const state of [resolved.initial, resolved.animate, resolved.exit]) {
                    if (!state) continue;
                    if (typeof state.x === 'number') {
                        expect(Math.abs(state.x)).toBeLessThanOrEqual(5);
                    }
                    if (typeof state.y === 'number') {
                        expect(Math.abs(state.y)).toBeLessThanOrEqual(5);
                    }
                }
            }),
            { numRuns: 100 }
        );
    });
});
