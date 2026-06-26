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

- [x] 2. Implement breakpoint resolution and layout mapping
  - [x] 2.1 Implement `breakpoints.js` core
    - Create `src/lib/responsive/breakpoints.js` exporting `BREAKPOINTS = { mobile: 0, tablet: 768, desktop: 1024 }`, `resolveBreakpoint(width)`, and `breakpointQuery(name)`
    - `resolveBreakpoint` maps `<768 → 'mobile'`, `768–1023 → 'tablet'`, `>=1024 → 'desktop'`; treat negative/`NaN` widths as `'mobile'`
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Implement layout selection mapping
    - In `breakpoints.js` (or a co-located `layoutMap.js`), add `resolveLayout(width)` returning `{ columns, navMode, rightSidebarVisible }` where columns is 1 at mobile, at most 2 at tablet, multi-column at desktop; navMode is `'overlay'` for sub-desktop and `'sidebar'` at desktop; right sidebar visible only at desktop
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.4, 2.5_

  - [x] 2.3 Write property test for breakpoint resolution
    - **Property 1: Breakpoint resolution partitions viewport widths**
    - **Validates: Requirements 1.1, 1.2, 1.3**
    - Use `fast-check` with `fc.nat({ max: 4000 })`, boundary-seed 767/768/1023/1024, `{ numRuns: 100 }`; tag with `// Feature: responsive-ui-redesign, Property 1: ...`

  - [x] 2.4 Write property test for layout/navigation/right-sidebar selection
    - **Property 2: Layout, navigation, and right-sidebar selection follow the breakpoint**
    - **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.4, 2.5**
    - `fast-check` widths (boundary-seeded), `{ numRuns: 100 }`, tagged comment

- [x] 3. Implement typography scaling core
  - [x] 3.1 Implement `typography.js`
    - Create `src/lib/responsive/typography.js` with `BODY_MIN`, `BODY_MAX`, `HEADING_MIN_RATIO`, `HEADING_MAX_RATIO`, `clampBodySize(px, breakpoint)`, and `scaleHeading(bodyPx, ratio)`
    - `clampBodySize` returns `>= 16` at mobile and `[16, 20]` at tablet/desktop; `scaleHeading` clamps result into `[1.25x, 2.5x]` of body size
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 3.2 Write property test for body text clamping
    - **Property 4: Body text size stays within the legal band per breakpoint**
    - **Validates: Requirements 4.1, 4.2**
    - `fast-check` body sizes via `fc.integer({ min: 8, max: 40 })` × breakpoint, `{ numRuns: 100 }`, tagged comment

  - [x] 3.3 Write property test for heading scaling
    - **Property 5: Heading size scales within the allowed ratio of body size**
    - **Validates: Requirements 4.3**
    - `fast-check` body size × ratio, `{ numRuns: 100 }`, tagged comment

- [x] 4. Implement touch-target normalization core
  - [x] 4.1 Implement `touchTarget.js`
    - Create `src/lib/responsive/touchTarget.js` with `MIN_TOUCH_PX = 44`, `MIN_GAP_PX = 8`, and `normalizeTouchTarget({ width, height })`
    - Floor negative sizes to 0; return `minWidth/minHeight >= 44` and symmetric `padX/padY` that compensate without shrinking the visible content box
    - _Requirements: 2.7, 3.1, 3.4_

  - [x] 4.2 Write property test for touch-target normalization
    - **Property 3: Touch targets meet the minimum activatable area without shrinking content**
    - **Validates: Requirements 2.7, 3.1, 3.4**
    - `fast-check` element sizes via `fc.record({ width: fc.nat(), height: fc.nat() })`, `{ numRuns: 100 }`, tagged comment

- [x] 5. Implement media aspect-ratio helper
  - [x] 5.1 Implement aspect-ratio helper
    - Create `src/lib/responsive/media.js` with `fitWidth({ srcWidth, srcHeight }, containerWidth)` returning a display height that fills the container width and preserves source aspect ratio
    - _Requirements: 4.4_

  - [x] 5.2 Write property test for aspect-ratio preservation
    - **Property 6: Media display preserves source aspect ratio**
    - **Validates: Requirements 4.4**
    - `fast-check` source dims × container width, assert ratio within ±1%, `{ numRuns: 100 }`, tagged comment

