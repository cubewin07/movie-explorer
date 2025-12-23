import { useMemo } from 'react';

/**
 * Custom hook for creating carousel items from trending data
 * Transforms raw API data into structured carousel format with images, metadata, and genres
 * 
 * @param {Object} trendingData - Raw trending movies data from TMDB API
 * @param {Object} genreMap - Map of genre IDs to genre names
 * @returns {Array} Array of carousel items formatted for TrendingCarousel component
 *   Each item contains: title, id, subtitle, image, description, rating, year, extra (genres)
 */
function useCarouselItems(trendingData, genreMap) {
    const carouselItems = useMemo(() => {
        if (!trendingData?.results) return [];

        return (
            trendingData.results
                .slice(0, 8)
                .map((movie) => ({
                    title: movie.title,
                    id: movie.id,
                    subtitle: movie.tagline,
                    image: movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(movie.title),
                    description: movie.overview,
                    rating: movie.vote_average?.toFixed(1),
                    year: movie.release_date?.slice(0, 4),
                    extra: movie.genre_ids?.map((id) => genreMap[id]) || [],
                })) || []
        );
    }, [trendingData, genreMap]);

    return carouselItems;
}

export default useCarouselItems;
