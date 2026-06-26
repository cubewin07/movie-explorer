import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { fitWidth } from './media.js';

// Feature: responsive-ui-redesign, Property 6: Media display preserves source
// aspect ratio. For any source image dimensions and any container width, the
// computed display height fills the container width and preserves the source
// aspect ratio within a tolerance of +/- 1 percent.
// Validates: Requirements 4.4
describe('fitWidth (Property 6: media display preserves source aspect ratio)', () => {
    it('preserves the source aspect ratio within +/- 1 percent', () => {
        fc.assert(
            fc.property(
                // Positive source dimensions: a defined aspect ratio requires
                // both dimensions to be strictly greater than zero.
                fc.integer({ min: 1, max: 10000 }),
                fc.integer({ min: 1, max: 10000 }),
                // Positive container width: ratio of the display box is only
                // defined when the rendered width is greater than zero.
                fc.integer({ min: 1, max: 4000 }),
                (srcWidth, srcHeight, containerWidth) => {
                    const displayHeight = fitWidth({ srcWidth, srcHeight }, containerWidth);

                    // Display height fills the container width while keeping the
                    // source aspect ratio.
                    expect(displayHeight).toBeGreaterThan(0);

                    const sourceRatio = srcWidth / srcHeight;
                    const displayRatio = containerWidth / displayHeight;

                    // Within +/- 1 percent of the source aspect ratio.
                    const relativeError = Math.abs(displayRatio - sourceRatio) / sourceRatio;
                    expect(relativeError).toBeLessThanOrEqual(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });
});