- [x] 6. Implement motion core
  - [x] 6.1 Implement `motion.js` constants, variants, and `staggerDelay`
    - Create `src/lib/responsive/motion.js` with `MOTION` budgets, named variant definitions (page enter, item enter, modal enter/exit, card hover, mobileNav), and `staggerDelay(index, perItemMs = 60)` clamped to `[50,150]` ms and returned in seconds
    - _Requirements: 6.2_

  - [x] 6.2 Implement `resolveVariants` with reduced-motion handling
    - Add `resolveVariants(name, { reducedMotion, essential = false })`: enforce duration budgets (<=600ms; <=300ms for hover/card), correct terminal opacity states; under `reducedMotion` for non-essential variants return final state with `duration: 0` and no x/y displacement; for essential variants cap positional displacement at 5px; unknown names return a no-op final-state variant
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7, 2.9, 7.1, 7.3_

  - [x] 6.3 Write property test for stagger delay bounds
    - **Property 7: List entrance stagger delay stays within bounds**
    - **Validates: Requirements 6.2**
    - `fast-check` indices via `fc.nat({ max: 200 })`, `{ numRuns: 100 }`, tagged comment

  - [x] 6.4 Write property test for animation duration budgets and terminal states
    - **Property 8: Animation durations stay within their budgets and terminate in the correct visual state**
    - **Validates: Requirements 6.1, 6.3, 6.4, 6.5, 6.6**
    - `fast-check` variant name via `fc.constantFrom(...variantNames)`, `{ numRuns: 100 }`, tagged comment

  - [x] 6.5 Write property test for card hover round trip
    - **Property 9: Card hover transition returns to its resting state**
    - **Validates: Requirements 6.5**
    - `fast-check` hover variant resolution, assert post-hover state equals initial, `{ numRuns: 100 }`, tagged comment

  - [x] 6.6 Write property test for reduced-motion final state
    - **Property 10: Reduced motion yields the final state with no transition or displacement**
    - **Validates: Requirements 2.9, 6.7, 7.1**
    - `fast-check` non-essential variant × `reducedMotion = true`, `{ numRuns: 100 }`, tagged comment

  - [x] 6.7 Write property test for essential reduced-motion displacement cap
    - **Property 11: Essential animations under reduced motion limit positional displacement**
    - **Validates: Requirements 7.3**
    - `fast-check` essential variant × `reducedMotion = true`, assert displacement <= 5px on any axis, `{ numRuns: 100 }`, tagged comment

- [x] 7. Implement theme reducer and token resolver
  - [x] 7.1 Implement theme state reducer
    - Create `src/lib/responsive/theme.js` with a pure reducer over `{ theme, previous }` for `light`/`dark`/`dracula`, an `applyTheme` action that rolls back to `previous` and sets an error flag on failure, and a `resolveTokens(theme)` helper that returns token values independent of breakpoint
    - _Requirements: 8.1, 8.3, 8.4_

  - [x] 7.2 Write property test for breakpoint-independent token resolution
    - **Property 12: Theme token resolution is independent of breakpoint**
    - **Validates: Requirements 8.1**
    - `fast-check` theme × two breakpoints, assert identical tokens, `{ numRuns: 100 }`, tagged comment

  - [x] 7.3 Write property test for theme preservation across breakpoint changes
    - **Property 13: Breakpoint changes preserve the active theme**
    - **Validates: Requirements 8.3**
    - `fast-check` theme × breakpoint-change sequence, `{ numRuns: 100 }`, tagged comment

  - [x] 7.4 Write property test for failed theme rollback
    - **Property 14: Failed theme application rolls back to the previous theme**
    - **Validates: Requirements 8.4**
    - `fast-check` previous theme × attempted theme with forced failure, assert active equals previous and error flag set, `{ numRuns: 100 }`, tagged comment

