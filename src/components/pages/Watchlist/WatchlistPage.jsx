import { useAuthen } from '@/context/AuthenProvider';
import { useNavigate } from 'react-router-dom';
import useWatchlist from '@/hooks/watchList/useWatchList';
import { Button } from '@/components/ui/button';
import { Loader, AlertCircle, Wifi, RefreshCw, Film, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useRemoveFromWatchList from '@/hooks/watchList/useRemoveFromWatchList';
import { useState } from 'react';
import useWatchlistFilmData from '@/hooks/watchList/useWatchListFilmData';

function WatchlistPage() {
    const { user } = useAuthen();
    const navigate = useNavigate();
    const { mutate: removeFromWatchList } = useRemoveFromWatchList();
    const [page, setPage] = useState(1);

    const { data: watchlistData, isLoading: isWatchlistLoading, error: watchlistError } = useWatchlist();
    const { films, isLoading: isFilmsLoading, isError: filmsError } = useWatchlistFilmData(watchlistData);

    const isLoading = isWatchlistLoading || isFilmsLoading;
    const hasError = watchlistError || filmsError;

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

    if (isLoading) {
        return (
            <motion.div 
                className="flex flex-col items-center justify-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <motion.div
                    className="relative mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                </motion.div>
                
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-xl font-semibold mb-2">Loading Your Watchlist</h3>
                    <p className="text-muted-foreground">Fetching your favorite movies and TV shows...</p>
                </motion.div>
                
                {/* Loading skeleton */}
                <motion.div 
                    className="mt-12 w-full max-w-6xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="bg-card rounded-xl overflow-hidden border border-border shadow-sm"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                            >
                                <div className="w-full h-56 bg-muted animate-pulse"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-muted rounded-full w-16 animate-pulse"></div>
                                        <div className="h-6 bg-muted rounded-full w-20 animate-pulse"></div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    if (hasError) {
        const isNetworkError = watchlistError?.code === 'NETWORK_ERROR' || filmsError?.code === 'NETWORK_ERROR';
        const isServerError = watchlistError?.response?.status >= 500 || filmsError?.response?.status >= 500;
        const isAuthError = watchlistError?.response?.status === 401 || filmsError?.response?.status === 401;
        
        return (
            <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="mx-auto mb-6 w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    {isNetworkError ? (
                        <Wifi className="w-10 h-10 text-red-600 dark:text-red-400" />
                    ) : (
                        <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    )}
                </motion.div>
                
                <motion.h2 
                    className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {isNetworkError ? 'Connection Problem' : 
                     isAuthError ? 'Authentication Required' :
                     isServerError ? 'Server Error' : 'Something Went Wrong'}
                </motion.h2>
                
                <motion.p 
                    className="text-muted-foreground mb-6 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {isNetworkError ? 'Please check your internet connection and try again.' :
                     isAuthError ? 'Your session may have expired. Please log in again.' :
                     isServerError ? 'Our servers are experiencing issues. Please try again in a few minutes.' :
                     'Failed to load your watchlist. This might be a temporary issue.'}
                </motion.p>
                
                <motion.div
                    className="flex gap-4 justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                    
                    <Button 
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    >
                        Go Home
                    </Button>
                </motion.div>
                
                {/* Error details for debugging */}
                {process.env.NODE_ENV === 'development' && (
                    <motion.details 
                        className="mt-8 text-left max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                            Error Details (Development)
                        </summary>
                        <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify({ watchlistError, filmsError }, null, 2)}
                        </pre>
                    </motion.details>
                )}
            </motion.div>
        );
    }

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
                <>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                                {films.map((item) => {
                                    const isTVSeries = !!item.name;
                                    const displayTitle = item.title || item.name;
                                    const redirectPath = isTVSeries ? `/tv/${item.id}` : `/movie/${item.id}`;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            variants={{
                                                hidden: { opacity: 0, y: 50, scale: 0.9 },
                                                visible: {
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                    transition: {
                                                        type: 'spring',
                                                        stiffness: 300,
                                                        damping: 24,
                                                    },
                                                },
                                            }}
                                            whileHover={{
                                                scale: 1.05,
                                                rotate: -0.2,
                                                transition: { type: 'spring', stiffness: 200 },
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 50,
                                                scale: 0.8,
                                                transition: { duration: 0.2 },
                                            }}
                                            onClick={() => navigate(redirectPath)}
                                            className="relative bg-card border border-border rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all"
                                        >
                                            {/* Floating badges */}
                                            <div className="absolute top-2 left-2 z-10">
                                                <span className="bg-black/80 text-white text-[10px] px-2 py-0.5 rounded">
                                                    {isTVSeries ? 'TV Series' : 'Movie'}
                                                </span>
                                            </div>

                                            {isTVSeries && item.totalSeasons && (
                                                <div className="absolute top-2 right-2 z-10">
                                                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow-sm">
                                                        {item.totalSeasons} Seasons
                                                    </span>
                                                </div>
                                            )}

                                            <img
                                                src={item.image || '/placeholder.svg'}
                                                alt={displayTitle}
                                                className="w-full h-56 object-cover"
                                            />

                                            <div className="p-4 flex flex-col gap-2 flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base font-bold truncate flex-grow">
                                                        {displayTitle}
                                                    </h3>
                                                    <span className="flex-shrink-0 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                                                        ★ {item.rating}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-muted-foreground">{item.year}</div>

                                                <div className="flex gap-2 flex-wrap">
                                                    {item.extra?.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="mt-auto text-xs hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-800 dark:hover:text-white transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFromWatchList(item.id);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </>
            )}
        </section>
    );
}

export default WatchlistPage;
