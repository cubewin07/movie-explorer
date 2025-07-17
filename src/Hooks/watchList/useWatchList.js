import instance from '@/lib/instance';
import { useQuery } from '@tanstack/react-query';

export const watchlistQueryKey = ( page = 1) => ['watchlist', page];

export default function useWatchlist( page = 1) {
    return useQuery({
        queryKey: watchlistQueryKey( page),
        queryFn: async () => {
            // Assume backend expects userId and page as query params
            const res = await instance.get('/watchlist', {
                params: { page },
            });
            return res.data; // Should be paginated: { results, page, total_pages, ... }
        },
        keepPreviousData: true,
    });
}
