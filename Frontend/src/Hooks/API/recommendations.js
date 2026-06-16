import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/instance';
import axiosInstance from '@/lib/axiosInstance';

export const useSimilarRecommendations = (filmId, type, enabled = true) => {
    const normalizedFilmId = Number(filmId);
    const isValidFilmId = Number.isInteger(normalizedFilmId) && normalizedFilmId > 0;

    const {
        data: similarItems = [],
        isLoading: isLoadingSimilar,
        isError: isErrorSimilar,
    } = useQuery({
        queryKey: ['similarRecommendations', normalizedFilmId, type],
        enabled: enabled && isValidFilmId && !!type,
        queryFn: async ({ signal }) => {
            const { data } = await instance.get('/recommendations/similar', {
                params: {
                    filmId: normalizedFilmId,
                    type,
                },
                signal,
            });

            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    return {
        similarItems,
        isLoadingSimilar,
        isErrorSimilar,
    };
};

export const useMemberRecommendations = (enabled = true) => {
    const {
        data: memberRecommendations = [],
        isLoading: isLoadingMemberRecommendations,
        isError: isErrorMemberRecommendations,
        isFetching: isFetchingMemberRecommendations,
    } = useQuery({
        queryKey: ['memberRecommendations'],
        enabled,
        queryFn: async ({ signal }) => {
            const { data } = await instance.get('/recommendations', { signal });
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 5,
        retry: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    return {
        memberRecommendations,
        isLoadingMemberRecommendations,
        isErrorMemberRecommendations,
        isFetchingMemberRecommendations,
    };
};

export const useTmdbRecommendations = (filmId, type, enabled = true) => {
    const normalizedFilmId = Number(filmId);
    const isValidFilmId = Number.isInteger(normalizedFilmId) && normalizedFilmId > 0;

    const {
        data: similarItems = [],
        isLoading: isLoadingSimilar,
        isError: isErrorSimilar,
    } = useQuery({
        queryKey: ['tmdbRecommendations', normalizedFilmId, type],
        enabled: enabled && isValidFilmId && !!type,
        queryFn: async ({ signal }) => {
            const isTv = type === 'SERIES' || type === 'TV' || type === 'tv';
            const endpoint = isTv
                ? `/tv/${normalizedFilmId}/recommendations`
                : `/movie/${normalizedFilmId}/recommendations`;

            const { data } = await axiosInstance.get(endpoint, {
                params: { language: 'en-US' },
                signal,
            });

            return Array.isArray(data?.results) ? data.results : [];
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    return {
        similarItems,
        isLoadingSimilar,
        isErrorSimilar,
    };
};