- [x] 8. Checkpoint - responsive core complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement responsive hooks
  - [x] 9.1 Implement `useBreakpoint`
    - Create `src/hooks/useBreakpoint.js` using `window.matchMedia(breakpointQuery(...))` with change listeners, delegating to `resolveBreakpoint`; return `{ breakpoint, isMobile, isTablet, isDesktop }`; guard `typeof window`/`matchMedia` and default to `desktop`
    - _Requirements: 1.4, 1.1, 1.2, 1.3_

  - [x] 9.2 Write unit tests for `useBreakpoint`
    - Simulate `matchMedia` change events and assert state updates; assert SSR-safe `desktop` default
    - _Requirements: 1.4_

  - [x] 9.3 Implement `useReducedMotion`
    - Create `src/hooks/useReducedMotion.js` tracking `prefers-reduced-motion: reduce` live; guard missing `matchMedia` and default to `false`
    - _Requirements: 7.1, 7.4_

  - [x] 9.4 Write unit tests for `useReducedMotion`
    - Assert live updates on media query change and safe default
    - _Requirements: 7.4_

  - [x] 9.5 Extend `useThemeToggle` to full theme support
    - Update `src/hooks/useThemeToggle.js` (export `useTheme`) to support `['light','dark','dracula']`, persist to `localStorage['theme']`, set `data-theme` and `.dark` class, fall back to OS preference on corrupt persisted value, and surface a `sonner` toast on apply failure (delegating state to the theme reducer)
    - _Requirements: 8.2, 8.4_

  - [x] 9.6 Write unit tests for `useTheme`
    - Assert `data-theme` update and token re-render on change (8.2); assert corrupt-value fallback and rollback-with-toast on failure
    - _Requirements: 8.2, 8.4_

- [x] 10. Implement motion provider
  - [x] 10.1 Implement `MotionConfigProvider` and `useAppMotion`
    - Create `src/context/MotionConfigProvider.jsx` wrapping framer-motion's `MotionConfig` with `reducedMotion="user"`, reading `useReducedMotion`, and exposing `useAppMotion()` with `resolveVariants(name, opts)` and `staggerDelay(index)` from the responsive core
    - _Requirements: 6.7, 7.1, 7.4_

  - [x] 10.2 Write unit tests for the motion provider
    - Assert `useAppMotion` returns final-state variants when reduced motion is active and bounded variants otherwise
    - _Requirements: 6.7, 7.1_

- [x] 11. Checkpoint - hooks and motion provider complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Wire layout and navigation to the responsive system
  - [x] 12.1 Update `Layout.jsx`
    - Wrap the content tree in `MotionConfigProvider`; replace header `bg-slate-950/80 text-white` with token classes (`bg-card/80 text-foreground border-border`); change right `<aside>` from `hidden md:block` to `hidden lg:block`; keep header `sticky top-0 z-50`
    - _Requirements: 8.1, 2.5, 1.3, 2.6_

  - [x] 12.2 Update `Sidebar.jsx`
    - Switch `MobileSidebar`/`DesktopSidebar` breakpoint from `md` to `lg`; wrap the `Menu`/`X` toggle to a >=44×44 hit area via `normalizeTouchTarget`; drive overlay open/close through `resolveVariants('mobileNav', ...)`; add `aria-label`, `aria-expanded`, `aria-controls`, labeled overlay landmark, keyboard-operable links
    - _Requirements: 2.1, 2.4, 2.7, 3.1, 2.9, 5.1, 5.3_

  - [x] 12.3 Write component tests for navigation
    - Toggle opens/closes the mobile overlay (2.2, 2.8); selecting a link navigates (2.3); header stays sticky after scroll (2.6)
    - _Requirements: 2.2, 2.3, 2.6, 2.8_

- [x] 13. Wire content components to the responsive system
  - [x] 13.1 Update `MovieCard.jsx`
    - Replace hardcoded slate/blue palette with theme tokens (keep decorative accent gradients); route hover/entrance animation through `useAppMotion`; ensure poster `<img>` keeps `object-cover`/aspect ratio and always has non-empty `alt`
    - _Requirements: 8.1, 6.2, 6.5, 6.7, 4.4, 5.4_

  - [x] 13.2 Update `dialog.jsx`
    - Ensure open/close durations <=600ms and reduced-motion users get instant show/hide via the motion system or `motion-reduce:` utilities
    - _Requirements: 6.3, 6.4, 6.7_

  - [x] 13.3 Implement `MovieGrid` wrapper
    - Create a reusable `src/components/ui/MovieGrid.jsx` applying per-breakpoint column counts (`grid-cols-1` / `sm:grid-cols-2` / `lg:grid-cols-3+`) and `staggerDelay` item entrance; adopt it in Home/Discovery/Watchlist grids
    - _Requirements: 1.1, 1.2, 1.3, 6.2_

  - [x] 13.4 Write component tests for content components
    - Long text applies `line-clamp-3` with ellipsis (4.5); poster renders with non-empty `alt` (5.4); interactive elements show active/hover feedback (3.3); mobile lists keep gap >= 8px (3.2)
    - _Requirements: 3.2, 3.3, 4.5, 5.4_

