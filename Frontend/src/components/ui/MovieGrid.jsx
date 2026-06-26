import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';
import { useAppMotion } from '@/context/MotionConfigProvider';

/**
 * Default responsive column counts.
 *
 * Matches the breakpoint contract from the responsive redesign: a single
 * stacked column at mobile, two columns from the small breakpoint, and a
 * multi-column layout from the large breakpoint up (Requirements 1.1, 1.2, 1.3).
 * Callers can override via `columnsClassName` to preserve a denser grid.
 */
const DEFAULT_COLUMNS = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

/** Default responsive gap between grid cells. */
const DEFAULT_GAP = 'gap-4 sm:gap-6';

/**
 * Reusable responsive movie grid.
 *
 * Renders its items into a responsive CSS grid and applies a staggered entrance
 * animation to each cell through the app motion system. Each cell uses the
 * `itemEnter` variant resolved via {@link useAppMotion} (so reduced-motion users
 * get the final state immediately) and a per-item start delay from
 * `staggerDelay(index)`, keeping list entrance within the 50–150ms band
 * (Requirement 6.2).
 *
 * The component is purely presentational: it does not own item data and forwards
 * each item to the `children` render function unchanged, so existing card
 * components and their props are preserved.
 *
 * @param {Object} props
 * @param {Array<any>} props.items - Items to render; each is passed to `children`.
 * @param {(item: any, index: number) => import('react').ReactNode} props.children
 *   Render function returning the card for a given item/index.
 * @param {(item: any, index: number) => (string|number)} [props.getKey]
 *   Returns a stable React key for an item. Defaults to `item.id` then `index`.
 * @param {string} [props.className] - Extra classes merged onto the grid container.
 * @param {string} [props.columnsClassName] - Responsive column classes (override).
 * @param {string} [props.gapClassName] - Responsive gap classes (override).
 * @param {boolean} [props.essential] - Treat the entrance as essential motion.
 * @param {boolean} [props.withExit] - Wrap cells in `AnimatePresence` and animate
 *   their removal (useful for grids whose items can be removed, e.g. watchlist).
 * @returns {import('react').ReactElement}
 */
function MovieGrid({
    items = [],
    children,
    getKey,
    className,
    columnsClassName = DEFAULT_COLUMNS,
    gapClassName = DEFAULT_GAP,
    essential = false,
    withExit = false,
    ...rest
}) {
    const { resolveVariants, staggerDelay } = useAppMotion();
    const variants = resolveVariants('itemEnter', { essential });

    const cells = items.map((item, index) => {
        const key = getKey ? getKey(item, index) : (item?.id ?? index);
        return (
            <motion.div
                key={key}
                initial={variants.initial}
                animate={variants.animate}
                exit={withExit ? { opacity: 0, scale: 0.95 } : undefined}
                transition={{ ...variants.transition, delay: staggerDelay(index) }}
            >
                {children(item, index)}
            </motion.div>
        );
    });

    return (
        <div className={cn('grid', columnsClassName, gapClassName, className)} {...rest}>
            {withExit ? <AnimatePresence>{cells}</AnimatePresence> : cells}
        </div>
    );
}

export default MovieGrid;
