import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { MOTION, staggerDelay } from './motion.js';

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
