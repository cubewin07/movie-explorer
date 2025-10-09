import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/lib/instance';
import { toast } from 'sonner';

// Accepts userId and type (optional)
export default function useAddToWatchlist(token) {
    const queryClient = useQueryClient();

    return useMutation({
        // Accept object with id and type properties
        mutationFn: async ({ id, type }) => {
            console.log('Adding to watchlist:', { id, type });
            const payload = { id, type };
            const res = await instance.post('watchlist', payload);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
            queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
            toast.success(`Added to your watchlist!`);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to add to watchlist. Please try again.');
            console.error(error);
        },
    });
}
