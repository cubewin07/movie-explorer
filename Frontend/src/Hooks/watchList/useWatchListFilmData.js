import { useQueries } from '@tanstack/react-query';
import { fetchMovieDetails, fetchTVDetails } from '@/lib/tmdb';

export default function useWatchlistFilmData(watchlistData = null) {
    // Extract movies and tv_shows from the watchlist data structure
    const movies = watchlistData?.movies || [];
    const tvShows = watchlistData?.tv_shows || [];
    
    // Create queries for movies
    const movieQueries = movies.map(movieId => ({
        queryKey: ['movie', movieId],
        queryFn: () => fetchMovieDetails(movieId),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        onError: () => null,
        enabled: !!movieId
    }));
    
    // Create queries for TV shows
    const tvQueries = tvShows.map(tvId => ({
        queryKey: ['tv', tvId],
        queryFn: () => fetchTVDetails(tvId),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        onError: () => null,
        enabled: !!tvId
    }));

    return {
        movieQueries,
        tvQueries,
        isLoading: movieQueries.some(q => q.isLoading) || tvQueries.some(q => q.isLoading),
        isError: movieQueries.every(q => q.isError) && tvQueries.every(q => q.isError)
    };
}
