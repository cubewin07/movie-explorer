import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion.js';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Builds a controllable `matchMedia` mock whose `matches` value can be flipped
 * at runtime, firing a `change` event to any registered listeners.
 */
function createMatchMediaMock(initialMatches = false) {
    const listeners = new Set();
    const mql = {
        media: REDUCED_MOTION_QUERY,
        matches: initialMatches,
        addEventListener: vi.fn((event, handler) => {
            if (event === 'change') listeners.add(handler);
        }),
        removeEventListener: vi.fn((event, handler) => {
            if (event === 'change') listeners.delete(handler);
        }),
        // Legacy fallbacks (unused by modern path but kept for completeness).
        addListener: vi.fn((handler) => listeners.add(handler)),
        removeListener: vi.fn((handler) => listeners.delete(handler)),
    };

    const matchMedia = vi.fn(() => mql);

    const emitChange = (matches) => {
        mql.matches = matches;
        listeners.forEach((handler) => handler({ matches }));
    };

    return { matchMedia, mql, emitChange, listeners };
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('useReducedMotion', () => {
    it('returns the initial preference reported by matchMedia', () => {
        const { matchMedia } = createMatchMediaMock(true);
        vi.stubGlobal('matchMedia', matchMedia);

        const { result } = renderHook(() => useReducedMotion());

        expect(result.current).toBe(true);
        expect(matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
    });

    it('defaults to false when the user does not prefer reduced motion', () => {
        const { matchMedia } = createMatchMediaMock(false);
        vi.stubGlobal('matchMedia', matchMedia);

        const { result } = renderHook(() => useReducedMotion());

        expect(result.current).toBe(false);
    });

    it('updates live when the media query change event fires', () => {
        const { matchMedia, emitChange } = createMatchMediaMock(false);
        vi.stubGlobal('matchMedia', matchMedia);

        const { result } = renderHook(() => useReducedMotion());
        expect(result.current).toBe(false);

        act(() => emitChange(true));
        expect(result.current).toBe(true);

        act(() => emitChange(false));
        expect(result.current).toBe(false);
    });

    it('subscribes on mount and unsubscribes on unmount', () => {
        const { matchMedia, mql, listeners } = createMatchMediaMock(false);
        vi.stubGlobal('matchMedia', matchMedia);

        const { unmount } = renderHook(() => useReducedMotion());

        expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        expect(listeners.size).toBe(1);

        unmount();

        expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        expect(listeners.size).toBe(0);
    });

    it('defaults to false (safe default) when matchMedia is unavailable', () => {
        vi.stubGlobal('matchMedia', undefined);

        const { result } = renderHook(() => useReducedMotion());

        expect(result.current).toBe(false);
    });
});
