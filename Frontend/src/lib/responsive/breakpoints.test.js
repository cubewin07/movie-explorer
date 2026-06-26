import { describe, it, expect } from 'vitest';
import { BREAKPOINTS, resolveBreakpoint, breakpointQuery } from './breakpoints.js';

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
