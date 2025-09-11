import axiosInstance from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';

export const useMovieGenres = () => {
    const { data: MovieGenres, isLoading: isGenresLoading } = useQuery({
        queryKey: ['MovieGenres'],
        queryFn: () =>
            axiosInstance.get('/genre/movie/list', {
                params: { language: 'en-US' },
            }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

    return { MovieGenres, isGenresLoading };
};

export const useTvSeriesGenres = () => {
    const { data: TvSeriesGenresRes, isLoading: isTvSeriesGenreLoading } = useQuery({
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

    return { TvSeriesGenresRes, isTvSeriesGenreLoading };
};

export const useAllGenres = () => {
    const { MovieGenres, isGenresLoading } = useMovieGenres();
    const { TvSeriesGenresRes, isTvSeriesGenreLoading } = useTvSeriesGenres();

    const movieGenres = MovieGenres?.data?.genres || [];
    const tvGenres = TvSeriesGenresRes?.data?.genres || [];

    const isLoading = isGenresLoading || isTvSeriesGenreLoading;

    return {
        movieGenres,
        tvGenres,
        isLoading,
    };
};
