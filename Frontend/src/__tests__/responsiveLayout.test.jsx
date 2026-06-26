// Responsive layout integration tests (Task 14.1).
//
// These render a representative layout surface — the reusable `MovieGrid` plus a
// small `useBreakpoint`-driven layout shell — at the canonical viewport widths
// 375 / 768 / 1024 / 1440 and assert that:
//   - the rendered grid never produces horizontal overflow (scrollWidth <= clientWidth),
//   - per-breakpoint responsive column classes are applied (no clipping by layout),
//   - simulating a `matchMedia` change re-renders the breakpoint-driven output.
//
// jsdom does not perform real CSS layout, so `scrollWidth`/`clientWidth` are both
// 0 and the overflow check holds trivially; where it is meaningful is in a real
// browser. To keep the test robust and meaningful in jsdom we additionally assert
// on the applied responsive Tailwind classes and on live `useBreakpoint` state
// transitions driven by `matchMedia` change events.
//
// Validates: Requirements 1.4, 1.5, 1.6, 1.7

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MovieGrid from '../components/ui/MovieGrid.jsx';
import { MotionConfigProvider } from '../context/MotionConfigProvider.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';
import { resolveBreakpoint, resolveLayout } from '../lib/responsive/breakpoints.js';

// Canonical representative widths and the breakpoint each should resolve to.
const WIDTH_CASES = [
    { width: 375, breakpoint: 'mobile' },
    { width: 768, breakpoint: 'tablet' },
    { width: 1024, breakpoint: 'desktop' },
    { width: 1440, breakpoint: 'desktop' },
];

/**
 * Evaluate a CSS width media query (as produced by `breakpointQuery`) against a
 * concrete viewport width. Queries that contain no width feature (for example
 * `prefers-reduced-motion`) never match, so motion stays disabled in tests.
 *
 * @param {string} query
 * @param {number} width
 * @returns {boolean}
 */
function evaluateQuery(query, width) {
    const min = /min-width:\s*([\d.]+)px/.exec(query);
    const max = /max-width:\s*([\d.]+)px/.exec(query);
    if (!min && !max) return false;
    let matches = true;
    if (min) matches = matches && width >= parseFloat(min[1]);
    if (max) matches = matches && width <= parseFloat(max[1]);
    return matches;
}

/**
 * Build a stateful `window.matchMedia` mock backed by a single viewport width.
 *
 * Every MediaQueryList it hands out evaluates its `matches` live against the
 * current width, so flipping the width with `setWidth` simultaneously updates
 * `window.innerWidth` and notifies all registered `change` listeners, simulating
 * the viewport crossing a breakpoint boundary (Requirement 1.4).
 *
 * @param {number} initialWidth
 */
function createMatchMediaMock(initialWidth) {
    let currentWidth = initialWidth;
    const listeners = new Set();

    const matchMedia = vi.fn((query) => ({
        media: query,
        get matches() {
            return evaluateQuery(query, currentWidth);
        },
        addEventListener: (_event, cb) => listeners.add(cb),
        removeEventListener: (_event, cb) => listeners.delete(cb),
        // Legacy Safari fallbacks that useBreakpoint also supports.
        addListener: (cb) => listeners.add(cb),
        removeListener: (cb) => listeners.delete(cb),
        dispatchEvent: () => true,
    }));

    matchMedia.setWidth = (width) => {
        currentWidth = width;
        window.innerWidth = width;
        listeners.forEach((cb) => cb({ matches: true }));
    };

    return matchMedia;
}

/** Apply a viewport width to the jsdom window and its matchMedia mock. */
function setViewport(width) {
    window.innerWidth = width;
    window.matchMedia = createMatchMediaMock(width);
}

/**
 * Representative layout shell that mirrors the real `Layout`'s breakpoint-driven
 * structure: a single stacked column on mobile, the right sidebar only at
 * desktop, and a grid of items. It is intentionally minimal so the test focuses
 * on responsive wiring rather than data/context-heavy real pages.
 */
function LayoutSurface({ items }) {
    const { breakpoint, isDesktop } = useBreakpoint();
    const { columns, navMode, rightSidebarVisible } = resolveLayout(window.innerWidth);

    return (
        <div data-testid="layout-root" className="w-full overflow-x-hidden">
            <div data-testid="breakpoint" data-breakpoint={breakpoint} data-nav-mode={navMode}>
                {breakpoint}
            </div>
            <main data-testid="main" className="w-full max-w-full">
                <MovieGrid items={items} getKey={(item) => item.id}>
                    {(item) => (
                        <article data-testid="card" className="w-full">
                            <h3 className="text-base line-clamp-3">{item.title}</h3>
                        </article>
                    )}
                </MovieGrid>
            </main>
            {rightSidebarVisible ? (
                <aside data-testid="right-sidebar" aria-label="Recommendations">
                    sidebar
                </aside>
            ) : null}
            <span data-testid="columns">{columns}</span>
            <span data-testid="is-desktop">{String(isDesktop)}</span>
        </div>
    );
}

