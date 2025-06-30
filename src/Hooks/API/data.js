import axiosInstance from '@/lib/axiosInstance';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export const usePopularMovies = (page) => {
    const {
        data: popularMovies,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['popularMovies', page],
        queryFn: ({ signal }) =>
            axiosInstance
                .get('/movie/popular', {
                    params: { language: 'en-US', page },
                    signal,
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
        queryFn: ({ signal }) =>
            axiosInstance
                .get('/tv/popular', {
                    params: {
                        language: 'en-US',
                        page: page,
                    },
                    signal,
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
        queryFn: async ({ signal }) => {
            const res = await axiosInstance.get(`/${url}`, {
                params: { language: 'en-US', page },
                signal,
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
        queryKey: ['search-multi', debouncedSearch],
        enabled: isModalOpen,
        queryFn: async ({ signal }) => {
            if (!debouncedSearch) {
                const fallbackResults = await Promise.all(
                    fallbackEndpoints.map((endpoint) => axiosInstance.get(`/${endpoint}`, { signal })),
                );
                const fallbackData = {};
                fallbackEndpoints.forEach((key, i) => {
                    const label = key.split('/').pop();
                    fallbackData[label] = fallbackResults[i]?.data?.results || [];
                });
                return { movies: [], tv: [], ...fallbackData };
            }

            const { data: results } = await axiosInstance.get(`/search/multi?query=${debouncedSearch}`, { signal });

            const movies = results.results.filter((item) => item.media_type === 'movie');
            const tv = results.results.filter((item) => item.media_type === 'tv');

            return { movies, tv };
        },
    });

    return { data, isLoading };
};

export const useInfinitePaginatedFetch = (url, key) => {
    return useInfiniteQuery({
        queryKey: [key],
        queryFn: async ({ pageParam = 1, signal }) => {
            const res = await axiosInstance.get(`/${url}`, {
                params: {
                    language: 'en-US',
                    page: pageParam,
                },
                signal,
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
        queryFn: async ({ signal }) => {
            const res = await axiosInstance.get(`/movie/${id}`, { signal });
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
        queryFn: async ({ signal }) => {
            const { data } = await axiosInstance.get(`/movie/${id}/videos`, {
                params: { language: 'en-US' },
                signal,
            });

            const trailer = data.results.find((video) => video.type === 'Trailer' && video.site === 'YouTube');

            return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
        },
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    return { trailerUrl, isLoading, isError };
};

export const useTVSeriesDetails = (id) => {
    const {
        data: series,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['tvSeriesDetails', id],
        enabled: !!id,
        queryFn: async ({ signal }) => {
            const { data } = await axiosInstance.get(`/tv/${id}`, {
                params: { append_to_response: 'credits,seasons,similar' },
                signal,
            });
            return data;
        },
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    return { series, isLoading, isError };
};

export const useTVSeriesTrailer = (id) => {
    const {
        data: trailerUrl,
        isLoading: isLoadingTrailer,
        isError,
    } = useQuery({
        queryKey: ['tvSeriesTrailer', id],
        enabled: !!id,
        queryFn: async ({ signal }) => {
            const { data } = await axiosInstance.get(`/tv/${id}/videos`, {
                params: { language: 'en-US' },
                signal,
            });

            const trailer = data.results.find((video) => video.type === 'Trailer' && video.site === 'YouTube');

            return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
        },
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    return { trailerUrl, isLoadingTrailer, isError };
};

export const useSeasonDetails = (tvId, seasonNumber, enabled = true) => {
    const { data, isLoading } = useQuery({
        queryKey: ['seasonDetails', tvId, seasonNumber],
        queryFn: async ({ signal }) => {
            const { data } = await axiosInstance.get(`/tv/${tvId}/season/${seasonNumber}`, { signal });
            return data.episodes || [];
        },
        enabled,
        staleTime: 1000 * 60 * 10,
    });

    return { episodes: data, isLoading };
};

// New hooks for enhanced home page
export const useFeaturedContent = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['featuredContent'],
        queryFn: async ({ signal }) => {
            // Get trending movies for the week to use as featured content
            const { data } = await axiosInstance.get('/trending/movie/week', {
                params: { language: 'en-US' },
                signal,
            });
            return data.results[0]; // Return the top trending movie as featured
        },
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    return { featuredContent: data, isLoading, isError };
};

export const useNewReleases = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['newReleases'],
        queryFn: async ({ signal }) => {
            // Get movies released in the current year, sorted by popularity
            const currentYear = new Date().getFullYear();
            const { data } = await axiosInstance.get('/discover/movie', {
                params: {
                    language: 'en-US',
                    sort_by: 'popularity.desc',
                    primary_release_year: currentYear,
                    page: 1,
                },
                signal,
            });
            return data.results.slice(0, 8); // Return top 8 new releases
        },
        staleTime: 1000 * 60 * 15,
        refetchOnWindowFocus: false,
    });

    return { newReleases: data, isLoading, isError };
};

export const useTopRatedMovies = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['topRatedMovies'],
        queryFn: async ({ signal }) => {
            const { data } = await axiosInstance.get('/movie/top_rated', {
                params: { language: 'en-US', page: 1 },
                signal,
            });
            return data.results.slice(0, 8); // Return top 8 rated movies
        },
        staleTime: 1000 * 60 * 20,
        refetchOnWindowFocus: false,
    });

    return { topRatedMovies: data, isLoading, isError };
};

export const usePopularTVShows = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['popularTVShows'],
        queryFn: async ({ signal }) => {
            const { data } = await axiosInstance.get('/tv/popular', {
                params: { language: 'en-US', page: 1 },
                signal,
            });
            return data.results.slice(0, 8); // Return top 8 popular TV shows
        },
        staleTime: 1000 * 60 * 15,
        refetchOnWindowFocus: false,
    });

    return { popularTVShows: data, isLoading, isError };
};

export const useMovieCredits = (id) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['movie-credits', id],
        enabled: !!id,
        queryFn: async ({ signal }) => {
            const { data } = await axiosInstance.get(`/movie/${id}/credits`, { signal });
            return data;
        },
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });
    return { credits: data, isLoading, isError };
};
