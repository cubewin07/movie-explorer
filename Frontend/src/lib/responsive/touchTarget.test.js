import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { MIN_TOUCH_PX, normalizeTouchTarget } from './touchTarget.js';

describe('normalizeTouchTarget', () => {
    // Feature: responsive-ui-redesign, Property 3: Touch targets meet the minimum activatable area without shrinking content.
    // For any element content size {width, height}, normalizeTouchTarget returns minWidth >= 44 and
    // minHeight >= 44, and when a dimension is below 44 the added padding compensates symmetrically so
    // the visible content box is never reduced.
    // Validates: Requirements 2.7, 3.1, 3.4
    it('guarantees a >=44x44 activatable area without shrinking the content box', () => {
        fc.assert(
            fc.property(
                fc.record({ width: fc.nat(), height: fc.nat() }),
                (content) => {
                    const { minWidth, minHeight, padX, padY } = normalizeTouchTarget(content);

                    // Minimum activatable area is at least 44 CSS px on each axis.
                    expect(minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_PX);
                    expect(minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_PX);

                    // Padding never shrinks the content; it only ever expands the box.
                    expect(padX).toBeGreaterThanOrEqual(0);
                    expect(padY).toBeGreaterThanOrEqual(0);

                    // The content box is preserved: content size + symmetric padding on both
                    // sides exactly fills the normalized min box, so nothing is reduced.
                    expect(content.width + 2 * padX).toBeCloseTo(minWidth);
                    expect(content.height + 2 * padY).toBeCloseTo(minHeight);
                }
            ),
            { numRuns: 100 }
        );
    });
});
