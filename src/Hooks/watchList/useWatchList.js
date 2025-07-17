import instance from '@/lib/instance';
import { useQuery } from '@tanstack/react-query';

export const watchlistQueryKey = () => ['watchlist'];

export default function useWatchlist() {
    return useQuery({
        queryKey: watchlistQueryKey(),
        queryFn: async () => {
            // Assume backend expects userId and page as query params
            const res = await instance.get('/watchlist/own');
            return res.data; // Should be paginated: { results, page, total_pages, ... }
        },
        keepPreviousData: true,
    });
}
