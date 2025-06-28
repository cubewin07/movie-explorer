import instance from '@/lib/instance';
import { useQuery } from '@tanstack/react-query';

export const watchlistQueryKey = (userId) => ['watchlist'];

export default function useWatchlist(userId = null) {
    return useQuery({
        queryKey: watchlistQueryKey(userId),
        queryFn: async () => {
            const res = await instance.get('/watchlist');
            return res.data;
        },
    });
}
