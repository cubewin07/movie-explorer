// Media aspect-ratio helper (responsive core).
//
// Pure, framework-free logic for fitting media (movie posters, images) to the
// width of their containing element while preserving the source aspect ratio.
// See Requirement 4.4: media fills 100% of its container width and preserves
// the source aspect ratio within a tolerance of +/- 1 percent.

/**
 * Compute the display height that fills the container width while preserving
 * the source aspect ratio.
 *
 * displayHeight = containerWidth * (srcHeight / srcWidth)
 *
 * Inputs are sanitized rather than rejected so the function always returns a
 * renderable, non-negative number:
 * - Non-finite or negative `containerWidth` is floored to 0.
 * - Non-finite or non-positive source dimensions (which have no defined aspect
 *   ratio) yield a display height of 0.
 *
 * @param {{ srcWidth: number, srcHeight: number }} source - Intrinsic media dimensions.
 * @param {number} containerWidth - The width (CSS px) the media should fill.
 * @returns {number} The display height in CSS px that preserves the aspect ratio.
 */
export function fitWidth({ srcWidth, srcHeight }, containerWidth) {
  const width = toNonNegative(containerWidth);

  if (
    !Number.isFinite(srcWidth) ||
    !Number.isFinite(srcHeight) ||
    srcWidth <= 0 ||
    srcHeight <= 0
  ) {
    return 0;
  }

  return width * (srcHeight / srcWidth);
}

/** Coerce a value into a finite, non-negative number (floor invalid/negative to 0). */
function toNonNegative(value) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}
