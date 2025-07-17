import { useQueries } from '@tanstack/react-query';
import { fetchMovieDetails, fetchTVDetails } from '@/lib/tmdb';

export default function useWatchlistFilmData(watchlistIds = []) {
    // Convert string IDs to numbers and filter out any invalid values
    const validIds = watchlistIds
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));

    const movieQueries = validIds.map(id => ({
        queryKey: ['movie', id],
        queryFn: () => fetchMovieDetails(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        onError: () => null // Silently fail individual movie fetches
    }));

    const tvQueries = validIds.map(id => ({
        queryKey: ['tv', id],
        queryFn: () => fetchTVDetails(id),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        onError: () => null
    }));

    const results = useQueries({
        queries: [...movieQueries, ...tvQueries]
    });

    const isLoading = results.some(result => result.isLoading);
    const isError = results.every(result => result.isError);

    // Filter and transform the successful results
    const films = results
        .filter(result => result.data)
        .map(result => {
            const data = result.data;
            return {
                id: data.id,
                title: data.title || data.name,
                image: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
                rating: data.vote_average?.toFixed(1),
                year: new Date(data.release_date || data.first_air_date).getFullYear(),
                name: data.name, // for identifying TV shows
                totalSeasons: data.number_of_seasons,
                extra: data.genres?.map(genre => genre.name)
            };
        });

    return {
        films,
        isLoading,
        isError
    };
}