- [x] 14. Integration and accessibility verification
  - [x] 14.1 Write responsive layout integration tests
    - Render each Primary_Page at 375/768/1024/1440 and assert no horizontal overflow (`scrollWidth <= clientWidth`) and no clipping; simulate `matchMedia` change and assert layout updates
    - _Requirements: 1.4, 1.5, 1.6, 1.7_

  - [x] 14.2 Write accessibility audit tests
    - `jest-axe` audits for accessible names, focus order, and no focus traps; per-theme contrast checks over tokens for normal and large text
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7_

  - [x] 14.3 Write reduced-motion integration tests
    - With `prefers-reduced-motion: reduce`, assert controls are immediately present and operable (7.2) and that toggling the preference mid-animation snaps to final state (7.4)
    - _Requirements: 7.2, 7.4_

- [x] 15. Final checkpoint - full suite green
  - Ensure all tests pass, ask the user if questions arise.

## Second Wave: Motion-System Migration (Requirements 9–20)

This phase migrates the remaining heavily-animated components onto the existing responsive/motion foundation built in tasks 1–15. It follows the same inside-out order: new pure helper modules and their property tests first, then the component migrations that consume them, then integration/accessibility verification. All paths remain relative to the `Frontend/` project root; the implementation language is JavaScript (React 19 + Vite).

- [ ] 16. Implement carousel auto-advance state machine (`carousel.js`)
  - [ ] 16.1 Implement `carousel.js` core
    - Create `src/lib/responsive/carousel.js` exporting `AUTO_ADVANCE_MS = 8000`, `createCarouselState({ count, reducedMotion })`, `carouselReducer(state, action)`, `nextIndex(index, count, direction)`, and `isAutoAdvancing(state)`
    - `carouselReducer` handles `NEXT`/`PREV`/`GOTO`/`HOVER_START`/`HOVER_END`/`FOCUS_IN`/`FOCUS_OUT`/`PAUSE`/`RESUME`/`SET_REDUCED_MOTION`, always keeping `index` in `[0, count)` (modular wrap via `nextIndex`); `GOTO` clamps out-of-range indices; `count` of 0 or 1 floors to a single static slide
    - `isAutoAdvancing` returns true iff `count > 1` and none of `hovered`/`focused`/`userPaused`/`reducedMotion` hold; no timers or DOM in this module
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6_

  - [ ] 16.2 Write property test for carousel index range and wrap
    - **Property 15: Carousel slide index stays in range and wraps**
    - **Validates: Requirements 10.1**
    - Use `fast-check` with slide counts via `fc.integer({ min: 0, max: 50 })` and action sequences via `fc.array(fc.constantFrom('NEXT','PREV','HOVER_START','HOVER_END','FOCUS_IN','FOCUS_OUT','PAUSE','RESUME'))`, `{ numRuns: 100 }`; assert index always in `[0, count)` and that advancing/retreating `count` times returns to the original index; tag with `// Feature: responsive-ui-redesign, Property 15: Carousel slide index stays in range and wraps`

  - [ ] 16.3 Write property test for auto-advance gating
    - **Property 16: Auto-advance runs only when nothing suppresses it**
    - **Validates: Requirements 10.2, 10.3, 10.5, 10.6**
    - `fast-check` over carousel states (count via `fc.integer({ min: 0, max: 50 })` × four `fc.boolean()` state flags), assert `isAutoAdvancing` is true iff `count > 1` and none of hovered/focused/userPaused/reducedMotion hold, `{ numRuns: 100 }`; tag with `// Feature: responsive-ui-redesign, Property 16: Auto-advance runs only when nothing suppresses it`

