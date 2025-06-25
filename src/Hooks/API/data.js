import axiosInstance from '@/lib/axiosInstance';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export const usePopularMovies = (page) => {
    const {
        data: popularMovies,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['popularMovies', page],
        queryFn: () =>
            axiosInstance
                .get('/movie/popular', {
                    params: { language: 'en-US', page },
                })
                .then((res) => res.data),
        keepPreviousData: true,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 1000 * 60 * 5, // 5 mins
    });

    return { popularMovies, isLoading, isError };
};

export const usePopularTvSeries = (page) => {
    const {
        data: popularTvSeries,
        isLoading: isLoadingPopularTvSeries,
        isError,
    } = useQuery({
        queryKey: ['popularTvSeries', page],
        queryFn: () =>
            axiosInstance
                .get('/tv/popular', {
                    params: {
                        language: 'en-US',
                        page: page,
                    },
                })
                .then((res) => res.data),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 1000 * 60 * 5, // or Infinity if truly static
        keepPreviousData: true,
    });

    return { popularTvSeries, isLoadingPopularTvSeries, isError };
};

export const usePaginatedFetch = (url, page) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: [url, page],
        queryFn: async () => {
            const res = await axiosInstance.get(`/${url}`, {
                params: { language: 'en-US', page },
            });
            return res.data;
        },
        keepPreviousData: true,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 1000 * 60 * 5,
    });

    return { data, isLoading, isError };
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

export const useInfinitePaginatedFetch = (url, key) => {
    return useInfiniteQuery({
        queryKey: [key],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await axiosInstance.get(`/${url}`, {
                params: {
                    language: 'en-US',
                    page: pageParam,
                },
            });
            return res.data;
        },
        getNextPageParam: (lastPage) => {
            const { page, total_pages } = lastPage;
            if (page < total_pages && page < 500) return page + 1;
            return undefined;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
    });
};

export const useMovieDetails = (id) => {
    const {
        data: movie,
        isLoading,
        isError,
    } = useQuery({
        queryKey: [id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/movie/${id}`);
            return res.data;
        },
    });

    return { movie, isLoading, isError };
};

export const useMovieTrailer = (id) => {
    const {
        data: trailerUrl,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['movieTrailer', id],
        enabled: !!id,
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/movie/${id}/videos`, {
                params: { language: 'en-US' },
            });

            const trailer = data.results.find((video) => video.type === 'Trailer' && video.site === 'YouTube');

            return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
        },
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    return { trailerUrl, isLoading, isError };
};
