import { useAuthen } from '@/context/AuthenProvider';
import { useNavigate } from 'react-router-dom';
import useWatchlist from '@/hooks/watchList/useWatchList';
import { Button } from '@/components/ui/button';
import { Film, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useRemoveFromWatchList from '@/hooks/watchList/useRemoveFromWatchList';
import { useState } from 'react';
import useWatchlistFilmData from '@/hooks/watchList/useWatchListFilmData';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import SkeletonCard from '@/components/ui/skeletonCard';
import WatchlistCard from '@/components/ui/WatchlistCard';

function WatchlistPage() {
    const { user, token } = useAuthen();
    const navigate = useNavigate(); 
    const { mutate: removeFromWatchList } = useRemoveFromWatchList(token);

    const { data: watchlistData, isLoading: isWatchlistLoading, error: watchlistError } = useWatchlist();
    const { films, isLoading: isFilmsLoading, error: filmsError } = useWatchlistFilmData(watchlistData);

    const isLoading = isWatchlistLoading || isFilmsLoading;
    const hasError = watchlistError || filmsError;

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

    // Loading state - using LoadingState component with skeleton cards
    if (isLoading) {
        return (
            <div className="px-2 sm:px-4 md:px-8 py-8">
                <LoadingState
                    title="Loading Your Watchlist"
                    subtitle="Fetching your favorite movies and TV shows..."
                    fullScreen={false}
                    transparentBg={true}
                    className="!h-auto !min-h-0 !bg-transparent mb-8"
                />
                
                {/* Skeleton Cards Grid */}
                <div className="max-w-screen-xl mx-auto">
                    <div className="grid gap-3 xs:gap-4 sm:gap-5 md:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {[...Array(12)].map((_, i) => (
                            <SkeletonCard
                                key={i}
                                delay={i}
                                variant="movie"
                                animation="shimmer"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state - using ErrorState component
    if (hasError) {
        const error = watchlistError || filmsError;
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

            {films.length === 0 ? (
                <motion.div 
                    className="text-center py-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="mx-auto mb-6 w-24 h-24 bg-muted rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <div className="flex items-center gap-2">
                            <Film className="w-8 h-8 text-muted-foreground" />
                            <Tv className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </motion.div>
                    
                    <motion.h3 
                        className="text-xl font-semibold mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Your Watchlist is Empty
                    </motion.h3>
                    
                    <motion.p 
                        className="text-muted-foreground mb-6 max-w-md mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Start building your personal collection by adding movies and TV shows you want to watch.
                    </motion.p>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button 
                            onClick={() => navigate('/movies')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                        >
                            Discover Movies & TV Shows
                        </Button>
                    </motion.div>
                </motion.div>
            ) : (
                <div className="grid gap-3 xs:gap-4 sm:gap-5 md:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    <AnimatePresence>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: {
                                        staggerChildren: 0.1,
                                    },
                                },
                            }}
                            className="contents"
                        >
                            {films.map((item) => (
                                <WatchlistCard
                                    key={item.id}
                                    item={item}
                                    onRemove={(film) => handleRemoveFromWatchlist(film)}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </section>
    );
}

export default WatchlistPage;