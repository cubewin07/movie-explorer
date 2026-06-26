import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import MovieGrid from './MovieGrid';
import { MotionConfigProvider } from '@/context/MotionConfigProvider';

const items = [
    { id: 1, title: 'Alpha' },
    { id: 2, title: 'Bravo' },
    { id: 3, title: 'Charlie' },
];

function renderGrid(props = {}) {
    return render(
        <MotionConfigProvider>
            <MovieGrid items={items} {...props}>
                {(item) => <div data-testid="cell">{item.title}</div>}
            </MovieGrid>
        </MotionConfigProvider>,
    );
}

describe('MovieGrid', () => {
    it('renders one cell per item via the render function', () => {
        renderGrid();
        const cells = screen.getAllByTestId('cell');
        expect(cells).toHaveLength(items.length);
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('applies responsive grid layout classes with sensible defaults', () => {
        const { container } = renderGrid();
        const grid = container.firstChild;
        expect(grid).toHaveClass('grid');
        expect(grid).toHaveClass('grid-cols-1');
        expect(grid).toHaveClass('sm:grid-cols-2');
        expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('allows overriding the column and gap classes', () => {
        const { container } = renderGrid({
            columnsClassName: 'grid-cols-2 xl:grid-cols-6',
            gapClassName: 'gap-3',
        });
        const grid = container.firstChild;
        expect(grid).toHaveClass('grid-cols-2');
        expect(grid).toHaveClass('xl:grid-cols-6');
        expect(grid).toHaveClass('gap-3');
        // default columns should have been replaced by the override
        expect(grid).not.toHaveClass('grid-cols-1');
    });

    it('renders nothing but the container when there are no items', () => {
        const { container } = render(
            <MotionConfigProvider>
                <MovieGrid items={[]}>{(item) => <div>{item.title}</div>}</MovieGrid>
            </MotionConfigProvider>,
        );
        expect(container.firstChild).toHaveClass('grid');
        expect(container.firstChild.childElementCount).toBe(0);
    });
});
