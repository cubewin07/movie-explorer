import Reviews from '@/components/react_components/Reviews/Reviews';

/**
 * MovieReviewsSection Component
 * Wrapper component for Reviews component
 * Shared with TvSeriesDetailPage (simple wrapper)
 */
export function MovieReviewsSection({ filmId }) {
    return <Reviews filmId={Number(filmId)} type="MOVIE" />;
}

export default MovieReviewsSection;