- [ ] 17. Extend motion core with second-wave variants, decorative gating, and card-hover bound
  - [ ] 17.1 Add new variants, `shouldRunDecorative`, and confirm `cardHover` bound
    - In `src/lib/responsive/motion.js`, merge `carouselSlide`, `heroEnter`, and `discoveryTransition` into the existing `VARIANTS` table (bounded opacity + small offset within the <=600ms budget; reduced motion snaps to displacement-free final state) so they flow through the existing `resolveVariants` logic
    - Add `shouldRunDecorative({ reducedMotion, visible })` returning `visible && !reducedMotion` (total function; missing flags treated as falsy)
    - Confirm/clamp `cardHover.animate.scale <= 1.05` (existing variant uses `1.03`)
    - _Requirements: 9.1, 9.3, 13.1, 13.2, 16.1, 16.2, 16.4, 17.4, 20.1, 20.3_

  - [ ] 17.2 Write property test for the decorative gate
    - **Property 17: Decorative and parallax animations are gated off when reduced or hidden**
    - **Validates: Requirements 9.3, 16.1, 16.2, 16.4**
    - `fast-check` over two `fc.boolean()` flags (`reducedMotion`, `visible`), assert `shouldRunDecorative` is true only when `visible && !reducedMotion`, `{ numRuns: 100 }`; tag with `// Feature: responsive-ui-redesign, Property 17: Decorative and parallax animations are gated off when reduced or hidden`

  - [ ] 17.3 Extend Property 8/10/11 variant generators to include the new variants
    - Update the variant-name generators in the existing Property 8, Property 10, and Property 11 tests so `fc.constantFrom(...variantNames)` includes `carouselSlide`, `heroEnter`, and `discoveryTransition`; keep `{ numRuns: 100 }` and the existing property tags intact
    - Re-assert: durations within budget and correct terminal states (Property 8); reduced-motion final state with no displacement for the new non-essential variants (Property 10); essential reduced-motion displacement cap unchanged (Property 11)
    - _Requirements: 9.1, 9.2, 13.1, 13.2, 13.3, 17.4_

  - [ ] 17.4 Write property test for the bounded card-hover scale
    - **Property 21: Card hover scale increase is bounded to 5 percent**
    - **Validates: Requirements 20.3**
    - `fast-check` resolving `resolveVariants('cardHover')` under normal motion (reducedMotion `false`), assert animated `scale <= 1.05`, `{ numRuns: 100 }`; tag with `// Feature: responsive-ui-redesign, Property 21: Card hover scale increase is bounded to 5 percent`

- [ ] 18. Implement sticky-offset, skeleton, and hero-height helpers
  - [ ] 18.1 Implement `stickyOffset.js`
    - Create `src/lib/responsive/stickyOffset.js` exporting `HEADER_HEIGHT_VAR = '--header-height'` and `stickyOffset(headerHeightPx)` returning the header height floored to `>= 0` (non-finite → 0), so the pinned control aligns flush with no gap or overlap
    - _Requirements: 14.1, 14.2_

  - [ ] 18.2 Write property test for sticky offset
    - **Property 18: Sticky offset equals the header height with no gap or overlap**
    - **Validates: Requirements 14.1, 14.2**
    - `fast-check` header heights via `fc.integer({ min: -50, max: 400 })` (incl. negative/non-finite seeds), assert offset `>= 0` and equal to the header height for finite non-negative inputs, `{ numRuns: 100 }`; tag with `// Feature: responsive-ui-redesign, Property 18: Sticky offset equals the header height with no gap or overlap`

  - [ ] 18.3 Implement `skeleton.js`
    - Create `src/lib/responsive/skeleton.js` exporting `skeletonDimension(index, { min, max, group = 0 })` as a deterministic integer hash of `(index, group)` mapped into `[min, max]`; never call `Math.random()`; malformed bounds (`min > max`) return clamped `min`; non-finite index falls back to index 0
    - _Requirements: 15.1, 15.2_

  - [ ] 18.4 Write property test for deterministic skeleton dimensions
    - **Property 19: Skeleton dimensions are deterministic and bounded**
    - **Validates: Requirements 15.1, 15.2**
    - `fast-check` index via `fc.nat({ max: 200 })` × bounds via `fc.record({ min: fc.nat(), max: fc.nat() })`, assert repeated calls return the same value and the value lies within `[min, max]`, `{ numRuns: 100 }`; tag with `// Feature: responsive-ui-redesign, Property 19: Skeleton dimensions are deterministic and bounded`

  - [ ] 18.5 Add `heroMaxHeight` to `media.js`
    - In `src/lib/responsive/media.js`, add `heroMaxHeight(viewportHeightPx, { landscape = false })` returning at most 70% of viewport height in portrait and at most 80% in landscape; non-positive/non-finite viewport heights return 0; orientation defaults to portrait
    - _Requirements: 17.1, 17.2_

  - [ ] 18.6 Write property test for hero height bound
    - **Property 20: Hero height is bounded by viewport and orientation**
    - **Validates: Requirements 17.1, 17.2**
    - `fast-check` viewport heights via `fc.integer({ min: 0, max: 2000 })` × a boolean `landscape` flag, assert `<= 0.7 * height` portrait and `<= 0.8 * height` landscape, `{ numRuns: 100 }`; tag with `// Feature: responsive-ui-redesign, Property 20: Hero height is bounded by viewport and orientation`

