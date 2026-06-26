// Responsive core module.
//
// This directory holds the pure, framework-free helper functions that decide
// breakpoints, typography scaling, touch-target normalization, motion
// configuration, and theme state transitions for the responsive UI redesign.
// These functions contain no DOM or React dependencies, which makes them the
// unit/property-test surface for the feature.
//
// Modules are added by subsequent tasks (breakpoints.js, typography.js,
// touchTarget.js, media.js, motion.js, theme.js) and re-exported here.

export {
    BREAKPOINTS,
    LAYOUT_COLUMNS,
    resolveBreakpoint,
    resolveLayout,
    breakpointQuery,
} from './breakpoints.js'
export {
    BODY_MIN,
    BODY_MAX,
    HEADING_MIN_RATIO,
    HEADING_MAX_RATIO,
    clampBodySize,
    scaleHeading,
} from './typography.js'
export {
    MIN_TOUCH_PX,
    MIN_GAP_PX,
    normalizeTouchTarget,
} from './touchTarget.js'
export { fitWidth } from './media.js'
export { MOTION, VARIANTS, staggerDelay, resolveVariants } from './motion.js'
export {
    THEMES,
    DEFAULT_THEME,
    APPLY_THEME,
    CLEAR_THEME_ERROR,
    isValidTheme,
    initThemeState,
    applyTheme,
    clearThemeError,
    themeReducer,
    resolveTokens,
} from './theme.js'
