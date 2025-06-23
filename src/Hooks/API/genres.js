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

export const useUsingBothGenres = (isModalOpen) => {
    const { data, isLoading } = useQuery({
        queryKey: ['search-all', debouncedSearch],
        queryFn: async () => {
            if (!debouncedSearch) {
                const [trending, topRated] = await Promise.all([
                    axiosInstance.get('/trending/all/week'),
                    axiosInstance.get('/movie/top_rated'),
                ]);
                return {
                    movies: [],
                    tv: [],
                    trending: trending.data.results,
                    topRated: topRated.data.results,
                };
            }

            const [movies, tv] = await Promise.all([
                axiosInstance.get(`/search/movie?query=${debouncedSearch}`),
                axiosInstance.get(`/search/tv?query=${debouncedSearch}`),
            ]);
            return {
                movies: movies.data.results,
                tv: tv.data.results,
                trending: [],
                topRated: [],
            };
        },
        enabled: isModalOpen,
    });

    return { data, isLoading };
};
