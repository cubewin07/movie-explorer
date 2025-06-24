import { useInfinitePaginatedFetch } from '@/hooks/API/data';
import { useMovieGenres } from '@/hooks/API/genres';
import { useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilmModalContext } from '@/context/FilmModalProvider';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
    }),
};

export default function InfiniteList({ url, queryKey }) {
    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePaginatedFetch(
        url,
        queryKey,
    );

    const { MovieGenres, isGenresLoading } = useMovieGenres();
    const { setContext, setIsOpen } = useContext(FilmModalContext);

    const [manualLoad, setManualLoad] = useState(false);
    const [isRenderComplete, setIsRenderComplete] = useState(false);
    const [shouldPreventScroll, setShouldPreventScroll] = useState(false);

    console.log('isRenderComplete:', isRenderComplete, 'shouldPreventScroll:', shouldPreventScroll);

    const sentinelRef = useRef();
    const containerRef = useRef();
    const gridRef = useRef();
    const latestBatchRef = useRef([]);
    const renderCount = useRef(0);
    const expectedAnimationsRef = useRef(0);
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

    // Preserve scroll position and prevent only scroll-triggered pagination
    const scrollPositionRef = useRef(0);

    useEffect(() => {
        const shouldLock = !isRenderComplete || shouldPreventScroll;

        if (shouldLock) {
            // Store current scroll position
            scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;

            // Disable scroll events but don't hide content
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPositionRef.current}px`;
            document.body.style.width = '100%';
        } else {
            // Restore scroll position
            const scrollY = scrollPositionRef.current;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
        }

        return () => {
            // Cleanup on unmount
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
        };
    }, [isRenderComplete, shouldPreventScroll]);

    // Track when new movies are added and setup animation tracking
    useEffect(() => {
        const currentMovieCount = movies.length;
        const hasNewMovies = currentMovieCount > previousMovieCount.current;

        if (hasNewMovies && !isPaginating) {
            // Calculate how many new movies were added
            const newMoviesCount = currentMovieCount - previousMovieCount.current;
            const lastPage = data.pages[data.pages.length - 1];
            const newBatchIds = lastPage?.results?.map((m) => m.id) || [];

            if (newBatchIds.length > 0) {
                latestBatchRef.current = newBatchIds;
                expectedAnimationsRef.current = newBatchIds.length;
                renderCount.current = 0;

                // Prevent scrolling and set render incomplete
                setShouldPreventScroll(true);
                setIsRenderComplete(false);

                console.log('New batch detected:', {
                    newMoviesCount,
                    batchSize: newBatchIds.length,
                    totalMovies: currentMovieCount,
                });
            }

            previousMovieCount.current = currentMovieCount;
        }

        // Handle initial load case
        if (currentMovieCount > 0 && previousMovieCount.current === 0 && !isPaginating) {
            const allMovieIds = movies.map((m) => m.id);
            latestBatchRef.current = allMovieIds;
            expectedAnimationsRef.current = allMovieIds.length;
            renderCount.current = 0;
            setShouldPreventScroll(true);
            setIsRenderComplete(false);
            previousMovieCount.current = currentMovieCount;

            console.log('Initial load detected:', {
                totalMovies: currentMovieCount,
            });
        }
    }, [movies.length, isPaginating, data?.pages?.length]);

    // Enhanced infinite scroll observer - only active when render is complete
    useEffect(() => {
        if (!hasNextPage || isDataLoading || isPaginating || !isRenderComplete || shouldPreventScroll) {
            return;
        }

        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && isRenderComplete && !shouldPreventScroll) {
                    console.log('Intersection detected - fetching next page');
                    fetchNextPage();
                }
            },
            {
                rootMargin: '100px 0px', // Reduced margin to prevent premature loading
                threshold: 0.1,
            },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isDataLoading, isPaginating, isRenderComplete, shouldPreventScroll, fetchNextPage]);

    const handleManualLoad = () => {
        if (isPaginating || isDataLoading || !isRenderComplete || shouldPreventScroll) {
            console.log('Manual load blocked:', {
                isPaginating,
                isDataLoading,
                isRenderComplete,
                shouldPreventScroll,
            });
            return;
        }

        setShouldPreventScroll(true);
        setIsRenderComplete(false);
        setManualLoad(true);

        fetchNextPage().finally(() => {
            setManualLoad(false);
        });
    };

    const handleAnimationComplete = (movieId) => {
        // Only count animations for movies in the latest batch
        if (!latestBatchRef.current.includes(movieId)) return;

        renderCount.current += 1;
        console.log(
            `Animation complete for movie ${movieId}. Count: ${renderCount.current}/${expectedAnimationsRef.current}`,
        );

        if (renderCount.current >= expectedAnimationsRef.current) {
            // Add a small delay to ensure all DOM updates are complete
            setTimeout(() => {
                setIsRenderComplete(true);
                setShouldPreventScroll(false);
                console.log('All animations complete - scrolling enabled');
            }, 100);
        }
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
        <div
            ref={containerRef}
            className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-10 px-4"
        >
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Popular Movies</h1>

                <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {movies.map((movie, i) => {
                        const isInLatestBatch = latestBatchRef.current.includes(movie.id);
                        return (
                            <motion.div
                                key={`movie-${movie.id}`}
                                custom={isInLatestBatch ? i : 0}
                                variants={
                                    isInLatestBatch
                                        ? cardVariants
                                        : { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
                                }
                                initial={isInLatestBatch ? 'hidden' : 'visible'}
                                animate="visible"
                                whileHover={{ scale: 1.03 }}
                                className="bg-white dark:bg-slate-800 border rounded-xl shadow-md p-4 cursor-pointer transition-shadow duration-200"
                                onAnimationComplete={() => handleAnimationComplete(movie.id)}
                                onClick={() => {
                                    // Only allow clicks when render is complete
                                    if (!isRenderComplete || shouldPreventScroll) return;

                                    setContext({
                                        ...movie,
                                        genres: movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean) || [],
                                    });
                                    setIsOpen(true);
                                }}
                                style={{
                                    // Ensure consistent height during animation
                                    minHeight: '320px',
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
                        );
                    })}
                </div>

                {/* Loading state for new movies - only show when actively fetching */}
                {isPaginating && (
                    <div className="flex justify-center items-center mt-6 py-6">
                        <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 rounded-lg px-6 py-3 shadow-md border">
                            <span className="loading loading-spinner loading-md text-primary" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Loading more movies...
                            </span>
                        </div>
                    </div>
                )}

                {/* Subtle indicator when movies are rendering (not fetching) */}
                {!isPaginating && !isRenderComplete && hasMovies && (
                    <div className="flex justify-center items-center mt-4 py-2">
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-xs">Preparing new content...</span>
                        </div>
                    </div>
                )}

                {/* Scroll sentinel - only visible when ready */}
                {hasNextPage && !isPaginating && isRenderComplete && !shouldPreventScroll && (
                    <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-8">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Scroll for more movies...</div>
                    </div>
                )}

                {/* Manual load button - shows loading state but stays in place */}
                {hasNextPage && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={handleManualLoad}
                            disabled={isPaginating || !isRenderComplete || shouldPreventScroll}
                            className={`btn btn-primary ${
                                isPaginating
                                    ? 'loading'
                                    : !isRenderComplete || shouldPreventScroll
                                      ? 'opacity-60 cursor-not-allowed'
                                      : ''
                            } min-w-[140px] transition-all duration-200`}
                        >
                            {isPaginating
                                ? 'Loading...'
                                : !isRenderComplete || shouldPreventScroll
                                  ? 'Please wait...'
                                  : 'Load More'}
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
