import { useMemo } from 'react';
import { usePaginatedFetch } from '@/hooks/API/data';
import { useMovieGenres } from '@/hooks/API/genres';

export const useUpcomingMovies = () => {
    const { data: upcomingMoviesData, isLoading: isLoadingMovies, error: moviesError } = usePaginatedFetch('movie/upcoming', 1);
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
        const now = new Date();
        return (upcomingMoviesData?.results || []).filter((m) => new Date(m.release_date) > now);
    }, [upcomingMoviesData]);

    return {
        upcomingMovies,
        isLoadingMovies,
        moviesError,
        movieGenreMap,
    };
};
