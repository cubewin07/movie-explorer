import axiosInstance from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';

export const useMovieGenres = () => {
    const { data: MovieGenres, isLoading: isGenresLoading, isFetching: isGenresFetching } = useQuery({
        queryKey: ['MovieGenres'],
        queryFn: () =>
            axiosInstance.get('/genre/movie/list', {
                params: { language: 'en-US' },
            }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

    return { MovieGenres, isGenresLoading, isGenresFetching };
};

export const useTvSeriesGenres = () => {
    const { data: TvSeriesGenresRes, isLoading: isTvSeriesGenreLoading, isFetching: isTvSeriesGenreFetching } = useQuery({
        queryKey: ['tvSeriesGenres'],
        queryFn: () => {
            return axiosInstance.get('/genre/tv/list', {
                params: {
                    language: 'en-US',
                },
            });
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

    return { TvSeriesGenresRes, isTvSeriesGenreLoading, isTvSeriesGenreFetching };
};

export const useAllGenres = () => {
    const { MovieGenres, isGenresLoading, isGenresFetching } = useMovieGenres();
    const { TvSeriesGenresRes, isTvSeriesGenreLoading, isTvSeriesGenreFetching } = useTvSeriesGenres();

    const movieGenres = MovieGenres?.data?.genres || [];
    const tvGenres = TvSeriesGenresRes?.data?.genres || [];

    const isLoading = isGenresLoading || isTvSeriesGenreLoading;
    const isFetching = isGenresFetching || isTvSeriesGenreFetching;

    return {
        movieGenres,
        tvGenres,
        isLoading,
        isFetching,
    };
};
