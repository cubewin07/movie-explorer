# Implementation Plan: Responsive UI Redesign

## Overview

This plan builds the feature from the inside out. It starts by establishing the test tooling, then implements the pure **responsive core** (`src/lib/responsive/*`) module by module with its property-based tests, then the theme reducer, then the React hooks that adapt the core to the browser, then the motion provider, and finally wires the layout, navigation, cards, dialog, and grid to consume the core. Integration and accessibility tests close out the wiring. Each step builds on the previous one so that by the time components are touched, the decision logic they depend on is already implemented and verified.

All paths are relative to the `Frontend/` project root. The implementation language is JavaScript (React 19 + Vite), matching the existing codebase.

## Tasks

- [x] 1. Set up test tooling and responsive core directory
  - [x] 1.1 Install and configure the test runner and PBT/a11y libraries
    - Add dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `fast-check`, `jest-axe`
    - Configure Vitest in `vite.config.js` (or `vitest.config.js`) with `environment: 'jsdom'`, `globals: true`, and a `setupTests.js` that registers `@testing-library/jest-dom` and `jest-axe` matchers
    - Add `test` and `test:run` scripts to `package.json` (use `vitest run` for single-run execution)
    - Create the `src/lib/responsive/` directory placeholder
    - _Requirements: supports testing strategy for all requirements_

- [ ] 2. Implement breakpoint resolution and layout mapping
  - [ ] 2.1 Implement `breakpoints.js` core
    - Create `src/lib/responsive/breakpoints.js` exporting `BREAKPOINTS = { mobile: 0, tablet: 768, desktop: 1024 }`, `resolveBreakpoint(width)`, and `breakpointQuery(name)`
    - `resolveBreakpoint` maps `<768 → 'mobile'`, `768–1023 → 'tablet'`, `>=1024 → 'desktop'`; treat negative/`NaN` widths as `'mobile'`
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 2.2 Implement layout selection mapping
    - In `breakpoints.js` (or a co-located `layoutMap.js`), add `resolveLayout(width)` returning `{ columns, navMode, rightSidebarVisible }` where columns is 1 at mobile, at most 2 at tablet, multi-column at desktop; navMode is `'overlay'` for sub-desktop and `'sidebar'` at desktop; right sidebar visible only at desktop
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.4, 2.5_

  - [ ] 2.3 Write property test for breakpoint resolution
    - **Property 1: Breakpoint resolution partitions viewport widths**
    - **Validates: Requirements 1.1, 1.2, 1.3**
    - Use `fast-check` with `fc.nat({ max: 4000 })`, boundary-seed 767/768/1023/1024, `{ numRuns: 100 }`; tag with `// Feature: responsive-ui-redesign, Property 1: ...`

  - [ ] 2.4 Write property test for layout/navigation/right-sidebar selection
    - **Property 2: Layout, navigation, and right-sidebar selection follow the breakpoint**
    - **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.4, 2.5**
    - `fast-check` widths (boundary-seeded), `{ numRuns: 100 }`, tagged comment

- [ ] 3. Implement typography scaling core
  - [ ] 3.1 Implement `typography.js`
    - Create `src/lib/responsive/typography.js` with `BODY_MIN`, `BODY_MAX`, `HEADING_MIN_RATIO`, `HEADING_MAX_RATIO`, `clampBodySize(px, breakpoint)`, and `scaleHeading(bodyPx, ratio)`
    - `clampBodySize` returns `>= 16` at mobile and `[16, 20]` at tablet/desktop; `scaleHeading` clamps result into `[1.25x, 2.5x]` of body size
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 3.2 Write property test for body text clamping
    - **Property 4: Body text size stays within the legal band per breakpoint**
    - **Validates: Requirements 4.1, 4.2**
    - `fast-check` body sizes via `fc.integer({ min: 8, max: 40 })` × breakpoint, `{ numRuns: 100 }`, tagged comment

  - [ ] 3.3 Write property test for heading scaling
    - **Property 5: Heading size scales within the allowed ratio of body size**
    - **Validates: Requirements 4.3**
    - `fast-check` body size × ratio, `{ numRuns: 100 }`, tagged comment

