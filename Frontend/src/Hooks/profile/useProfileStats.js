import { useMemo } from 'react';

/**
 * Custom hook to calculate user profile statistics
 * @param {Object} authUser - Authenticated user data
 * @returns {Object} User statistics including watchlist, reviews, and favorites
 */
export function useProfileStats(authUser) {
    const stats = useMemo(() => {
        if (!authUser) {
            return {
                watchlist: 0,
                reviews: 0,
                favorites: 0,
            };
        }

        const watchlistQuantity = [
            ...(authUser?.watchlist?.moviesId || []),
            ...(authUser?.watchlist?.seriesId || [])
        ].length || 0;

        return {
            watchlist: watchlistQuantity,
            reviews: authUser?.reviews?.length || 0,
            favorites: authUser?.favorites?.length || 0,
        };
    }, [authUser?.watchlist?.moviesId, authUser?.watchlist?.seriesId, authUser?.reviews, authUser?.favorites]);

    return stats;
}
