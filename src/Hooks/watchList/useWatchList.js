import instance from '@/lib/instance';
import { useQuery } from '@tanstack/react-query';

export default function useWatchlist(userId = null) {
    return useQuery({
        queryKey: ['watchlist', userId],
        queryFn: async () => {
            const res = await instance.get('/watchlist');
            return res.data;
        },
    });
}