- [ ] 4. Implement touch-target normalization core
  - [ ] 4.1 Implement `touchTarget.js`
    - Create `src/lib/responsive/touchTarget.js` with `MIN_TOUCH_PX = 44`, `MIN_GAP_PX = 8`, and `normalizeTouchTarget({ width, height })`
    - Floor negative sizes to 0; return `minWidth/minHeight >= 44` and symmetric `padX/padY` that compensate without shrinking the visible content box
    - _Requirements: 2.7, 3.1, 3.4_

  - [ ] 4.2 Write property test for touch-target normalization
    - **Property 3: Touch targets meet the minimum activatable area without shrinking content**
    - **Validates: Requirements 2.7, 3.1, 3.4**
    - `fast-check` element sizes via `fc.record({ width: fc.nat(), height: fc.nat() })`, `{ numRuns: 100 }`, tagged comment

- [ ] 5. Implement media aspect-ratio helper
  - [ ] 5.1 Implement aspect-ratio helper
    - Create `src/lib/responsive/media.js` with `fitWidth({ srcWidth, srcHeight }, containerWidth)` returning a display height that fills the container width and preserves source aspect ratio
    - _Requirements: 4.4_

  - [ ] 5.2 Write property test for aspect-ratio preservation
    - **Property 6: Media display preserves source aspect ratio**
    - **Validates: Requirements 4.4**
    - `fast-check` source dims × container width, assert ratio within ±1%, `{ numRuns: 100 }`, tagged comment

- [ ] 6. Implement motion core
  - [ ] 6.1 Implement `motion.js` constants, variants, and `staggerDelay`
    - Create `src/lib/responsive/motion.js` with `MOTION` budgets, named variant definitions (page enter, item enter, modal enter/exit, card hover, mobileNav), and `staggerDelay(index, perItemMs = 60)` clamped to `[50,150]` ms and returned in seconds
    - _Requirements: 6.2_

  - [ ] 6.2 Implement `resolveVariants` with reduced-motion handling
    - Add `resolveVariants(name, { reducedMotion, essential = false })`: enforce duration budgets (<=600ms; <=300ms for hover/card), correct terminal opacity states; under `reducedMotion` for non-essential variants return final state with `duration: 0` and no x/y displacement; for essential variants cap positional displacement at 5px; unknown names return a no-op final-state variant
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7, 2.9, 7.1, 7.3_

  - [ ] 6.3 Write property test for stagger delay bounds
    - **Property 7: List entrance stagger delay stays within bounds**
    - **Validates: Requirements 6.2**
    - `fast-check` indices via `fc.nat({ max: 200 })`, `{ numRuns: 100 }`, tagged comment

  - [ ] 6.4 Write property test for animation duration budgets and terminal states
    - **Property 8: Animation durations stay within their budgets and terminate in the correct visual state**
    - **Validates: Requirements 6.1, 6.3, 6.4, 6.5, 6.6**
    - `fast-check` variant name via `fc.constantFrom(...variantNames)`, `{ numRuns: 100 }`, tagged comment

  - [ ] 6.5 Write property test for card hover round trip
    - **Property 9: Card hover transition returns to its resting state**
    - **Validates: Requirements 6.5**
    - `fast-check` hover variant resolution, assert post-hover state equals initial, `{ numRuns: 100 }`, tagged comment

  - [ ] 6.6 Write property test for reduced-motion final state
    - **Property 10: Reduced motion yields the final state with no transition or displacement**
    - **Validates: Requirements 2.9, 6.7, 7.1**
    - `fast-check` non-essential variant × `reducedMotion = true`, `{ numRuns: 100 }`, tagged comment

  - [ ] 6.7 Write property test for essential reduced-motion displacement cap
    - **Property 11: Essential animations under reduced motion limit positional displacement**
    - **Validates: Requirements 7.3**
    - `fast-check` essential variant × `reducedMotion = true`, assert displacement <= 5px on any axis, `{ numRuns: 100 }`, tagged comment

