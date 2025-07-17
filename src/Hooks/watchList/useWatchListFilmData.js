import { useQueries } from '@tanstack/react-query';
import { fetchMovieDetails, fetchTVDetails } from '@/lib/tmdb';

export default function useWatchlistFilmData(watchlistIds = []) {
    const validIds = watchlistIds
        .map(id => ({
            id: parseInt(id),
            type: id.startsWith('tv_') ? 'tv' : 'movie' // Assuming IDs are prefixed with 'tv_' for TV shows
        }))
        .filter(item => !isNaN(item.id));

    const queries = validIds.map(({ id, type }) => ({
        queryKey: [type, id],
        queryFn: () => type === 'tv' ? fetchTVDetails(id) : fetchMovieDetails(id),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        onError: () => null
    }));

    const results = useQueries({
        queries
    });

    const isLoading = results.some(result => result.isLoading);
    const isError = results.every(result => result.isError);

    const films = results
        .filter(result => result.data)
        .map(result => {
            const data = result.data;
            return {
                id: data.id,
                title: data.title || data.name,
                image: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
                rating: data.vote_average?.toFixed(1),
                year: new Date(data.release_date || data.first_air_date).getFullYear(),
                name: data.name,
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
