import instance from '@/lib/instance';
import { useQuery } from '@tanstack/react-query';

export const watchlistQueryKey = () => ['watchlist'];

export default function useWatchlist(options = {}) {
    const { enabled = true, ...queryOptions } = options;

    return useQuery({
        queryKey: watchlistQueryKey(),
        queryFn: async () => {
            // Assume backend expects userId and page as query params
            const res = await instance.get('/watchlist');
            return res.data // Should be paginated: { results, page, total_pages, ... }
        },
        enabled,
        ...queryOptions,
    });
}
