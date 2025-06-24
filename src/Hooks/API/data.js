import axiosInstance from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';

export const usePopularMovies = (page) => {
    const { data: popularMovies, isLoading: isPopularMoviesLoading } = useQuery({
        queryKey: ['popularMovies'],
        queryFn: () =>
            axiosInstance.get('/movie/popular', {
                params: { language: 'en-US', page: page },
            }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

    return { popularMovies, isPopularMoviesLoading };
};

export const usePopularTvSeries = () => {
    const { data: PopularTvSeriesRes, isLoading: LoadingPopularTvSeries } = useQuery({
        queryKey: ['popularTvSeries'],
        queryFn: () => {
            return axiosInstance.get('/tv/popular', {
                params: {
                    language: 'en-US',
                    page: 1,
                },
            });
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

    return { PopularTvSeriesRes, LoadingPopularTvSeries };
};

export const useSearchOrFallbackContent = (
    isModalOpen,
    debouncedSearch,
    fallbackEndpoints = ['trending/all/week', 'movie/top_rated'],
) => {
    const { data, isLoading } = useQuery({
        queryKey: ['search-or-fallback', debouncedSearch],
        enabled: isModalOpen,
        queryFn: async () => {
            if (!debouncedSearch) {
                const fallbackResults = await Promise.all(
                    fallbackEndpoints.map((endpoint) => axiosInstance.get(`/${endpoint}`)),
                );

                const fallbackData = {};
                fallbackEndpoints.forEach((key, index) => {
                    const label = key.split('/').pop();
                    fallbackData[label] = fallbackResults[index]?.data?.results || [];
                });

                return {
                    movies: [],
                    tv: [],
                    ...fallbackData,
                };
            }

            const [movies, tv] = await Promise.all([
                axiosInstance.get(`/search/movie?query=${debouncedSearch}`),
                axiosInstance.get(`/search/tv?query=${debouncedSearch}`),
            ]);

            return {
                movies: movies.data.results,
                tv: tv.data.results,
            };
        },
    });

    return { data, isLoading };
};
