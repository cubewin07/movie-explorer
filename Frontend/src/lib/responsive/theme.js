// Theme state core for the responsive UI redesign.
//
// Pure, framework-free theme logic. This module exposes:
//   - the canonical list of supported themes (`light` / `dark` / `dracula`),
//   - a pure reducer over the theme state `{ theme, previous, error }`,
//   - the `applyTheme` action creator, and
//   - a `resolveTokens(theme)` helper that returns the theme's design-token
//     values independent of viewport / breakpoint.
//
// No DOM, React, or `localStorage` access lives here. The actual side effects
// (setting `data-theme`, persisting to storage, toasting on failure) are
// performed by the hook that consumes this reducer; that hook reports whether
// the application succeeded so the reducer can stay pure and deterministic.
//
// See Requirements 8.1 (breakpoint-independent tokens), 8.3 (theme preserved
// across breakpoint changes), and 8.4 (failed application rolls back with an
// error indicator), and Properties 12, 13, 14.

/**
 * The three supported themes, in display order.
 * @type {ReadonlyArray<'light' | 'dark' | 'dracula'>}
 */
export const THEMES = ['light', 'dark', 'dracula'];

/** The theme used when no valid theme is available. */
export const DEFAULT_THEME = 'light';

/** Reducer action type for applying (or attempting to apply) a theme. */
export const APPLY_THEME = 'applyTheme';

/** Reducer action type for clearing a previously raised error flag. */
export const CLEAR_THEME_ERROR = 'clearThemeError';

/**
 * Type guard: is `theme` one of the supported theme names?
 * @param {unknown} theme
 * @returns {boolean}
 */
export function isValidTheme(theme) {
    return typeof theme === 'string' && THEMES.includes(theme);
}

/**
 * Build the initial theme state. An invalid/unknown starting theme falls back
 * to `DEFAULT_THEME` so the state always begins in a renderable theme.
 *
 * @param {'light' | 'dark' | 'dracula'} [theme=DEFAULT_THEME]
 * @returns {{ theme: string, previous: string, error: boolean }}
 */
export function initThemeState(theme = DEFAULT_THEME) {
    const valid = isValidTheme(theme) ? theme : DEFAULT_THEME;
    return { theme: valid, previous: valid, error: false };
}

/**
 * Action creator for applying a theme.
 *
 * The consuming hook performs the side effect (DOM + persistence) and reports
 * the outcome via `ok`. When `ok` is `false` the reducer rolls the active theme
 * back to the previously applied theme and raises the error flag.
 *
 * @param {'light' | 'dark' | 'dracula'} theme - The theme to apply.
 * @param {{ ok?: boolean }} [options] - `ok: false` marks the application as failed.
 * @returns {{ type: string, theme: string, ok: boolean }}
 */
export function applyTheme(theme, { ok = true } = {}) {
    return { type: APPLY_THEME, theme, ok };
}

/** Action creator that clears the error flag without changing the theme. */
export function clearThemeError() {
    return { type: CLEAR_THEME_ERROR };
}

/**
 * Pure reducer over the theme state.
 *
 * State shape: `{ theme, previous, error }` where `theme` is the active theme,
 * `previous` is the last successfully applied theme (the rollback target), and
 * `error` indicates the most recent application failed.
 *
 * Transitions:
 * - `applyTheme` (success): the target becomes active and `previous` records
 *   the theme that was active before the change; the error flag clears.
 * - `applyTheme` (failure, or an invalid/unknown target): the active theme is
 *   left unchanged (rolled back to the previously applied theme) and the error
 *   flag is set.
 * - `clearThemeError`: clears the error flag, leaving the theme untouched.
 * - unknown action: returns the state unchanged.
 *
 * The reducer never throws and never mutates its input; it always returns a
 * new state object describing a valid theme.
 *
 * @param {{ theme: string, previous: string, error: boolean }} state
 * @param {{ type: string, theme?: string, ok?: boolean }} action
 * @returns {{ theme: string, previous: string, error: boolean }}
 */
