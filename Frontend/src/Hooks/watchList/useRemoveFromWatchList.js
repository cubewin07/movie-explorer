import instance from '@/lib/instance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { watchlistQueryKey } from './useWatchList';

function useRemoveFromWatchList(token) {
    const queryClient = useQueryClient();
        return useMutation({
            mutationFn: async ({ id, type }) => {
                const res = await instance.delete(`/watchlist`, { params: { id, type } });
                return res.data;
            },
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['watchlist'] });
                queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
                console.log(data);
                toast.success(`Removed from your watchlist`);
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || 'Failed to remove from watchlist. Please try again.');
                console.error(error);
            },
        });
}

export default useRemoveFromWatchList;
