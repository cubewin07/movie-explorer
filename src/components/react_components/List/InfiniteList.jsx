import { motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAllGenres } from '@/hooks/API/genres';
import { FilmModalContext } from '@/context/FilmModalProvider';
import { useInfiniteDiscoverList } from '@/hooks/API/data';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: Math.min(i * 0.02, 0.4),
            duration: 0.4,
            ease: 'easeOut',
        },
    }),
};

const SORT_OPTIONS = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'title', label: 'Title A-Z' },
];

export default function InfiniteList({ type = 'movie', sortBy = 'popularity.desc' }) {
    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteDiscoverList(
        type,
        sortBy,
    );

    const { movieGenres, tvGenres, isLoading: isGenresLoading } = useAllGenres();
    const allGenres = [...movieGenres, ...tvGenres];
    const { setContext, setIsOpen } = useContext(FilmModalContext);

    const sentinelRef = useRef(null);
    const scrollYRef = useRef(0);
    const previousMovieCount = useRef(0);

    const [manualLoad, setManualLoad] = useState(false);
    const [isRenderComplete, setIsRenderComplete] = useState(false);
    const [shouldPreventScroll, setShouldPreventScroll] = useState(false);

    const navigate = useNavigate();

    const movies = data?.pages?.flatMap((p) => p.results) || [];
    const genreMap =
        allGenres.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};

    const isDataLoading = isLoading || isGenresLoading;
    const isPaginating = isFetchingNextPage || manualLoad;
    const hasMovies = movies.length > 0;

    useEffect(() => {
        if (!isRenderComplete || shouldPreventScroll) {
            scrollYRef.current = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollYRef.current}px`;
            document.body.style.width = '100%';
        } else {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollYRef.current);
        }

        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
        };
    }, [isRenderComplete, shouldPreventScroll]);

    useEffect(() => {
        const currentCount = movies?.length;
        const hasNewMovies = currentCount > previousMovieCount.current;

        if ((hasNewMovies || (currentCount > 0 && previousMovieCount.current === 0)) && !isPaginating) {
            setIsRenderComplete(false);
            setShouldPreventScroll(true);
            previousMovieCount.current = currentCount;

            const totalDelay = 800 + Math.min(currentCount, 40) * 20;
            const timeout = setTimeout(() => {
                setIsRenderComplete(true);
                setShouldPreventScroll(false);
            }, totalDelay);

            return () => clearTimeout(timeout);
        }
    }, [movies.length, isPaginating]);

    useEffect(() => {
        if (!hasNextPage || isDataLoading || isPaginating || !isRenderComplete || shouldPreventScroll) return;

        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    fetchNextPage();
                }
            },
            { rootMargin: '100px', threshold: 0.1 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isDataLoading, isPaginating, isRenderComplete, shouldPreventScroll]);

    const handleManualLoad = () => {
        if (isPaginating || isDataLoading || !isRenderComplete || shouldPreventScroll) return;
        setManualLoad(true);
        setIsRenderComplete(false);
        setShouldPreventScroll(true);
        fetchNextPage().finally(() => setManualLoad(false));
    };

    if (isDataLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col justify-center items-center px-4">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Loading Icon */}
                    <motion.div
                        className="relative mb-8"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                    >
                        <div className="relative">
                            <motion.div
                                className="w-16 h-16 border-4 border-gradient-to-r from-blue-500 to-purple-600 border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                style={{
                                    background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6)',
                                    borderRadius: '50%',
                                    padding: '2px'
                                }}
                            >
                                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full"></div>
                            </motion.div>
                            
                            {/* Pulsing rings */}
                            <motion.div
                                className="absolute inset-0 w-16 h-16 border-2 border-blue-300/30 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            />
                            <motion.div
                                className="absolute inset-0 w-16 h-16 border-2 border-purple-300/30 rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.5 }}
                            />
                        </div>
                    </motion.div>
                    
                    {/* Loading Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                            Loading {type === 'movie' ? 'Movies' : 'TV Shows'}
                        </h2>
                        <motion.p 
                            className="text-gray-600 dark:text-gray-400 max-w-md mx-auto"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        >
                            Discovering amazing content for you...
                        </motion.p>
                    </motion.div>
                    
                    {/* Loading dots */}
                    <motion.div 
                        className="flex items-center justify-center gap-2 mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    delay: i * 0.2,
                                    ease: 'easeInOut'
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-red-900/20 flex flex-col justify-center items-center px-4">
                <motion.div
                    className="text-center max-w-md mx-auto"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                >
                    {/* Error Icon */}
                    <motion.div
                        className="relative mb-8"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                    >
                        <div className="relative">
                            <motion.div
                                className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <motion.svg
                                    className="w-10 h-10 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </motion.svg>
                            </motion.div>
                            
                            {/* Pulsing error rings */}
                            <motion.div
                                className="absolute inset-0 w-20 h-20 border-2 border-red-300/30 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                            />
                        </div>
                    </motion.div>
                    
                    {/* Error Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
                            Oops! Something went wrong
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">
                            Failed to load {type === 'movie' ? 'movies' : 'TV shows'}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mb-8">
                            Please check your connection and try again
                        </p>
                    </motion.div>
                    
                    {/* Action Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <motion.button
                            onClick={() => window.location.reload()}
                            className="group px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                            whileHover={{ 
                                scale: 1.05,
                                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.3 }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </motion.svg>
                            Try Again
                        </motion.button>
                        
                        <motion.button
                            onClick={() => navigate('/')}
                            className="group px-6 py-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-200 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-500 transition-all duration-200 flex items-center gap-2"
                            whileHover={{ 
                                scale: 1.05,
                                borderColor: 'rgb(239 68 68)'
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                whileHover={{ x: -2 }}
                                transition={{ duration: 0.2 }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </motion.svg>
                            Go Home
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 sm:py-10 px-2 sm:px-4 md:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="max-w-7xl mx-auto px-0 sm:px-2 md:px-4"
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="sticky top-12 z-30 flex justify-start"
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.button
                        onClick={() => navigate(-1)}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-white/10 transition w-fit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ← Back
                    </motion.button>
                </motion.div>

                <motion.h1
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center sm:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {type === 'movie' ? 'Movies' : 'TV Series'}
                </motion.h1>

                <motion.div
                    className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.08 } },
                    }}
                >
                    {movies.map((movie, i) => (
                        <motion.div
                            key={`movie-${movie.id}`}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            whileHover={{ y: -4 }}
                            className="bg-white dark:bg-slate-800 border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                            onClick={() => {
                                if (!isRenderComplete || shouldPreventScroll) return;
                                setContext({
                                    ...movie,
                                    genres: movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean) || [],
                                });
                                setIsOpen(true);
                            }}
                        >
                            <div className="relative w-full aspect-[2/3] overflow-hidden rounded-t-xl">
                                <div className="absolute top-2 right-2 z-10 bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded shadow-sm">
                                    ⭐ {movie.vote_average?.toFixed(1)}
                                </div>
                                {movie.poster_path ? (
                                    <motion.img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: Math.min(i * 0.015, 0.5) + 0.2, duration: 0.4 }}
                                        loading="lazy"
                                        onError={(e) => (e.target.src = '/placeholder-movie.jpg')}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-10 h-10 mb-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7M3 7a4 4 0 014-4h10a4 4 0 014 4M3 7h18"
                                            />
                                        </svg>
                                        <span className="text-xs">No Image</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    {movie.title || movie.name}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4) || 'TBA'}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {hasNextPage && !isPaginating && isRenderComplete && !shouldPreventScroll && (
                    <motion.div 
                        ref={sentinelRef} 
                        className="h-20 flex items-center justify-center mt-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div 
                            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-full border border-blue-200/50 dark:border-slate-600/50 shadow-sm"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        >
                            <motion.div
                                className="flex gap-1"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.5,
                                            delay: i * 0.2,
                                            ease: 'easeInOut'
                                        }}
                                    />
                                ))}
                            </motion.div>
                            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Scroll for more {type === 'movie' ? 'movies' : 'shows'}...
                            </span>
                        </motion.div>
                    </motion.div>
                )}

                {hasNextPage && (
                    <motion.div 
                        className="flex justify-center mt-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.button
                            onClick={handleManualLoad}
                            disabled={isPaginating || !isRenderComplete || shouldPreventScroll}
                            className={`group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center gap-3 min-w-[160px] ${
                                isPaginating
                                    ? 'cursor-wait'
                                    : !isRenderComplete || shouldPreventScroll
                                      ? 'opacity-60 cursor-not-allowed'
                                      : 'hover:shadow-2xl'
                            }`}
                            whileHover={!isPaginating && (isRenderComplete && !shouldPreventScroll) ? { 
                                scale: 1.05,
                                boxShadow: '0 15px 30px rgba(59, 130, 246, 0.4)'
                            } : {}}
                            whileTap={!isPaginating && (isRenderComplete && !shouldPreventScroll) ? { scale: 0.98 } : {}}
                        >
                            {/* Animated background overlay */}
                            {!isPaginating && (isRenderComplete && !shouldPreventScroll) && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                />
                            )}
                            
                            <div className="relative flex items-center gap-3">
                                {isPaginating ? (
                                    <motion.div
                                        className="relative"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <motion.div
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                        />
                                        <motion.div
                                            className="absolute inset-0 w-5 h-5 border border-white/20 rounded-full"
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        whileHover={{ y: -1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                        />
                                    </motion.svg>
                                )}
                                
                                <motion.span 
                                    className="font-semibold"
                                    animate={isPaginating ? { opacity: [0.7, 1, 0.7] } : {}}
                                    transition={isPaginating ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } : {}}
                                >
                                    {isPaginating
                                        ? 'Loading more...'
                                        : !isRenderComplete || shouldPreventScroll
                                          ? 'Please wait...'
                                          : `Load More ${type === 'movie' ? 'Movies' : 'Shows'}`}
                                </motion.span>
                            </div>
                        </motion.button>
                    </motion.div>
                )}

                {!hasNextPage && hasMovies && isRenderComplete && (
                    <motion.div
                        className="text-center mt-16 mb-8"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    >
                        <motion.div
                            className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl border border-green-200/50 dark:border-slate-600/50 shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.div
                                className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                                initial={{ scale: 0, rotate: -180 }}
                                whileInView={{ scale: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 150 }}
                            >
                                <motion.svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </motion.svg>
                            </motion.div>
                            
                            <div className="text-center">
                                <motion.h3 
                                    className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    All caught up!
                                </motion.h3>
                                <motion.p 
                                    className="text-gray-600 dark:text-gray-400 text-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                >
                                    You've explored all available {type === 'movie' ? 'movies' : 'TV shows'}
                                </motion.p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}