export function themeReducer(state, action) {
    switch (action?.type) {
        case APPLY_THEME: {
            const target = action.theme;

            // An invalid target can never be applied; treat it as a failure and
            // keep the current active theme.
            if (!isValidTheme(target)) {
                return { theme: state.theme, previous: state.theme, error: true };
            }

            // The side effect failed: roll back to the active theme (the last
            // theme known to render) and raise the error flag.
            if (action.ok === false) {
                return { theme: state.theme, previous: state.theme, error: true };
            }

            // Success: the target is now active and the prior active theme is
            // recorded as the rollback target.
            return { theme: target, previous: state.theme, error: false };
        }

        case CLEAR_THEME_ERROR:
            return { ...state, error: false };

        default:
            return state;
    }
}

/**
 * Design tokens for each theme, expressed as space-separated HSL channel
 * triplets (matching the `--token: H S% L%` convention consumed via
 * `hsl(var(--token))` in the Tailwind config). Token values are intrinsic to
 * the theme and do not depend on viewport size, satisfying Requirement 8.1.
 *
 * The `light` and `dark` sets mirror the CSS variables declared in
 * `src/index.css`; `dracula` uses the canonical Dracula palette.
 */
const TOKENS = {
    light: {
        background: '0 0% 100%',
        foreground: '222 47% 11%',
        card: '0 0% 100%',
        cardForeground: '222 47% 11%',
        popover: '0 0% 100%',
        popoverForeground: '222 47% 11%',
        primary: '217 91% 60%',
        primaryForeground: '0 0% 100%',
        secondary: '210 16% 93%',
        secondaryForeground: '222 47% 11%',
        muted: '210 16% 93%',
        mutedForeground: '222 20% 50%',
        accent: '221 83% 53%',
        accentForeground: '0 0% 100%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '0 0% 100%',
        border: '210 16% 85%',
        input: '210 16% 85%',
        ring: '217 91% 60%',
        badgeBg: '210 100% 97%',
        badgeFg: '221 83% 53%',
        indicatorBg: '48 96% 53%',
        indicatorFg: '0 0% 100%',
    },
    dark: {
        background: '222 47% 7%',
        foreground: '210 20% 98%',
        card: '222 47% 10%',
        cardForeground: '210 20% 98%',
        popover: '222 47% 12%',
        popoverForeground: '210 20% 98%',
        primary: '221 83% 53%',
        primaryForeground: '0 0% 100%',
        secondary: '222 47% 15%',
        secondaryForeground: '210 20% 98%',
        muted: '222 47% 18%',
        mutedForeground: '210 20% 70%',
        accent: '265 89% 70%',
        accentForeground: '0 0% 100%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '0 0% 100%',
        border: '222 47% 20%',
        input: '222 47% 20%',
        ring: '221 83% 53%',
        badgeBg: '265 89% 20%',
        badgeFg: '265 89% 70%',
        indicatorBg: '48 96% 53%',
        indicatorFg: '0 0% 100%',
    },
    dracula: {
        background: '231 15% 18%',
        foreground: '60 30% 96%',
        card: '232 14% 31%',
        cardForeground: '60 30% 96%',
        popover: '233 14% 15%',
        popoverForeground: '60 30% 96%',
        primary: '265 89% 78%',
        primaryForeground: '231 15% 18%',
        secondary: '232 14% 31%',
        secondaryForeground: '60 30% 96%',
        muted: '232 14% 31%',
        mutedForeground: '225 27% 51%',
        accent: '326 100% 74%',
        accentForeground: '231 15% 18%',
        destructive: '0 100% 67%',
        destructiveForeground: '60 30% 96%',
        border: '232 14% 31%',
        input: '232 14% 31%',
        ring: '265 89% 78%',
        badgeBg: '232 14% 31%',
        badgeFg: '265 89% 78%',
        indicatorBg: '65 92% 76%',
        indicatorFg: '231 15% 18%',
    },
};

/**
 * Resolve the design-token values for a theme, independent of breakpoint.
 *
 * The returned object is a fresh shallow copy so callers cannot mutate the
 * shared definitions. An invalid/unknown theme falls back to `DEFAULT_THEME`,
 * guaranteeing a usable token set rather than an exception.
 *
 * @param {'light' | 'dark' | 'dracula'} theme
 * @returns {Record<string, string>} A map of token name to HSL channel triplet.
 */
export function resolveTokens(theme) {
    const key = isValidTheme(theme) ? theme : DEFAULT_THEME;
    return { ...TOKENS[key] };
}
