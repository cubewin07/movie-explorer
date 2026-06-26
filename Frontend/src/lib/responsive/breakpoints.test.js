import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BREAKPOINTS, resolveBreakpoint, breakpointQuery, resolveLayout } from './breakpoints.js';

describe('BREAKPOINTS', () => {
    it('exposes the canonical lower bounds', () => {
        expect(BREAKPOINTS).toEqual({ mobile: 0, tablet: 768, desktop: 1024 });
    });
});

describe('resolveBreakpoint', () => {
    it('maps widths below 768 to mobile', () => {
        expect(resolveBreakpoint(0)).toBe('mobile');
        expect(resolveBreakpoint(375)).toBe('mobile');
        expect(resolveBreakpoint(767)).toBe('mobile');
    });

    it('maps widths from 768 through 1023 to tablet', () => {
        expect(resolveBreakpoint(768)).toBe('tablet');
        expect(resolveBreakpoint(900)).toBe('tablet');
        expect(resolveBreakpoint(1023)).toBe('tablet');
    });

    it('maps widths of 1024 or greater to desktop', () => {
        expect(resolveBreakpoint(1024)).toBe('desktop');
        expect(resolveBreakpoint(1440)).toBe('desktop');
        expect(resolveBreakpoint(4000)).toBe('desktop');
    });

    it('treats negative, NaN, and non-numeric widths as mobile', () => {
        expect(resolveBreakpoint(-1)).toBe('mobile');
        expect(resolveBreakpoint(-9999)).toBe('mobile');
        expect(resolveBreakpoint(NaN)).toBe('mobile');
        expect(resolveBreakpoint(undefined)).toBe('mobile');
        expect(resolveBreakpoint('800')).toBe('mobile');
    });
});

describe('breakpointQuery', () => {
    it('builds an exclusive upper bound for mobile', () => {
        expect(breakpointQuery('mobile')).toBe('(max-width: 767.98px)');
    });

    it('builds a bounded range for tablet', () => {
        expect(breakpointQuery('tablet')).toBe('(min-width: 768px) and (max-width: 1023.98px)');
    });

    it('builds a min-width query for desktop', () => {
        expect(breakpointQuery('desktop')).toBe('(min-width: 1024px)');
    });

    it('throws on an unknown breakpoint name', () => {
        expect(() => breakpointQuery('giant')).toThrow();
    });
});

// A fast-check arbitrary over viewport widths that seeds the breakpoint
// boundaries (767/768/1023/1024) alongside the general [0, 4000] range, so the
// off-by-one transitions are always exercised.
const widthArb = fc.oneof(
    fc.constantFrom(0, 767, 768, 1023, 1024, 4000),
    fc.nat({ max: 4000 }),
);

// Feature: responsive-ui-redesign, Property 1: Breakpoint resolution partitions
// viewport widths. For any non-negative viewport width, resolveBreakpoint returns
// exactly one breakpoint such that widths below 768 map to mobile, widths from
// 768 through 1023 map to tablet, and widths of 1024 or greater map to desktop.
// Validates: Requirements 1.1, 1.2, 1.3
describe('Property 1: breakpoint resolution partitions viewport widths', () => {
    it('maps every width to exactly the breakpoint its range dictates', () => {
        fc.assert(
            fc.property(widthArb, (width) => {
                const breakpoint = resolveBreakpoint(width);

                // Exactly one of the three names is returned.
                expect(['mobile', 'tablet', 'desktop']).toContain(breakpoint);

                if (width < 768) {
                    expect(breakpoint).toBe('mobile');
                } else if (width <= 1023) {
                    expect(breakpoint).toBe('tablet');
                } else {
                    expect(breakpoint).toBe('desktop');
                }
            }),
            { numRuns: 100 },
        );
    });
});

// Feature: responsive-ui-redesign, Property 2: Layout, navigation, and
// right-sidebar selection follow the breakpoint. For any viewport width, the
// column count is 1 at mobile, at most 2 at tablet, and multi-column (>2) at
// desktop; navMode is the collapsed overlay for every sub-desktop width and the
// expandable left sidebar at desktop; the right sidebar is visible only at desktop.
// Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.4, 2.5
describe('Property 2: layout/navigation/right-sidebar selection follows the breakpoint', () => {
    it('derives mutually consistent layout facets from the breakpoint', () => {
        fc.assert(
            fc.property(widthArb, (width) => {
                const breakpoint = resolveBreakpoint(width);
                const { columns, navMode, rightSidebarVisible } = resolveLayout(width);

                if (breakpoint === 'mobile') {
                    expect(columns).toBe(1);
                    expect(navMode).toBe('overlay');
                    expect(rightSidebarVisible).toBe(false);
                } else if (breakpoint === 'tablet') {
                    expect(columns).toBeLessThanOrEqual(2);
                    expect(columns).toBeGreaterThanOrEqual(1);
                    expect(navMode).toBe('overlay');
                    expect(rightSidebarVisible).toBe(false);
                } else {
                    // desktop
                    expect(columns).toBeGreaterThan(2);
                    expect(navMode).toBe('sidebar');
                    expect(rightSidebarVisible).toBe(true);
                }

                // The right sidebar is part of the multi-column desktop layout and
                // is visible exactly when the breakpoint is desktop.
                expect(rightSidebarVisible).toBe(breakpoint === 'desktop');
            }),
            { numRuns: 100 },
        );
    });
});
