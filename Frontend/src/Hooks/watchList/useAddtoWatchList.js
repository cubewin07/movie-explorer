import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/lib/instance';
import { toast } from 'sonner';
import { watchlistQueryKey } from './useWatchList';
import { useRecommendationFreshnessContext } from '@/context/RecommendationFreshnessProvider';

function pickIds(payload) {
    if (!Array.isArray(payload)) {
        return [];
    }
    return payload
        .map((item) => {
            const type = String(item?.type || '').toUpperCase() === 'SERIES' ? 'SERIES' : 'MOVIE';
            const id = Number(item?.filmId);
            return Number.isInteger(id) && id > 0 ? `${type}:${id}` : null;
        })
        .filter(Boolean)
        .sort();
}

// Accepts userId and type (optional)
export default function useAddToWatchlist(token) {
    const queryClient = useQueryClient();
    const freshnessContext = useRecommendationFreshnessContext();

    return useMutation({
        mutationKey: ['watchlist', 'add'],
        // Accept object with id and type properties
        mutationFn: async ({ id, type }) => {
            const payload = { id, type };
            const res = await instance.post('watchlist', payload);
            return res.data;
        },
        onMutate: async ({ id, type }) => {
            await queryClient.cancelQueries({ queryKey: watchlistQueryKey() });
            const previous = queryClient.getQueryData(watchlistQueryKey());

            if (previous) {
                const isMovie = type === 'MOVIE';
                const listKey = isMovie ? 'moviesId' : 'seriesId';
                const currentIds = Array.isArray(previous?.[listKey]) ? previous[listKey] : [];
                const exists = currentIds.includes(id);
                if (!exists) {
                    const updated = {
                        ...previous,
                        [listKey]: [...currentIds, id],
                    };
                    queryClient.setQueryData(watchlistQueryKey(), updated);
                }
            }

            return { previous };
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: watchlistQueryKey() });
            queryClient.invalidateQueries({ queryKey: ['memberRecommendations'] });
            queryClient.invalidateQueries({ queryKey: ['userInfo', token] });

            // Get current recommendations IDs from React Query cache
            const recData = queryClient.getQueryData(['memberRecommendations']) || [];
            const currentIds = pickIds(recData);

            freshnessContext.registerWatchlistAdd(
                variables.id,
                variables.type,
                variables.title || null,
                currentIds
            );

            toast.success('Added to watchlist', {
                description: 'The engine will digest this and refresh your picks.',
            });
        },
        onError: (error, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(watchlistQueryKey(), context.previous);
            }
            const msg = error?.response?.data?.message || '';
            if (/already|exist/i.test(msg)) {
                // Silently handle duplicates without error styling
                toast.info('Already in your watchlist.');
                return;
            }
            toast.error(msg || 'Failed to add to watchlist. Please try again.');
            console.error(error);
        },
    });
}
