import instance from '@/lib/instance';
import { useQuery } from '@tanstack/react-query';

export const watchlistQueryKey = (userId, page = 1) => ['watchlist', userId, page];

export default function useWatchlist(userId = null, page = 1) {
    return useQuery({
        queryKey: watchlistQueryKey(userId, page),
        queryFn: async () => {
            // Assume backend expects userId and page as query params
            const res = await instance.get('/watchlist', {
                params: { userId, page },
            });
            return res.data; // Should be paginated: { results, page, total_pages, ... }
        },
        keepPreviousData: true,
    });
}
