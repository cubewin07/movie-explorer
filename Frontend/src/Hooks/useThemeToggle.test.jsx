import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import { useTheme } from './useThemeToggle.js';
import { resolveTokens } from '../lib/responsive/theme.js';

// `useTheme` performs the browser side effects around the pure theme reducer:
// it sets `data-theme` / `.dark` on the document element, persists to
// `localStorage['theme']`, falls back to the OS color scheme on a corrupt
// persisted value, and surfaces a `sonner` toast (rolling the theme back) when
// applying a theme fails. These unit tests exercise those side effects.
// Validates: Requirements 8.2, 8.4

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
        message: vi.fn(),
    },
}));

/**
 * Install a deterministic `window.matchMedia` that reports the given OS
 * dark-mode preference for `(prefers-color-scheme: dark)` queries.
 */
function setOSDarkPreference(prefersDark) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('dark') ? prefersDark : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
    // Default: OS does not prefer dark, so the fallback theme is `light`.
    setOSDarkPreference(false);
});

describe('useTheme', () => {
    it('updates data-theme, the .dark class, and tokens when the theme changes (8.2)', () => {
        const { result } = renderHook(() => useTheme());

        // Mount resolves to the default `light` theme (no persisted value, OS
        // not dark): the document reflects light and tokens match.
        expect(result.current.theme).toBe('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(result.current.tokens).toEqual(resolveTokens('light'));

        act(() => {
            result.current.setTheme('dark');
        });

        // The DOM, persisted value, and re-rendered tokens all follow the change.
        expect(result.current.theme).toBe('dark');
        expect(result.current.error).toBe(false);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(result.current.tokens).toEqual(resolveTokens('dark'));

        // A non-`light` theme keeps the `.dark` class for Tailwind variants.
        act(() => {
            result.current.setTheme('dracula');
        });
        expect(result.current.theme).toBe('dracula');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dracula');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(result.current.tokens).toEqual(resolveTokens('dracula'));
    });

    it('falls back to the OS preference when the persisted theme is corrupt (8.4)', () => {
        // A corrupt persisted value plus an OS that prefers dark.
        localStorage.setItem('theme', 'not-a-real-theme');
        setOSDarkPreference(true);

        const { result } = renderHook(() => useTheme());

        // The corrupt value is ignored in favor of the OS preference (`dark`)...
        expect(result.current.theme).toBe('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        // ...and the corrupt persisted value is rewritten to a valid one.
        expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('rolls back and toasts when committing a theme fails (8.4)', () => {
        const { result } = renderHook(() => useTheme());

        // Sanity: started clean on `light` after a successful mount commit.
        expect(result.current.theme).toBe('light');
        expect(result.current.error).toBe(false);

        // Force persistence to throw for the upcoming apply (and its rollback).
        const setItemSpy = vi
            .spyOn(Storage.prototype, 'setItem')
            .mockImplementation(() => {
                throw new Error('storage is full');
            });

        act(() => {
            result.current.setTheme('dark');
        });

        // The failure surfaces a toast, the active theme rolls back to `light`,
        // the error flag is set, and the DOM is restored to the previous theme.
        expect(toast.error).toHaveBeenCalledTimes(1);
        expect(result.current.theme).toBe('light');
        expect(result.current.error).toBe(true);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);

        setItemSpy.mockRestore();
    });
});