- [ ] 19. Checkpoint - second-wave pure core complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Migrate `TrendingCarousel.jsx` to the motion system
  - [ ] 20.1 Wire carousel state machine, auto-advance, variants, pause control, content-fit layout, and tokens
    - Replace inline `slideVariants` with `resolveVariants('carouselSlide')` from `useAppMotion()`; gate perpetual background blobs on `shouldRunDecorative({ reducedMotion, visible: true })`
    - Drive auto-advance with `useReducer(carouselReducer, …)`; a single `useEffect` runs `setInterval(() => dispatch({ type: 'NEXT' }), AUTO_ADVANCE_MS)` **only while `isAutoAdvancing(state)`** and clears it otherwise; `onMouseEnter`/`onMouseLeave` dispatch `HOVER_START`/`HOVER_END`; focus-within `onFocus`/`onBlur` dispatch `FOCUS_IN`/`FOCUS_OUT`; reduced-motion changes dispatch `SET_REDUCED_MOTION`
    - Add a labelled pause/stop toggle (`Pause`/`Play`) sized via `normalizeTouchTarget` that dispatches `PAUSE`/`RESUME` and halts until explicit resume
    - Replace the fixed `min-h-[400px]` + `absolute inset-0` slides with a non-absolute grid-stacked layout so the container sizes to the tallest slide; move nav controls out of the content box so they never overlap
    - Replace `bg-white/5 dark:bg-slate-800/50` → `bg-card/60`, `text-gray-900 dark:text-white` → `text-foreground`, secondary text → `text-muted-foreground`, chips/borders → `bg-muted`/`border-border`, primary button → `bg-primary text-primary-foreground`
    - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3_

  - [ ] 20.2 Write unit tests for carousel auto-advance and controls
    - Assert the pause/stop control renders, is labelled, and uses a `normalizeTouchTarget`-sized hit area (10.4); with fake timers, assert auto-advance fires at 8000ms and stops after pause/hover/focus (10.1, 10.2, 10.3, 10.5); assert variants are sourced from `useAppMotion()` rather than inline literals (9.1)
    - _Requirements: 9.1, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 21. Migrate `FeaturedHeroSection.jsx` to the motion system
  - [ ] 21.1 Single scale source, `heroEnter`, bounded height, gated decoration
    - Remove the competing entrance-zoom scale so exactly one scale transform feeds the hero image node; route entrance fade/translate through `resolveVariants('heroEnter')`
    - Replace `h-[85vh]` with a max-height from `heroMaxHeight(window.innerHeight, { landscape: window.innerWidth > window.innerHeight })`, applied at the mobile breakpoint
    - Under `reducedMotion`, render the image at final scale with no zoom and gate the `useScroll`/`useTransform` parallax and the looping scroll-indicator chevron on `shouldRunDecorative`
    - _Requirements: 9.1, 9.2, 9.3, 17.1, 17.2, 17.3, 17.4_

  - [ ] 21.2 Write unit test for single hero scale source
    - Assert only one scale transform source feeds the hero image node after migration (17.3); assert the parallax/chevron loops are gated under reduced motion
    - _Requirements: 17.3, 17.4_

- [ ] 22. Migrate `EpisodeModal.jsx` to the motion system
  - [ ] 22.1 Reconcile onto `modalEnter`/`modalExit` and adopt theme tokens
    - Replace inline `initial`/`animate` literals with `resolveVariants('modalEnter')` / `resolveVariants('modalExit')`; resolve the banner image entrance and staggered body sections through the motion system, honoring reduced motion
    - Replace `from-white to-slate-50 dark:from-slate-900 dark:to-slate-800` → `bg-card`, `text-slate-900 dark:text-white` → `text-foreground`, meta chips `bg-slate-100 dark:bg-slate-800` → `bg-muted text-muted-foreground`, borders → `border-border`
    - _Requirements: 9.1, 9.2, 12.1, 12.2, 12.3_

- [ ] 23. Migrate `FancyLoader.jsx` to deterministic, single-shimmer skeletons
  - [ ] 23.1 Deterministic widths, single shimmer technique, gated spinner, tokens
    - Replace every `Math.random()` width with `skeletonDimension(i, { min, max, group })` so widths are stable across re-renders
    - Consolidate the three current shimmer mechanisms into one uniform shimmer utility modeled as an **essential** opacity-only variant (so reduced motion keeps it non-positional, <=5px); gate non-essential spinner parts on `shouldRunDecorative`
    - Replace slate/indigo gradient literals → `bg-muted`/`bg-card`/`border-border`, spinner accent → `border-primary`
    - _Requirements: 9.1, 9.2, 12.1, 12.2, 12.3, 15.1, 15.2, 15.3, 15.4_

  - [ ] 23.2 Write unit tests for stable single-shimmer skeletons
    - Assert a single shimmer mechanism is applied across placeholders (15.3) and that skeleton widths are identical across two renders (15.1, 15.2)
    - _Requirements: 15.1, 15.2, 15.3_

