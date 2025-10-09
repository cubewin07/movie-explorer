import { useAuthen } from '@/context/AuthenProvider';
import { useNavigate } from 'react-router-dom';
import useWatchlist from '@/hooks/watchList/useWatchList';
import { Button } from '@/components/ui/button';
import { Loader, AlertCircle, Wifi, RefreshCw, Film, Tv, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useRemoveFromWatchList from '@/hooks/watchList/useRemoveFromWatchList';
import { useState } from 'react';
import useWatchlistFilmData from '@/hooks/watchList/useWatchListFilmData';

function WatchlistPage() {
    const { user, setRefresh } = useAuthen();
    const navigate = useNavigate(); 
    const { mutate: removeFromWatchList } = useRemoveFromWatchList();
    const [page, setPage] = useState(1);

    const { data: watchlistData, isLoading: isWatchlistLoading, error: watchlistError } = useWatchlist();
    const { films, isLoading: isFilmsLoading, error: filmsError } = useWatchlistFilmData(watchlistData);

    const isLoading = isWatchlistLoading || isFilmsLoading;
    const hasError = watchlistError || filmsError;

    async function handleRemoveFromWatchlist(event, filmId) {
        event.stopPropagation();
        await removeFromWatchList({ ...filmId });
        setRefresh(true);
    }

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
                    <div className="grid gap-3 xs:gap-4 sm:gap-5 md:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="bg-card rounded-xl overflow-hidden border border-border shadow-md"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                            >
                                <div className="w-full h-64 sm:h-56 md:h-60 lg:h-64 bg-muted animate-pulse relative">
                                    <div className="absolute top-3 left-3">
                                        <div className="h-5 bg-black/30 rounded-full w-16 animate-pulse"></div>
                                    </div>
                                    <div className="absolute bottom-3 right-3">
                                        <div className="h-5 bg-yellow-400/30 rounded-full w-12 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="h-5 bg-muted rounded animate-pulse"></div>
                                    <div className="h-3 bg-muted rounded w-1/4 animate-pulse"></div>
                                    <div className="flex gap-2 pt-1">
                                        <div className="h-5 bg-blue-100/30 rounded-full w-16 animate-pulse"></div>
                                        <div className="h-5 bg-blue-100/30 rounded-full w-14 animate-pulse"></div>
                                    </div>
                                    <div className="h-8 mt-2 bg-muted/30 rounded w-full animate-pulse"></div>
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
                                                scale: 1.02,
                                                transition: { duration: 0.15, ease: "easeOut" },
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            exit={{
                                                opacity: 0,
                                                y: 50,
                                                scale: 0.8,
                                                transition: { duration: 0.2 },
                                            }}
                                            onClick={() => navigate(redirectPath)}
                                            className="group relative bg-card border border-border rounded-xl overflow-hidden flex flex-col cursor-pointer shadow-md hover:shadow-xl"
                                        >
                                            {/* Gradient overlay for image only */}
                                            <div className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10 pointer-events-none"></div>
                                            
                                            {/* Quick action overlay - centered play button on image only */}
                                            <div className="absolute inset-x-0 top-0 h-64 sm:h-56 md:h-60 lg:h-64 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20 pointer-events-none">
                                                <div className="bg-black/60 backdrop-blur-sm p-2.5 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                            
                                            {/* Floating badges */}
                                            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-30">
                                                <span className="bg-black/80 text-white text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium backdrop-blur-sm">
                                                    {isTVSeries ? 'TV Series' : 'Movie'}
                                                </span>
                                            </div>

                                            {isTVSeries && item.totalSeasons && (
                                                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30">
                                                    <span className="bg-blue-600/90 text-white text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium backdrop-blur-sm shadow-lg">
                                                        {item.totalSeasons} Seasons
                                                    </span>
                                                </div>
                                            )}

                                            <div className="relative overflow-hidden">
                                                <img
                                                    src={item.image || '/placeholder.svg'}
                                                    alt={displayTitle}
                                                    className="w-full h-64 sm:h-56 md:h-60 lg:h-64 object-cover transition-transform duration-700 hover:scale-110"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                                
                                                {/* Rating badge positioned over image */}
                                                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-30">
                                                    <span className="flex items-center gap-0.5 sm:gap-1 bg-yellow-400/90 text-black text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg backdrop-blur-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        {item.rating}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-grow relative z-30">
                                                <div className="flex items-start gap-2">
                                                    <h3 className="text-sm sm:text-base font-bold line-clamp-2 flex-grow">
                                                        {displayTitle}
                                                    </h3>
                                                </div>

                                                <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">{item.year}</div>

                                                <div className="flex gap-1 sm:gap-1.5 flex-wrap mt-0.5 sm:mt-1">
                                                    {item.extra?.slice(0, 3).map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-blue-100/80 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full transition-colors duration-200 hover:bg-blue-200 dark:hover:bg-blue-800/70"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {item.extra?.length > 3 && (
                                                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                            +{item.extra.length - 3}
                                                        </span>
                                                    )}
                                                </div>

                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="relative z-40"
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="group/btn mt-auto text-[10px] sm:text-xs py-1 sm:py-2 h-auto w-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 transition-all duration-200 relative overflow-hidden border-red-200 dark:border-red-800/50 hover:border-red-400 dark:hover:border-red-600 hover:shadow-lg hover:shadow-red-500/20"
                                                        onClick={(e) => {
                                                            handleRemoveFromWatchlist(e, {
                                                                id: item.id,
                                                                type: item.type === 'tv' ? 'SERIES' : 'MOVIE'
                                                            });
                                                        }}
                                                    >
                                                        {/* Animated background shine effect */}
                                                        <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-red-200/30 dark:via-red-400/20 to-transparent"></span>
                                                        
                                                        <span className="flex items-center gap-1 sm:gap-1.5 relative z-10">
                                                            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500 group-hover/btn:text-red-600 dark:group-hover/btn:text-red-400" />
                                                            <span className="font-medium">Remove</span>
                                                        </span>
                                                    </Button>
                                                </motion.div>
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