- [ ] 7. Implement theme reducer and token resolver
  - [ ] 7.1 Implement theme state reducer
    - Create `src/lib/responsive/theme.js` with a pure reducer over `{ theme, previous }` for `light`/`dark`/`dracula`, an `applyTheme` action that rolls back to `previous` and sets an error flag on failure, and a `resolveTokens(theme)` helper that returns token values independent of breakpoint
    - _Requirements: 8.1, 8.3, 8.4_

  - [ ] 7.2 Write property test for breakpoint-independent token resolution
    - **Property 12: Theme token resolution is independent of breakpoint**
    - **Validates: Requirements 8.1**
    - `fast-check` theme × two breakpoints, assert identical tokens, `{ numRuns: 100 }`, tagged comment

  - [ ] 7.3 Write property test for theme preservation across breakpoint changes
    - **Property 13: Breakpoint changes preserve the active theme**
    - **Validates: Requirements 8.3**
    - `fast-check` theme × breakpoint-change sequence, `{ numRuns: 100 }`, tagged comment

  - [ ] 7.4 Write property test for failed theme rollback
    - **Property 14: Failed theme application rolls back to the previous theme**
    - **Validates: Requirements 8.4**
    - `fast-check` previous theme × attempted theme with forced failure, assert active equals previous and error flag set, `{ numRuns: 100 }`, tagged comment

- [ ] 8. Checkpoint - responsive core complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement responsive hooks
  - [ ] 9.1 Implement `useBreakpoint`
    - Create `src/hooks/useBreakpoint.js` using `window.matchMedia(breakpointQuery(...))` with change listeners, delegating to `resolveBreakpoint`; return `{ breakpoint, isMobile, isTablet, isDesktop }`; guard `typeof window`/`matchMedia` and default to `desktop`
    - _Requirements: 1.4, 1.1, 1.2, 1.3_

  - [ ] 9.2 Write unit tests for `useBreakpoint`
    - Simulate `matchMedia` change events and assert state updates; assert SSR-safe `desktop` default
    - _Requirements: 1.4_

  - [ ] 9.3 Implement `useReducedMotion`
    - Create `src/hooks/useReducedMotion.js` tracking `prefers-reduced-motion: reduce` live; guard missing `matchMedia` and default to `false`
    - _Requirements: 7.1, 7.4_

  - [ ] 9.4 Write unit tests for `useReducedMotion`
    - Assert live updates on media query change and safe default
    - _Requirements: 7.4_

  - [ ] 9.5 Extend `useThemeToggle` to full theme support
    - Update `src/hooks/useThemeToggle.js` (export `useTheme`) to support `['light','dark','dracula']`, persist to `localStorage['theme']`, set `data-theme` and `.dark` class, fall back to OS preference on corrupt persisted value, and surface a `sonner` toast on apply failure (delegating state to the theme reducer)
    - _Requirements: 8.2, 8.4_

  - [ ] 9.6 Write unit tests for `useTheme`
    - Assert `data-theme` update and token re-render on change (8.2); assert corrupt-value fallback and rollback-with-toast on failure
    - _Requirements: 8.2, 8.4_

- [ ] 10. Implement motion provider
  - [ ] 10.1 Implement `MotionConfigProvider` and `useAppMotion`
    - Create `src/context/MotionConfigProvider.jsx` wrapping framer-motion's `MotionConfig` with `reducedMotion="user"`, reading `useReducedMotion`, and exposing `useAppMotion()` with `resolveVariants(name, opts)` and `staggerDelay(index)` from the responsive core
    - _Requirements: 6.7, 7.1, 7.4_

  - [ ] 10.2 Write unit tests for the motion provider
    - Assert `useAppMotion` returns final-state variants when reduced motion is active and bounded variants otherwise
    - _Requirements: 6.7, 7.1_

- [ ] 11. Checkpoint - hooks and motion provider complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Wire layout and navigation to the responsive system
  - [ ] 12.1 Update `Layout.jsx`
    - Wrap the content tree in `MotionConfigProvider`; replace header `bg-slate-950/80 text-white` with token classes (`bg-card/80 text-foreground border-border`); change right `<aside>` from `hidden md:block` to `hidden lg:block`; keep header `sticky top-0 z-50`
    - _Requirements: 8.1, 2.5, 1.3, 2.6_

  - [ ] 12.2 Update `Sidebar.jsx`
    - Switch `MobileSidebar`/`DesktopSidebar` breakpoint from `md` to `lg`; wrap the `Menu`/`X` toggle to a >=44×44 hit area via `normalizeTouchTarget`; drive overlay open/close through `resolveVariants('mobileNav', ...)`; add `aria-label`, `aria-expanded`, `aria-controls`, labeled overlay landmark, keyboard-operable links
    - _Requirements: 2.1, 2.4, 2.7, 3.1, 2.9, 5.1, 5.3_

  - [ ] 12.3 Write component tests for navigation
    - Toggle opens/closes the mobile overlay (2.2, 2.8); selecting a link navigates (2.3); header stays sticky after scroll (2.6)
    - _Requirements: 2.2, 2.3, 2.6, 2.8_

