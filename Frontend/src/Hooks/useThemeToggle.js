import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { toast } from 'sonner';
import {
    THEMES,
    DEFAULT_THEME,
    themeReducer,
    applyTheme as applyThemeAction,
    initThemeState,
    isValidTheme,
    resolveTokens,
} from '../lib/responsive/theme.js';

// Full theme support for the responsive UI redesign (Requirements 8.2, 8.4).
//
// This hook adapts the pure theme reducer in `../lib/responsive/theme.js` to
// the browser. The reducer owns the state transitions (which theme is active,
// what to roll back to, and whether the last apply failed); this hook performs
// the side effects the reducer deliberately avoids:
//   - reading/writing the persisted theme in `localStorage['theme']`,
//   - setting the `data-theme` attribute and the `.dark` class on the document
//     element (so Tailwind `dark:` variants keep working for `dark` AND
//     `dracula`), and
//   - surfacing a `sonner` toast when applying a theme fails.
//
// On load, a missing or corrupt persisted value falls back to the OS color
// scheme preference and is rewritten to a valid value.

/** True when the OS prefers a dark color scheme (guards missing matchMedia). */
function prefersDarkOS() {
    return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );
}

/**
 * Read the starting theme: a valid persisted value wins; a missing or corrupt
 * value falls back to the OS preference (Requirement 8.4 / persisted-corruption
 * handling). Never throws even if `localStorage` is unavailable.
 *
 * @returns {'light' | 'dark' | 'dracula'}
 */
function readPersistedTheme() {
    try {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('theme');
            if (isValidTheme(stored)) {
                return stored;
            }
        }
    } catch {
        // localStorage access can throw (private mode); fall through to OS pref.
    }
    return prefersDarkOS() ? 'dark' : DEFAULT_THEME;
}

/**
 * Apply a theme to the document and persist it. The DOM is updated before
 * persistence so that, if storage throws, the visual state still reflects the
 * attempted (or, during rollback, the restored) theme. Throws if any step
 * fails so the caller can roll back and flag the error.
 *
 * @param {'light' | 'dark' | 'dracula'} theme
 */
function commitTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    // `.dark` drives Tailwind's `dark:` variant; both `dark` and `dracula`
    // are dark themes, only `light` clears it.
    if (theme === 'light') {
        html.classList.remove('dark');
    } else {
        html.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
}

/**
 * Full theme hook supporting `light` / `dark` / `dracula`.
 *
 * @returns {{
 *   theme: 'light' | 'dark' | 'dracula',
 *   setTheme: (next: string) => void,
 *   themes: ReadonlyArray<'light' | 'dark' | 'dracula'>,
 *   tokens: Record<string, string>,
 *   error: boolean,
 * }}
 */
export function useTheme() {
    const [state, dispatch] = useReducer(themeReducer, undefined, () =>
        initThemeState(readPersistedTheme())
    );

    // Apply the resolved initial theme once on mount. This also rewrites a
    // missing/corrupt persisted value to a valid one.
    useEffect(() => {
        try {
            commitTheme(state.theme);
        } catch {
            toast.error('Unable to apply the saved theme.');
            dispatch(applyThemeAction(state.theme, { ok: false }));
        }
        // Intentionally run only on mount with the initially resolved theme.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setTheme = useCallback(
        (nextTheme) => {
            // Reject unknown themes up front: nothing is committed and the
            // reducer records the failure so the active theme is preserved.
            if (!isValidTheme(nextTheme)) {
                toast.error('Unknown theme selected.');
                dispatch(applyThemeAction(nextTheme, { ok: false }));
                return;
            }

            let ok = true;
            try {
                commitTheme(nextTheme);
            } catch {
                ok = false;
                // Best-effort restore of the DOM to the currently active theme
                // so no partial theme state is left applied (Requirement 8.4).
                try {
                    commitTheme(state.theme);
                } catch {
                    // A secondary failure during rollback is non-fatal; the
                    // reducer still preserves the previous theme in state.
                }
                toast.error('Failed to apply theme. Reverted to the previous theme.');
            }

            dispatch(applyThemeAction(nextTheme, { ok }));
        },
        [state.theme]
    );

    const tokens = useMemo(() => resolveTokens(state.theme), [state.theme]);

    return {
        theme: state.theme,
        setTheme,
        themes: THEMES,
        tokens,
        error: state.error,
    };
}

/**
 * Backward-compatible boolean toggle used by existing consumers
 * (`Settings`, `LeftSidebarContent`, `Layout`, `NotificationBell`).
 *
 * Maps the full theme state onto the original `[isDark, setIsDark]` tuple:
 * any non-`light` theme reads as dark, and toggling switches between `light`
 * and `dark`.
 *
 * @returns {[boolean, (value: boolean | ((prev: boolean) => boolean)) => void]}
 */
export function useThemeToggle() {
    const { theme, setTheme } = useTheme();
    const isDark = theme !== 'light';

    const setIsDark = useCallback(
        (value) => {
            const next = typeof value === 'function' ? value(isDark) : value;
            setTheme(next ? 'dark' : 'light');
        },
        [isDark, setTheme]
    );

    return [isDark, setIsDark];
}

export default useThemeToggle;
