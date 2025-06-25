import { motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useInfinitePaginatedFetch } from '@/hooks/API/data';
import { useAllGenres } from '@/hooks/API/genres';
import { FilmModalContext } from '@/context/FilmModalProvider';

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

export default function InfiniteList({ url, queryKey, type }) {
    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePaginatedFetch(
        url,
        queryKey,
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
        const currentMovieCount = movies.length;
        const hasNewMovies = currentMovieCount > previousMovieCount.current;

        if ((hasNewMovies || (currentMovieCount > 0 && previousMovieCount.current === 0)) && !isPaginating) {
            setIsRenderComplete(false);
            setShouldPreventScroll(true);
            previousMovieCount.current = currentMovieCount;

            const totalDelay = 800 + Math.min(currentMovieCount, 40) * 20;
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
            <div className="min-h-screen flex justify-center items-center animate-pulse">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"
                />
            </div>
        );
    }

    if (isError) {
        return (
            <motion.div
                className="min-h-screen py-10 px-4 text-center text-red-500 font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {`Failed to load popular ${type}`}
            </motion.div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-10 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="sticky top-6 z-30 flex justify-end">
                    <motion.button
                        onClick={() => navigate(-1)}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-white/10 transition w-fit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ← Back
                    </motion.button>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center sm:text-left">{`Popular ${type}`}</h1>

                <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
                    {movies.map((movie, i) => (
                        <motion.div
                            key={`movie-${movie.id}`}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
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
                                <motion.img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: Math.min(i * 0.015, 0.5) + 0.2, duration: 0.4 }}
                                    loading="lazy"
                                    onError={(e) => (e.target.src = '/placeholder-movie.jpg')}
                                />
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
                </div>

                {hasNextPage && !isPaginating && isRenderComplete && !shouldPreventScroll && (
                    <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-8">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Scroll for more movies...</div>
                    </div>
                )}

                {hasNextPage && (
                    <div className="flex justify-center mt-8">
                        <motion.button
                            onClick={handleManualLoad}
                            disabled={isPaginating || !isRenderComplete || shouldPreventScroll}
                            className={`relative btn btn-primary flex items-center justify-center gap-2 shadow-md ${
                                isPaginating
                                    ? 'opacity-80 cursor-wait'
                                    : !isRenderComplete || shouldPreventScroll
                                      ? 'opacity-60 cursor-not-allowed'
                                      : ''
                            } min-w-[140px] px-6 py-2 rounded-lg transition-all duration-300`}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isPaginating && (
                                <motion.span
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                />
                            )}
                            <span className="text-sm font-medium">
                                {isPaginating
                                    ? 'Loading...'
                                    : !isRenderComplete || shouldPreventScroll
                                      ? 'Please wait...'
                                      : 'Load More'}
                            </span>
                        </motion.button>
                    </div>
                )}

                {!hasNextPage && hasMovies && isRenderComplete && (
                    <motion.div
                        className="text-center mt-10 text-gray-600 dark:text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        You've reached the end!
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}
