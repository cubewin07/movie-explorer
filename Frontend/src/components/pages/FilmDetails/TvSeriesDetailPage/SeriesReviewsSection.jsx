import Reviews from '@/components/react_components/Reviews/Reviews';

export default function SeriesReviewsSection({ filmId }) {
    return <Reviews filmId={Number(filmId)} type="SERIES" />;
}
