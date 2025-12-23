import { useAuthen } from '@/context/AuthenProvider';
import { useNavigate } from 'react-router-dom';
import useRemoveFromWatchList from '@/hooks/watchList/useRemoveFromWatchList';
import { Button } from '@/components/ui/button';
import { Film } from 'lucide-react';
import { motion } from 'framer-motion';
import ErrorState from '@/components/ui/ErrorState';
import WatchlistGrid from './WatchlistGrid';
import WatchlistEmptyState from './WatchlistEmptyState';
import WatchlistLoadingSkeleton from './WatchlistLoadingSkeleton';
import { useWatchlistDisplay } from './useWatchlistDisplay';

/**
 * WatchlistPage Component
 * 
 * Main watchlist page that displays user's saved films and TV shows.
 * Handles authentication, loading states, errors, and empty state.
 * 
 * Features:
 * - User authentication check
 * - Loading state with skeleton cards
 * - Error handling with user-friendly messages
 * - Empty state with navigation
 * - Film grid with remove functionality
 */
function WatchlistPage() {
    const { user, token } = useAuthen();
    const navigate = useNavigate();
    const { mutate: removeFromWatchList } = useRemoveFromWatchList(token);
    const { films, isLoading, error, isEmpty } = useWatchlistDisplay();

    // Handle removing film from watchlist
    async function handleRemoveFromWatchlist(filmId) {
        await removeFromWatchList({ ...filmId });
    }

    // Not logged in state
    if (!user) {
        return (
            <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="mx-auto mb-6 w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <Film className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <motion.h2 
                    className="text-2xl font-bold mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Welcome to Your Watchlist
                </motion.h2>
                <motion.p 
                    className="text-lg text-muted-foreground mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Please log in to view and manage your personal watchlist.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Button 
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    >
                        Go Home
                    </Button>
                </motion.div>
            </motion.div>
        );
    }

    // Loading state
    if (isLoading) {
        return <WatchlistLoadingSkeleton />;
    }

    // Error state
    if (error) {
        const isNetworkError = error?.code === 'NETWORK_ERROR';
        const isServerError = error?.response?.status >= 500;
        const isAuthError = error?.response?.status === 401;
        
        let errorTitle = "Something Went Wrong";
        let errorMessage = "Failed to load your watchlist";
        let errorSubtitle = "This might be a temporary issue. Please try again.";

        if (isNetworkError) {
            errorTitle = "Connection Problem";
            errorMessage = "Unable to connect to the server";
            errorSubtitle = "Please check your internet connection and try again.";
        } else if (isAuthError) {
            errorTitle = "Authentication Required";
            errorMessage = "Your session may have expired";
            errorSubtitle = "Please log in again to access your watchlist.";
        } else if (isServerError) {
            errorTitle = "Server Error";
            errorMessage = "Our servers are experiencing issues";
            errorSubtitle = "Please try again in a few minutes.";
        }

        return (
            <ErrorState
                title={errorTitle}
                message={errorMessage}
                subtitle={errorSubtitle}
                fullScreen={true}
                onRetry={() => window.location.reload()}
                showHomeButton={true}
            />
        );
    }

    // Main content
    return (
        <section className="px-2 sm:px-4 md:px-8 py-8 max-w-screen-xl mx-auto min-h-[80vh]">
            <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                Your Watchlist
            </motion.h1>

            {isEmpty ? (
                <WatchlistEmptyState />
            ) : (
                <WatchlistGrid 
                    films={films} 
                    onRemove={handleRemoveFromWatchlist}
                />
            )}
        </section>
    );
}

export default WatchlistPage;
