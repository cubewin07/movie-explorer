import { useMemo } from 'react';
import { usePaginatedFetch } from '@/hooks/API/data';
import { useMovieGenres } from '@/hooks/API/genres';

export const useUpcomingMovies = () => {
    const { data: upcomingMoviesData, isLoading: isLoadingMovies, error: moviesError } = usePaginatedFetch(
        'movie/upcoming',
        1,
        { region: import.meta.env.VITE_TMDB_REGION || 'US' },
    );
    const { MovieGenres } = useMovieGenres();

    const movieGenreMap = useMemo(() => {
        return (
            MovieGenres?.data?.genres?.reduce((acc, g) => {
                acc[g.id] = g.name;
                return acc;
            }, {}) || {}
        );
    }, [MovieGenres]);

    const upcomingMovies = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return (upcomingMoviesData?.results || []).filter((m) => (m.release_date || '') >= today);
    }, [upcomingMoviesData]);

    return {
        upcomingMovies,
        isLoadingMovies,
        moviesError,
        movieGenreMap,
    };
};
