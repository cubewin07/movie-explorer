import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/lib/instance';
import { toast } from 'sonner';

// Accepts userId and type (optional)
export default function useAddToWatchlist(userId = null, type = 'movie') {
    const queryClient = useQueryClient();

    return useMutation({
        // Only accept id (and type)
        mutationFn: async (id) => {
            const payload = userId ? { id: id.toString(), userId, type } : { id: id.toString(), type };
            const res = await instance.post('/watchlist', payload);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['watchlist', userId] });
            toast.success(`Added to your watchlist!`);
        },
        onError: (error) => {
            toast.error('Failed to add to watchlist. Please try again.');
            console.error(error);
        },
    });
}
