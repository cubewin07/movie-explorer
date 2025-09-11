import { useQueries } from '@tanstack/react-query';
import { fetchMovieDetails, fetchTVDetails } from '@/lib/tmdb';

export default function useWatchlistFilmData(watchlistData = null) {
    // Extract movies and tv_shows from the watchlist data structure
    const movies = watchlistData?.watchlist?.movies || [];
    const tvShows = watchlistData?.watchlist?.tv_shows || [];
    
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
    
    // Combine all queries
    const queries = [...movieQueries, ...tvQueries];

    const results = useQueries({
        queries
    });

    const isLoading = results.some(result => result.isLoading);
    const isError = results.every(result => result.isError);

    const films = results
        .filter(result => result.data)
        .map(result => {
            const data = result.data;
            const isTV = !!data.name; // TV shows have 'name', movies have 'title'
            
            return {
                id: data.id,
                title: data.title || data.name,
                image: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
                rating: data.vote_average?.toFixed(1),
                year: new Date(data.release_date || data.first_air_date).getFullYear(),
                name: data.name, // For TV shows
                totalSeasons: data.number_of_seasons, // For TV shows
                extra: data.genres?.map(genre => genre.name),
                type: isTV ? 'tv' : 'movie' // Add type for easier identification
            };
        });

    return {
        films,
        isLoading,
        isError
    };
}