- [ ] 13. Wire content components to the responsive system
  - [ ] 13.1 Update `MovieCard.jsx`
    - Replace hardcoded slate/blue palette with theme tokens (keep decorative accent gradients); route hover/entrance animation through `useAppMotion`; ensure poster `<img>` keeps `object-cover`/aspect ratio and always has non-empty `alt`
    - _Requirements: 8.1, 6.2, 6.5, 6.7, 4.4, 5.4_

  - [ ] 13.2 Update `dialog.jsx`
    - Ensure open/close durations <=600ms and reduced-motion users get instant show/hide via the motion system or `motion-reduce:` utilities
    - _Requirements: 6.3, 6.4, 6.7_

  - [ ] 13.3 Implement `MovieGrid` wrapper
    - Create a reusable `src/components/ui/MovieGrid.jsx` applying per-breakpoint column counts (`grid-cols-1` / `sm:grid-cols-2` / `lg:grid-cols-3+`) and `staggerDelay` item entrance; adopt it in Home/Discovery/Watchlist grids
    - _Requirements: 1.1, 1.2, 1.3, 6.2_

  - [ ] 13.4 Write component tests for content components
    - Long text applies `line-clamp-3` with ellipsis (4.5); poster renders with non-empty `alt` (5.4); interactive elements show active/hover feedback (3.3); mobile lists keep gap >= 8px (3.2)
    - _Requirements: 3.2, 3.3, 4.5, 5.4_

- [ ] 14. Integration and accessibility verification
  - [ ] 14.1 Write responsive layout integration tests
    - Render each Primary_Page at 375/768/1024/1440 and assert no horizontal overflow (`scrollWidth <= clientWidth`) and no clipping; simulate `matchMedia` change and assert layout updates
    - _Requirements: 1.4, 1.5, 1.6, 1.7_

  - [ ] 14.2 Write accessibility audit tests
    - `jest-axe` audits for accessible names, focus order, and no focus traps; per-theme contrast checks over tokens for normal and large text
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7_

  - [ ] 14.3 Write reduced-motion integration tests
    - With `prefers-reduced-motion: reduce`, assert controls are immediately present and operable (7.2) and that toggling the preference mid-animation snaps to final state (7.4)
    - _Requirements: 7.2, 7.4_

- [ ] 15. Final checkpoint - full suite green
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; core implementation tasks are never optional.
- Property-based tests use `fast-check` exclusively, run with `{ numRuns: 100 }`, and are tagged `// Feature: responsive-ui-redesign, Property {n}: {text}` per the design.
- Each property maps to exactly one property-based test and is placed next to the module it validates so errors surface early.
- Layout, contrast, keyboard, and accessibility concerns are validated by example/integration/a11y tests rather than PBT, matching the design's testing strategy.
- Each task references specific requirements (and properties, where applicable) for traceability.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "5.1", "6.1", "7.1"] },
    { "id": 2, "tasks": ["2.2", "6.2", "3.2", "3.3", "4.2", "5.2", "6.3", "7.2", "7.3", "7.4"] },
    { "id": 3, "tasks": ["2.3", "2.4", "6.4", "6.5", "6.6", "6.7", "9.1", "9.3", "9.5"] },
    { "id": 4, "tasks": ["9.2", "9.4", "9.6", "10.1"] },
    { "id": 5, "tasks": ["10.2", "12.1", "12.2", "13.1", "13.2", "13.3"] },
    { "id": 6, "tasks": ["12.3", "13.4", "14.1", "14.2", "14.3"] }
  ]
}
```
