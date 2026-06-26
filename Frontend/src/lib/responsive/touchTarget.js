// Touch-target normalization core (responsive core).
//
// Pure, framework-free logic that guarantees an interactive element has an
// activatable area of at least 44x44 CSS pixels without shrinking its visible
// content box. See Requirements 2.7, 3.1, 3.4 and Property 3.

/** Minimum activatable area for a touch target, in CSS px (per axis). */
export const MIN_TOUCH_PX = 44;

/** Minimum edge-to-edge spacing between adjacent touch targets, in CSS px. */
export const MIN_GAP_PX = 8;

/**
 * Normalize an element's content size into a touch-target box.
 *
 * Given the visible content `{ width, height }`, return the minimum box size
 * and the symmetric padding required so the element's activatable area is at
 * least `MIN_TOUCH_PX` (44) on each axis. Padding compensates for any shortfall
 * and is split evenly on both sides, so the visible content box is never
 * reduced; when a dimension already meets the minimum, no padding is added.
 *
 * Negative or non-finite sizes are floored to 0 before normalizing, so the
 * function always returns renderable, non-negative numbers rather than throwing.
 *
 * @param {{ width: number, height: number }} content - Visible content dimensions in CSS px.
 * @returns {{ minWidth: number, minHeight: number, padX: number, padY: number }}
 *   `minWidth`/`minHeight` are >= 44; `padX`/`padY` are the per-side padding
 *   (>= 0) that compensates for any shortfall.
 */
export function normalizeTouchTarget({ width, height } = {}) {
  const contentWidth = toNonNegative(width);
  const contentHeight = toNonNegative(height);

  const minWidth = Math.max(MIN_TOUCH_PX, contentWidth);
  const minHeight = Math.max(MIN_TOUCH_PX, contentHeight);

  // Split the shortfall evenly so the content box stays centered and unshrunk.
  const padX = (minWidth - contentWidth) / 2;
  const padY = (minHeight - contentHeight) / 2;

  return { minWidth, minHeight, padX, padY };
}

/** Coerce a value into a finite, non-negative number (floor invalid/negative to 0). */
function toNonNegative(value) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}