- [ ] 24. Migrate `NotFound.jsx` + `AnimatedCharater.jsx`
  - [ ] 24.1 Visibility-gated mount, gated loops, rAF-throttled parallax, tokens
    - Mount/animate `AnimatedCharater` only when visible at the current breakpoint via `useBreakpoint()` (not CSS-only `hidden`), so its `repeat: Infinity` loops do not run offscreen
    - Gate every perpetual loop (sparkles, 404 float, color-cycle text, character float/blink/limb loops) on `shouldRunDecorative({ reducedMotion, visible })`; render final state when off
    - Replace synchronous `setMouse` per `mousemove` with a single `requestAnimationFrame`-committed update (at most one state update per frame); disable pointer-parallax updates entirely under reduced motion
    - Replace pink/purple/`text-gray-800 dark:text-white`/`#1f2937` literals with `text-foreground`/`text-muted-foreground`/`bg-background` and accent tokens
    - _Requirements: 9.1, 9.2, 9.3, 12.1, 12.2, 16.1, 16.2, 16.3, 16.4_

  - [ ] 24.2 Write unit test for rAF-throttled pointer parallax
    - With fake `requestAnimationFrame`, dispatch many synchronous `pointermove` events and assert at most one parallax state update per frame (16.3); assert updates are disabled under reduced motion (16.4)
    - _Requirements: 16.3, 16.4_

- [ ] 25. Migrate `Discovery.jsx` transition and sticky alignment
  - [ ] 25.1 Keyed `discoveryTransition` element and header-aware sticky offset
    - Give the motion element a `key` of `` `${type}:${sortBy}` `` so changing type/sort remounts and re-runs the transition; resolve its variants from `resolveVariants('discoveryTransition')` (honoring reduced motion)
    - Replace `sticky top-28` with `style={{ top: 'var(--header-height)' }}` backed by `stickyOffset(headerHeight)`; replace slate/blue/gray tab/border literals with `border-border`, `text-foreground`/`text-muted-foreground`, active tab → `text-primary border-primary`
    - _Requirements: 13.1, 13.2, 13.3, 14.1, 14.2_

  - [ ] 25.2 Write unit test for Discovery transition key regression
    - Assert the motion element's `key` changes when `type` or `sortBy` changes (13.1, 13.2), guarding against the dead-`AnimatePresence` bug
    - _Requirements: 13.1, 13.2_

