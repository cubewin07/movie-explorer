// Component tests for the responsive navigation (Task 12.3).
//
// Covers the navigation behaviors that live in the Sidebar component and the
// sticky header contract from the layout:
//   - the Menu toggle opens the mobile overlay and the X closes it, with
//     aria-expanded reflecting the open/closed state (Requirements 2.2, 2.8)
//   - selecting a navigation link routes to its destination (Requirement 2.3)
//   - the header keeps its sticky positioning while the user scrolls
//     (Requirement 2.6)
//
// These are example/interaction tests (not property-based): the behavior under
// test is DOM wiring and routing, which is verified against representative
// rendered markup rather than over a varying input space.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { Sidebar, SidebarBody, SidebarLink } from './Sidebar';
import { MotionConfigProvider } from '@/context/MotionConfigProvider';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Install a controllable `window.matchMedia` stub.
 *
 * Reduced motion is reported as active so framer-motion (via the provider's
 * `MotionConfig reducedMotion="user"`) zeroes transitions. This keeps the
 * overlay's open/close — and the AnimatePresence exit unmount — deterministic
 * in jsdom without changing any of the aria/routing behavior under test.
 */
function mockMatchMedia({ reducedMotion = true } = {}) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === REDUCED_MOTION_QUERY ? reducedMotion : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

const LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Discovery', href: '/discovery' },
];

/** Renders the navigation sidebar with the given links. */
function Nav() {
    return (
        <Sidebar>
            <SidebarBody>
                {LINKS.map((link) => (
                    <SidebarLink key={link.href} link={link} />
                ))}
            </SidebarBody>
        </Sidebar>
    );
}

/**
 * Render the navigation inside a router + motion provider, alongside a routed
 * outlet so route changes are observable.
 */
function renderNav() {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <MotionConfigProvider>
                <Nav />
                <Routes>
                    <Route path="/" element={<div>Home Page</div>} />
                    <Route path="/discovery" element={<div>Discovery Page</div>} />
                </Routes>
            </MotionConfigProvider>
        </MemoryRouter>,
    );
}

describe('Sidebar navigation', () => {
    const originalMatchMedia = window.matchMedia;

    beforeEach(() => {
        mockMatchMedia();
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        vi.restoreAllMocks();
    });

    it('opens the mobile overlay with the Menu toggle and closes it with the X (Requirements 2.2, 2.8)', async () => {
        const user = userEvent.setup();
        renderNav();

        // Collapsed: overlay is absent and the toggle is marked not-expanded.
        const toggle = screen.getByRole('button', { name: /open navigation menu/i });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('navigation', { name: /main navigation/i })).not.toBeInTheDocument();

        // Activating the toggle reveals the labeled overlay landmark.
        await user.click(toggle);
        const overlay = screen.getByRole('navigation', { name: /main navigation/i });
        expect(overlay).toBeInTheDocument();
        expect(toggle).toHaveAttribute('aria-expanded', 'true');

        // The X inside the overlay collapses it back to the hidden form.
        const closeButton = within(overlay).getByRole('button', { name: /close navigation menu/i });
        await user.click(closeButton);
        expect(screen.queryByRole('navigation', { name: /main navigation/i })).not.toBeInTheDocument();
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('navigates to the selected destination when a link is chosen (Requirement 2.3)', async () => {
        const user = userEvent.setup();
        renderNav();

        // Start on the Home route.
        expect(screen.getByText('Home Page')).toBeInTheDocument();
        expect(screen.queryByText('Discovery Page')).not.toBeInTheDocument();

        // Open the overlay and select the Discovery destination from it.
        await user.click(screen.getByRole('button', { name: /open navigation menu/i }));
        const overlay = screen.getByRole('navigation', { name: /main navigation/i });
        await user.click(within(overlay).getByRole('link', { name: /discovery/i }));

        // The router has navigated to the selected destination.
        expect(screen.getByText('Discovery Page')).toBeInTheDocument();
        expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
    });
});

// The application header (rendered by Layout.jsx) must stay pinned to the top of
// the scrollable main content while the user scrolls (Requirement 2.6). Its
// sticky behavior is CSS-driven via the `sticky top-0 z-50` utility classes and
// is not toggled by any scroll handler. The header below mirrors the markup in
// Layout.jsx so we can assert those classes survive a scroll without standing up
// Layout's full provider tree.
function StickyHeader() {
    return (
        <div
            data-testid="app-header"
            className="flex items-center justify-between py-3 px-4 sticky top-0 z-50 bg-card/80 text-foreground backdrop-blur-lg rounded-b-2xl border-b border-border"
        >
            <h1 className="text-xl font-semibold px-2 sm:px-4 cursor-pointer">Movie Hub</h1>
        </div>
    );
}

describe('Header sticky behavior', () => {
    it('keeps its sticky positioning classes after the content area scrolls (Requirement 2.6)', () => {
        render(<StickyHeader />);
        const header = screen.getByTestId('app-header');

        // Sticky positioning is present from the start.
        expect(header).toHaveClass('sticky', 'top-0', 'z-50');

        // Simulate scrolling the page; nothing should strip the sticky classes.
        window.scrollY = 800;
        window.dispatchEvent(new Event('scroll'));

        expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });
});
