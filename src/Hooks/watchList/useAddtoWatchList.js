import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/lib/instance';
import { toast } from 'sonner';

export default function useAddToWatchlist(userId = null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (movie) => {
            const payload = userId ? { ...movie, userId } : movie;
            const res = await instance.post('/watchlist', payload);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['watchlist', userId] });
            toast.success(`Added "${data.title}" to your watchlist`);
        },
        onError: (error) => {
            toast.error('Failed to add to watchlist. Please try again.');
            console.error(error);
        },
    });
}
