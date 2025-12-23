import { useMemo } from 'react';
import {
    useFeaturedContent,
    useNewReleases,
    useTopRatedMovies,
    usePopularTVShows,
    usePaginatedFetch,
} from '@/hooks/API/data';
import { useMovieGenres } from '@/hooks/API/genres';

/**
 * Custom hook for managing home page data fetching and loading states
 * Encapsulates API calls for featured content, releases, ratings, and genres
 * 
 * @returns {Object} Home page data state
 *   - featuredContent: Featured movie/show object
 *   - newReleases: Array of new release items
 *   - topRatedMovies: Array of top rated movies
 *   - popularTVShows: Array of popular TV shows
 *   - trendingData: Trending content data
 *   - MovieGenres: Genre data with mapping
 *   - isLoading: Combined loading state for all data
 *   - isAnyLoading: Boolean indicating if any data is loading
 */
function useHomePageData() {
    const { featuredContent, isLoading: isFeaturedLoading } = useFeaturedContent();
    const { newReleases, isLoading: isNewReleasesLoading } = useNewReleases();
    const { topRatedMovies, isLoading: isTopRatedLoading } = useTopRatedMovies();
    const { popularTVShows, isLoading: isPopularTVLoading } = usePopularTVShows();
    const { data: trendingData, isLoading: isTrendingLoading } = usePaginatedFetch('trending/movie/week', 1);
    const { MovieGenres, isGenresLoading } = useMovieGenres();

    // Check if all data is still loading
    const isAnyLoading = useMemo(() => {
        return (
            isFeaturedLoading ||
            isNewReleasesLoading ||
            isTopRatedLoading ||
            isPopularTVLoading ||
            isTrendingLoading ||
            isGenresLoading
        );
    }, [
        isFeaturedLoading,
        isNewReleasesLoading,
        isTopRatedLoading,
        isPopularTVLoading,
        isTrendingLoading,
        isGenresLoading,
    ]);

    // Create genre map for easy lookup
    const genreMap = useMemo(() => {
        return (
            MovieGenres?.data?.genres?.reduce((acc, g) => {
                acc[g.id] = g.name;
                return acc;
            }, {}) || {}
        );
    }, [MovieGenres]);

    return {
        featuredContent,
        newReleases,
        topRatedMovies,
        popularTVShows,
        trendingData,
        MovieGenres,
        genreMap,
        isAnyLoading,
        isLoading: isAnyLoading,
    };
}

export default useHomePageData;
