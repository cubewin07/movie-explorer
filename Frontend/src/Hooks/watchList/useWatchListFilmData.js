import { useQueries } from '@tanstack/react-query';
import { fetchMovieDetails, fetchTVDetails } from '@/lib/tmdb';

export default function useWatchlistFilmData(watchlistData = null) {
    // Extract movies and tv_shows from the Spring backend response format
    // Spring backend returns { moviesId: [], seriesId: [] }
    const movies = watchlistData?.moviesId || [];
    const tvShows = watchlistData?.seriesId || [];
    
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
    
    // Execute all queries
    const results = useQueries({
        queries: [...movieQueries, ...tvQueries]
    });
    
    // Process results
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
                type: isTV ? 'tv' : 'movie',
                overview: data.overview,
                genres: data.genres?.map(g => g.name) || [],
                totalSeasons: data?.number_of_seasons || 0,
            };
        });

    return {
        films,
        isLoading: results.some(result => result.isLoading),
        isError: results.every(result => result.isError) && results.length > 0
    };
}
