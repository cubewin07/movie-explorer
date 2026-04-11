import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/instance';

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
    } = useQuery({
        queryKey: ['memberRecommendations'],
        enabled,
        queryFn: async ({ signal }) => {
            const { data } = await instance.get('/recommendations', { signal });
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 3,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    return {
        memberRecommendations,
        isLoadingMemberRecommendations,
        isErrorMemberRecommendations,
    };
};
