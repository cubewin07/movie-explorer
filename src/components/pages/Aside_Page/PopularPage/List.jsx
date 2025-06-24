import { useInfinitePaginatedFetch } from '@/hooks/API/data';
import { useMovieGenres } from '@/hooks/API/genres';
import { useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FilmModalContext } from '@/context/FilmModalProvider';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: Math.min(i * 0.015, 0.5), duration: 0.25, ease: 'easeOut' },
    }),
};

export default function InfiniteList({ url, queryKey }) {
    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePaginatedFetch(
        url,
        queryKey,
    );

    const { MovieGenres, isGenresLoading } = useMovieGenres();
    const { setContext, setIsOpen } = useContext(FilmModalContext);

    const sentinelRef = useRef(null);
    const scrollYRef = useRef(0);
    const [manualLoad, setManualLoad] = useState(false);
    const [isRenderComplete, setIsRenderComplete] = useState(false);
    const [shouldPreventScroll, setShouldPreventScroll] = useState(false);
    const previousMovieCount = useRef(0);

    const movies = data?.pages?.flatMap((p) => p.results) || [];
    const genreMap =
        MovieGenres?.data?.genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};

    const isDataLoading = isLoading || isGenresLoading;
    const isPaginating = isFetchingNextPage || manualLoad;
    const hasMovies = movies.length > 0;

    // Freeze scroll while animating
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

    // Handle render timing
    useEffect(() => {
        const currentMovieCount = movies.length;
        const hasNewMovies = currentMovieCount > previousMovieCount.current;

        if ((hasNewMovies || (currentMovieCount > 0 && previousMovieCount.current === 0)) && !isPaginating) {
            setIsRenderComplete(false);
            setShouldPreventScroll(true);
            previousMovieCount.current = currentMovieCount;

            const totalDelay = 1000 + Math.min(currentMovieCount, 40) * 15; // Max ~850ms
            const timeout = setTimeout(() => {
                setIsRenderComplete(true);
                setShouldPreventScroll(false);
            }, totalDelay);

            return () => clearTimeout(timeout);
        }
    }, [movies.length, isPaginating]);

    // IntersectionObserver for infinite scroll
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
            <div className="min-h-screen flex justify-center items-center">
                <span className="loading loading-bars loading-lg text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen py-10 px-4 text-center text-red-500 font-semibold">
                Failed to load popular movies.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Popular Movies</h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {movies.map((movie, i) => (
                        <motion.div
                            key={`movie-${movie.id}`}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.03 }}
                            className="bg-white dark:bg-slate-800 border rounded-xl shadow-md p-4 cursor-pointer transition-shadow duration-200"
                            onClick={() => {
                                if (!isRenderComplete || shouldPreventScroll) return;
                                setContext({
                                    ...movie,
                                    genres: movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean) || [],
                                });
                                setIsOpen(true);
                            }}
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-64 object-cover rounded mb-2"
                                loading="lazy"
                                onError={(e) => (e.target.src = '/placeholder-movie.jpg')}
                            />
                            <h3 className="text-md font-bold text-gray-900 dark:text-white line-clamp-2">
                                {movie.title}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {movie.release_date?.slice(0, 4) || 'TBA'}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Scroll sentinel */}
                {hasNextPage && !isPaginating && isRenderComplete && !shouldPreventScroll && (
                    <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-8">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Scroll for more movies...</div>
                    </div>
                )}

                {/* Load more button */}
                {hasNextPage && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={handleManualLoad}
                            disabled={isPaginating || !isRenderComplete || shouldPreventScroll}
                            className={`relative btn btn-primary flex items-center justify-center gap-2 ${
                                isPaginating
                                    ? 'opacity-80 cursor-wait'
                                    : !isRenderComplete || shouldPreventScroll
                                      ? 'opacity-60 cursor-not-allowed'
                                      : ''
                            } min-w-[140px] px-6 py-2 rounded-lg transition-all duration-200`}
                        >
                            {isPaginating && (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}
                            <span className="text-sm font-medium">
                                {isPaginating
                                    ? 'Loading...'
                                    : !isRenderComplete || shouldPreventScroll
                                      ? 'Please wait...'
                                      : 'Load More'}
                            </span>
                        </button>
                    </div>
                )}

                {!hasNextPage && hasMovies && isRenderComplete && (
                    <div className="text-center mt-10 text-gray-600 dark:text-gray-400">You've reached the end!</div>
                )}
            </div>
        </div>
    );
}
