// Unit tests for the useBreakpoint hook.
//
// These exercise the browser-adapter behaviour of the hook: it must reflect the
// active matchMedia breakpoint, update live when a `change` event fires, and
// fall back to the SSR-safe `desktop` default when matchMedia is unavailable
// (Requirement 1.4).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { breakpointQuery } from '../lib/responsive/breakpoints.js';
import { useBreakpoint } from './useBreakpoint.js';

/**
 * Build a controllable `window.matchMedia` mock.
 *
 * A single active breakpoint drives the `matches` value of every MediaQueryList
 * it hands out: a query matches only when it equals the canonical query for the
 * currently active breakpoint. `setBreakpoint` flips the active breakpoint and
 * notifies all registered `change` listeners, simulating a viewport crossing a
 * boundary.
 */
function createMatchMediaMock(initialBreakpoint = 'desktop') {
    let active = initialBreakpoint;
    const listeners = new Set();

    const matchMedia = vi.fn((query) => ({
        media: query,
        get matches() {
            return query === breakpointQuery(active);
        },
        addEventListener: (_event, cb) => listeners.add(cb),
        removeEventListener: (_event, cb) => listeners.delete(cb),
        // Legacy API fallbacks the hook also supports.
        addListener: (cb) => listeners.add(cb),
        removeListener: (cb) => listeners.delete(cb),
        dispatchEvent: () => true,
    }));

    matchMedia.setBreakpoint = (breakpoint) => {
        active = breakpoint;
        listeners.forEach((cb) => cb({ matches: true }));
    };

    matchMedia.listenerCount = () => listeners.size;

    return matchMedia;
}

describe('useBreakpoint', () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        vi.restoreAllMocks();
    });

    it('reflects the initial matched breakpoint', () => {
        window.matchMedia = createMatchMediaMock('mobile');

        const { result } = renderHook(() => useBreakpoint());

        expect(result.current.breakpoint).toBe('mobile');
        expect(result.current.isMobile).toBe(true);
        expect(result.current.isTablet).toBe(false);
        expect(result.current.isDesktop).toBe(false);
    });

    it('updates state when a matchMedia change event fires', () => {
        const matchMedia = createMatchMediaMock('mobile');
        window.matchMedia = matchMedia;

        const { result } = renderHook(() => useBreakpoint());
        expect(result.current.breakpoint).toBe('mobile');

        // Cross into the tablet range.
        act(() => {
            matchMedia.setBreakpoint('tablet');
        });
        expect(result.current.breakpoint).toBe('tablet');
        expect(result.current.isTablet).toBe(true);
        expect(result.current.isMobile).toBe(false);

        // Cross into the desktop range.
        act(() => {
            matchMedia.setBreakpoint('desktop');
        });
        expect(result.current.breakpoint).toBe('desktop');
        expect(result.current.isDesktop).toBe(true);
        expect(result.current.isTablet).toBe(false);
    });

    it('detaches change listeners on unmount', () => {
        const matchMedia = createMatchMediaMock('desktop');
        window.matchMedia = matchMedia;

        const { unmount } = renderHook(() => useBreakpoint());
        expect(matchMedia.listenerCount()).toBeGreaterThan(0);

        unmount();
        expect(matchMedia.listenerCount()).toBe(0);
    });

    it('defaults to desktop when matchMedia is unavailable (SSR-safe)', () => {
        // Simulate a runtime without the matchMedia API (e.g. server render).
        window.matchMedia = undefined;

        const { result } = renderHook(() => useBreakpoint());

        expect(result.current.breakpoint).toBe('desktop');
        expect(result.current.isDesktop).toBe(true);
        expect(result.current.isMobile).toBe(false);
        expect(result.current.isTablet).toBe(false);
    });
});
