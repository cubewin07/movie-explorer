import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
    BODY_MIN,
    BODY_MAX,
    HEADING_MIN_RATIO,
    HEADING_MAX_RATIO,
    clampBodySize,
    scaleHeading,
} from './typography.js';

describe('clampBodySize', () => {
    // Feature: responsive-ui-redesign, Property 4: Body text size stays within the legal band per breakpoint.
    // For any desired body size and breakpoint, clampBodySize returns at least 16 pixels at
    // `mobile`, and between 16 and 20 pixels inclusive at `tablet` and `desktop`.
    // Validates: Requirements 4.1, 4.2
    it('keeps body size within the legal band for every breakpoint', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 8, max: 40 }),
                fc.constantFrom('mobile', 'tablet', 'desktop'),
                (px, breakpoint) => {
                    const size = clampBodySize(px, breakpoint);

                    if (breakpoint === 'mobile') {
                        // At mobile the only constraint is a 16px floor (no upper bound).
                        expect(size).toBeGreaterThanOrEqual(BODY_MIN);
                    } else {
                        // Tablet and desktop are bounded into [16, 20] inclusive.
                        expect(size).toBeGreaterThanOrEqual(BODY_MIN);
                        expect(size).toBeLessThanOrEqual(BODY_MAX);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});

describe('scaleHeading', () => {
    // Feature: responsive-ui-redesign, Property 5: Heading size scales within the allowed ratio of body size.
    // For any body size and any ratio, scaleHeading returns a value that is at least 1.25 times
    // and no more than 2.5 times the body size for that breakpoint.
    // Validates: Requirements 4.3
    it('produces a heading within [1.25x, 2.5x] of the body size', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 8, max: 40 }),
                fc.double({ min: -10, max: 10, noNaN: true }),
                (bodyPx, ratio) => {
                    const heading = scaleHeading(bodyPx, ratio);

                    // Body sizes are positive, so the band orders as [min, max].
                    expect(heading).toBeGreaterThanOrEqual(bodyPx * HEADING_MIN_RATIO);
                    expect(heading).toBeLessThanOrEqual(bodyPx * HEADING_MAX_RATIO);
                }
            ),
            { numRuns: 100 }
        );
    });
});
