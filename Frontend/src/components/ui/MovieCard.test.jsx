import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import MovieCard from './MovieCard';
import MovieGrid from './MovieGrid';
import { MotionConfigProvider } from '@/context/MotionConfigProvider';

// Mobile gap classes use Tailwind's `gap-N` scale where each step is 4px
// (gap-1 = 4px, gap-2 = 8px, ...). The 8px minimum from Requirement 3.2
// therefore corresponds to gap-2 and above.
function gapStepFromClass(className) {
    const match = className.match(/(?:^|\s)gap-(\d+)(?:\s|$)/);
    return match ? Number(match[1]) : null;
}

function renderCard(props = {}) {
    return render(
        <MotionConfigProvider>
            <MovieCard {...props} />
        </MotionConfigProvider>,
    );
}

describe('MovieCard', () => {
    // Requirement 4.5: text in a width-constrained container is clamped to a
    // bounded number of visible lines with ellipsis overflow. The card uses
    // `line-clamp-2`, which stays within the "at most 3 lines" contract.
    it('clamps a long title with a line-clamp utility class', () => {
        const longTitle =
            'An Exceptionally Long Movie Title That Would Otherwise Wrap Across Many Lines And Overflow Its Container';
        renderCard({ title: longTitle, year: 2024 });

        const heading = screen.getByRole('heading', { name: longTitle });
        const clampClass = Array.from(heading.classList).find((c) => c.startsWith('line-clamp-'));

        expect(clampClass).toBeDefined();
        const lines = Number(clampClass.replace('line-clamp-', ''));
        expect(lines).toBeGreaterThanOrEqual(1);
        expect(lines).toBeLessThanOrEqual(3);
    });

    // Requirement 5.4: non-decorative images carry a text alternative. The
    // poster falls back to 'Movie poster' when no title is supplied.
    it('renders the poster with a non-empty alt derived from the title', () => {
        renderCard({ title: 'Inception', image: 'https://example.com/poster.jpg' });
        const img = screen.getByRole('img');
        expect(img.getAttribute('alt')).toBe('Inception');
    });

    it('renders a non-empty fallback alt when the title is missing', () => {
        renderCard({});
        const img = screen.getByRole('img');
        const alt = img.getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt.trim().length).toBeGreaterThan(0);
        expect(alt).toBe('Movie poster');
    });

    // Requirement 3.3: activating/hovering an interactive element produces a
    // visible state change. The clickable card root carries hover feedback and
    // transition utilities driving that change.
    it('exposes hover/active feedback classes on the interactive card root', () => {
        const { container } = renderCard({ title: 'Interstellar', year: 2014 });
        const root = container.firstChild;

        expect(root).toHaveClass('cursor-pointer');
        expect(root).toHaveClass('transition-all');

        const classes = root.className;
        const hasHoverFeedback = /(?:^|\s|:)hover:/.test(classes);
        expect(hasHoverFeedback).toBe(true);
    });
});

describe('MovieGrid mobile spacing', () => {
    // Requirement 3.2: adjacent items keep at least 8px of edge-to-edge spacing
    // at the mobile breakpoint. The base (mobile) gap class must be gap-2 (8px)
    // or larger.
    it('uses a mobile gap of at least 8px (gap-2)', () => {
        const { container } = render(
            <MotionConfigProvider>
                <MovieGrid items={[{ id: 1, title: 'A' }, { id: 2, title: 'B' }]}>
                    {(item) => <div>{item.title}</div>}
                </MovieGrid>
            </MotionConfigProvider>,
        );

        const grid = container.firstChild;
        const baseGapStep = gapStepFromClass(grid.className);

        expect(baseGapStep).not.toBeNull();
        // gap-2 === 8px; each Tailwind step is 4px.
        expect(baseGapStep).toBeGreaterThanOrEqual(2);
    });
});
