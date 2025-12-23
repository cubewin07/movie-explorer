import { useMemo } from 'react';
import useWatchlist from '@/hooks/watchList/useWatchList';
import useWatchlistFilmData from '@/hooks/watchList/useWatchListFilmData';

/**
 * useWatchlistDisplay Hook
 * 
 * Handles data fetching and state management for watchlist display.
 * Consolidates watchlist and film data loading with error handling.
 * 
 * @returns {Object} Watchlist display state and metadata
 * @returns {Array} films - Processed film items from watchlist
 * @returns {boolean} isLoading - Combined loading state
 * @returns {Object|null} error - Combined error state
 * @returns {boolean} isEmpty - Whether watchlist is empty
 */
export function useWatchlistDisplay() {
    const { 
        data: watchlistData, 
        isLoading: isWatchlistLoading, 
        error: watchlistError 
    } = useWatchlist();
    
    const { 
        films, 
        isLoading: isFilmsLoading, 
        error: filmsError 
    } = useWatchlistFilmData(watchlistData);

    // Combined loading state
    const isLoading = useMemo(
        () => isWatchlistLoading || isFilmsLoading,
        [isWatchlistLoading, isFilmsLoading]
    );

    // Combined error state
    const error = useMemo(
        () => watchlistError || filmsError,
        [watchlistError, filmsError]
    );

    // Check if empty
    const isEmpty = useMemo(
        () => !isLoading && films && films.length === 0,
        [isLoading, films]
    );

    return {
        films: films || [],
        isLoading,
        error,
        isEmpty
    };
}

export default useWatchlistDisplay;
