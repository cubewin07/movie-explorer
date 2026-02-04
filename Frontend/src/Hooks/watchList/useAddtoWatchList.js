import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/lib/instance';
import { toast } from 'sonner';
import { watchlistQueryKey } from './useWatchList';

// Accepts userId and type (optional)
export default function useAddToWatchlist(token) {
    const queryClient = useQueryClient();

    return useMutation({
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: watchlistQueryKey() });
            queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
            toast.success('Added to your watchlist!');
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