- [ ] 26. Update `Layout.jsx` header-height publishing and Toaster theme
  - [ ] 26.1 Publish `--header-height` and drive Toaster from `useTheme`
    - Measure the header bar height with a `ResizeObserver` and publish it into the `--header-height` CSS variable (consumed by Discovery's sticky control)
    - Add a pure `toasterTheme(theme)` mapping (`light → 'light'`, `dark`/`dracula → 'dark'`, fallback `'dark'`) and drive the `Toaster` theme from the extended `useTheme()` instead of the boolean `isDark`, so dracula renders with dracula tokens
    - _Requirements: 14.1, 14.2, 19.1, 19.2, 19.3_

  - [ ] 26.2 Write unit test for Toaster theme mapping
    - Assert `toasterTheme` returns the correct sonner theme for each theme, including `dracula` mapping to a dark-based theme (19.1, 19.2, 19.3)
    - _Requirements: 19.1, 19.2, 19.3_

- [ ] 27. Update `DesktopSidebar` keyboard accessibility
  - [ ] 27.1 Expand on focus-within with stable layout and reduced-motion suppression
    - In `Sidebar.jsx` `DesktopSidebar`, expand on focus-within (`onFocus`/`onBlur` or a `focus-within` state) in addition to hover, so any nav control receiving keyboard focus expands the sidebar
    - Keep the main content's horizontal start position stable during expand/collapse (reserve a fixed gutter / overlay the expansion rather than reflow)
    - Animate width only when `!reducedMotion` so reduced motion suppresses the width transition
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 28. Update `MovieCard.jsx` hover coherence
  - [ ] 28.1 Single `cardHover` driver, bounded scale, standard aspect ratio
    - Remove the competing inner `whileHover={{ scale: 1.08 }}` on the poster and the badge/genre `whileHover` scales so the single `cardHover` variant from `useAppMotion()` drives hover and reverses to resting on exit
    - Keep `cardHover` animate scale `<= 1.05`; replace the non-standard `h-30` poster class with a standard aspect-ratio utility (`aspect-[2/3]` with `object-cover`)
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

  - [ ] 28.2 Write unit test for single hover driver and aspect-ratio utility
    - Assert exactly one hover transform driver remains after migration (20.1) and the poster uses a standard aspect-ratio utility instead of `h-30` (20.4)
    - _Requirements: 20.1, 20.4_

- [ ] 29. Integration and accessibility verification (second wave)
  - [ ] 29.1 Write carousel content-fit integration tests
    - Render `TrendingCarousel` at 375/768/1024/1440 and assert the container contains the tallest slide (no clipped/truncated content) and that nav controls do not overlap the content box
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 29.2 Write Discovery sticky-alignment integration tests
    - Assert the pinned sort control's top offset equals the rendered header height with no gap and no overlap across the mobile/tablet/desktop breakpoints
    - _Requirements: 14.1, 14.2_

  - [ ] 29.3 Write decorative-cost integration tests
    - With `AnimatedCharater` hidden at the mobile breakpoint, assert it is unmounted (not merely visually hidden) so no loops run (16.1); under `prefers-reduced-motion: reduce`, assert NotFound/AnimatedCharater decorative elements render in their final state (16.2)
    - _Requirements: 16.1, 16.2_

  - [ ] 29.4 Write desktop sidebar focus-within accessibility tests
    - Focusing a nav control expands the sidebar (18.1); the expanded state is reachable by keyboard and touch without hover (18.2); the main content's horizontal start position is unchanged across collapse/expand (18.3); reduced motion suppresses the width transition (18.4)
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [ ] 29.5 Write theme-token verification tests for animated components
    - Render `TrendingCarousel`, `EpisodeModal`, `FancyLoader`, `NotFound`, and toasts under each theme and assert computed colors derive from the active theme's tokens (not slate/gray/indigo/white literals), with dracula rendering distinctly (12.1–12.3, 19.1–19.3); add a grep guard that flags reintroduced color literals in these components
    - _Requirements: 12.1, 12.2, 12.3, 19.1, 19.2, 19.3_

- [ ] 30. Final checkpoint - full suite green (second wave)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; core implementation tasks are never optional.
- Property-based tests use `fast-check` exclusively, run with `{ numRuns: 100 }`, and are tagged `// Feature: responsive-ui-redesign, Property {n}: {text}` per the design.
- Each property maps to exactly one property-based test and is placed next to the module it validates so errors surface early.
- Layout, contrast, keyboard, and accessibility concerns are validated by example/integration/a11y tests rather than PBT, matching the design's testing strategy.
- Each task references specific requirements (and properties, where applicable) for traceability.
- Tasks 16–30 are the second-wave motion-system migration covering Requirements 9–20 and design Properties 15–21. They build on the existing foundation (tasks 1–15): new pure helpers (`carousel.js`, `stickyOffset.js`, `skeleton.js`, plus `motion.js`/`media.js` additions) and their property tests land first, then the hardcoded-motion components are migrated onto `useAppMotion()`/`shouldRunDecorative`, then integration/a11y verification.
- The new variants `carouselSlide`, `heroEnter`, and `discoveryTransition` are added to the existing `VARIANTS` table, so Properties 8, 10, and 11 extend to cover them automatically (task 17.3 widens those generators).

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
    { "id": 6, "tasks": ["12.3", "13.4", "14.1", "14.2", "14.3"] },
    { "id": 7, "tasks": ["16.1", "17.1", "18.1", "18.3", "18.5"] },
    { "id": 8, "tasks": ["16.2", "16.3", "17.2", "17.3", "17.4", "18.2", "18.4", "18.6"] },
    { "id": 9, "tasks": ["20.1", "21.1", "22.1", "23.1", "24.1", "25.1", "26.1", "27.1", "28.1"] },
    { "id": 10, "tasks": ["20.2", "21.2", "23.2", "24.2", "25.2", "26.2", "28.2"] },
    { "id": 11, "tasks": ["29.1", "29.2", "29.3", "29.4", "29.5"] }
  ]
}
```
