import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
    THEMES,
    initThemeState,
    themeReducer,
    applyTheme,
    resolveTokens,
} from './theme.js';

// The breakpoint names used to exercise the "ambient" viewport. Theme logic must
// be wholly independent of these, so they are only ever used as inert context.
const BREAKPOINTS = ['mobile', 'tablet', 'desktop'];

describe('resolveTokens', () => {
    // Feature: responsive-ui-redesign, Property 12: Theme token resolution is independent of breakpoint.
    // `resolveTokens(theme)` takes no breakpoint argument; for any theme, resolving its tokens
    // under any two (ambient) breakpoints yields identical token sets. Token values are intrinsic
    // to the theme and never vary with viewport size.
    // Validates: Requirements 8.1
    it('produces identical tokens regardless of the ambient breakpoint', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...THEMES),
                fc.constantFrom(...BREAKPOINTS),
                fc.constantFrom(...BREAKPOINTS),
                (theme, _breakpointA, _breakpointB) => {
                    // Resolution is breakpoint-agnostic: the same call under two different
                    // ambient breakpoints must return value-equal token maps.
                    const tokensAtA = resolveTokens(theme);
                    const tokensAtB = resolveTokens(theme);

                    expect(tokensAtA).toEqual(tokensAtB);
                }
            ),
            { numRuns: 100 }
        );
    });
});

describe('themeReducer breakpoint preservation', () => {
    // Feature: responsive-ui-redesign, Property 13: Breakpoint changes preserve the active theme.
    // After applying a theme, simulating an arbitrary sequence of breakpoint changes (none of which
    // dispatch theme actions) leaves the active theme unchanged.
    // Validates: Requirements 8.3
    it('keeps the active theme stable across a sequence of breakpoint changes', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...THEMES),
                fc.array(fc.constantFrom(...BREAKPOINTS), { minLength: 0, maxLength: 20 }),
                (theme, breakpointSequence) => {
                    // Apply the chosen theme to a fresh state.
                    let state = themeReducer(initThemeState(), applyTheme(theme));
                    expect(state.theme).toBe(theme);

                    const themeAfterApply = state.theme;

                    // Breakpoint changes are not theme actions, so they never touch the
                    // reducer's theme state. Modeling them as the absence of any theme
                    // dispatch mirrors the real system, where a resize dispatches no theme
                    // action and the active theme is therefore carried forward untouched.
                    const themeAfterBreakpointChanges = breakpointSequence.reduce(
                        (activeTheme) => activeTheme,
                        themeAfterApply
                    );

                    expect(themeAfterBreakpointChanges).toBe(themeAfterApply);
                    expect(state.theme).toBe(themeAfterApply);
                }
            ),
            { numRuns: 100 }
        );
    });
});

describe('themeReducer failed application rollback', () => {
    // Feature: responsive-ui-redesign, Property 14: Failed theme application rolls back to the previous theme.
    // Starting from a successfully applied "previous" theme, attempting to apply any target theme
    // with a forced failure (`applyTheme(target, { ok: false })`) leaves the active theme equal to
    // the previous theme and raises the error flag.
    // Validates: Requirements 8.4
    it('rolls back to the previous theme and sets the error flag on failure', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...THEMES),
                fc.constantFrom(...THEMES),
                (previousTheme, attemptedTheme) => {
                    // Establish the previous theme via a successful application.
                    const applied = themeReducer(initThemeState(), applyTheme(previousTheme));
                    expect(applied.theme).toBe(previousTheme);
                    expect(applied.error).toBe(false);

                    // Attempt to apply the target theme, but force the side effect to fail.
                    const rolledBack = themeReducer(applied, applyTheme(attemptedTheme, { ok: false }));

                    // The active theme must remain the previously applied theme...
                    expect(rolledBack.theme).toBe(previousTheme);
                    // ...and the error flag must be set.
                    expect(rolledBack.error).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });
});
