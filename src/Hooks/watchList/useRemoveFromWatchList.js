import instance from '@/lib/instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { watchlistQueryKey } from './useWatchList';

function useRemoveFromWatchList(userId = null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await instance.delete(`/watchlist/${id}`);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
            toast.success(`Removed "${data.title || data.name}" from your watchlist`);
        },
        onError: (error) => {
            toast.error('Failed to remove from watchlist. Please try again.');
            console.error(error);
        },
    });
}

export default useRemoveFromWatchList;