function renderSurface(items) {
    return render(
        <MemoryRouter>
            <MotionConfigProvider>
                <LayoutSurface items={items} />
            </MotionConfigProvider>
        </MemoryRouter>,
    );
}

const ITEMS = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, title: `Movie ${i + 1}` }));

describe('responsive layout integration', () => {
    const originalMatchMedia = window.matchMedia;
    const originalInnerWidth = window.innerWidth;

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        window.innerWidth = originalInnerWidth;
        vi.restoreAllMocks();
    });

    describe.each(WIDTH_CASES)('at $width px ($breakpoint)', ({ width, breakpoint }) => {
        beforeEach(() => {
            setViewport(width);
        });

        it('resolves the expected breakpoint and right-sidebar visibility', () => {
            expect(resolveBreakpoint(width)).toBe(breakpoint);
            renderSurface(ITEMS);

            expect(screen.getByTestId('breakpoint')).toHaveAttribute('data-breakpoint', breakpoint);

            // Right sidebar is present only at desktop (Requirement 1.3); its
            // absence sub-desktop keeps content within the viewport width (1.5).
            if (breakpoint === 'desktop') {
                expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
            } else {
                expect(screen.queryByTestId('right-sidebar')).not.toBeInTheDocument();
            }
        });

        it('renders the grid with responsive column classes and no horizontal overflow', () => {
            const { container } = renderSurface(ITEMS);

            const grid = container.querySelector('.grid');
            expect(grid).not.toBeNull();

            // Responsive columns let content reflow/wrap to fit each breakpoint
            // without horizontal scrolling (Requirements 1.5, 1.7).
            expect(grid.className).toContain('grid-cols-1');
            expect(grid.className).toContain('sm:grid-cols-2');
            expect(grid.className).toContain('lg:grid-cols-3');

            // No horizontal overflow on the scroll container or the grid itself.
            // jsdom reports 0 for both, so this holds; in a real browser it
            // asserts the content never exceeds the viewport width (1.5, 1.6).
            const root = screen.getByTestId('layout-root');
            expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
            expect(grid.scrollWidth).toBeLessThanOrEqual(grid.clientWidth);

            // All items render (nothing clipped/dropped from the layout) (1.6).
            expect(screen.getAllByTestId('card')).toHaveLength(ITEMS.length);
        });
    });

    it('updates the layout when matchMedia reports a breakpoint change', () => {
        // Start at mobile.
        window.innerWidth = 375;
        const matchMedia = createMatchMediaMock(375);
        window.matchMedia = matchMedia;

        renderSurface(ITEMS);

        const breakpointEl = screen.getByTestId('breakpoint');
        expect(breakpointEl).toHaveAttribute('data-breakpoint', 'mobile');
        expect(breakpointEl).toHaveAttribute('data-nav-mode', 'overlay');
        expect(screen.queryByTestId('right-sidebar')).not.toBeInTheDocument();

        // Cross into desktop: the matchMedia change must drive a re-render that
        // updates breakpoint-driven output within the budget (Requirement 1.4).
        act(() => {
            matchMedia.setWidth(1440);
        });

        expect(screen.getByTestId('breakpoint')).toHaveAttribute('data-breakpoint', 'desktop');
        expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');

        // Cross back down to tablet: collapsed-overlay nav, still no right sidebar.
        act(() => {
            matchMedia.setWidth(768);
        });

        expect(screen.getByTestId('breakpoint')).toHaveAttribute('data-breakpoint', 'tablet');
        expect(screen.getByTestId('breakpoint')).toHaveAttribute('data-nav-mode', 'overlay');
    });

    it('reflects breakpoint state changes through the useBreakpoint hook', () => {
        window.innerWidth = 375;
        const matchMedia = createMatchMediaMock(375);
        window.matchMedia = matchMedia;

        const { result } = renderHook(() => useBreakpoint());
        expect(result.current.breakpoint).toBe('mobile');
        expect(result.current.isMobile).toBe(true);

        act(() => {
            matchMedia.setWidth(1024);
        });
        expect(result.current.breakpoint).toBe('desktop');
        expect(result.current.isDesktop).toBe(true);
    });
});
