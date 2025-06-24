import { useInfinitePaginatedFetch } from '@/hooks/API/data';
import { useMovieGenres } from '@/hooks/API/genres';
import { useContext, useEffect, useRef, useState } from 'react';
import { FilmModalContext } from '@/context/FilmModalProvider';

function InfiniteList({ url, key }) {
    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePaginatedFetch(
        url,
        key,
    );

    const { MovieGenres, isGenresLoading } = useMovieGenres();
    const { setContext, setIsOpen } = useContext(FilmModalContext);
    const [manualLoad, setManualLoad] = useState(false);

    const movies = data?.pages?.flatMap((page) => page.results) || [];
    const genreMap =
        MovieGenres?.data?.genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};

    const sentinelRef = useRef();
    const timeoutRef = useRef();

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || isLoading || isGenresLoading || !hasNextPage) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isFetchingNextPage && !manualLoad) {
                    timeoutRef.current = setTimeout(() => {
                        fetchNextPage();
                    }, 500); // throttle delay
                }
            },
            { threshold: 0.8 },
        );

        observer.observe(sentinel);
        return () => {
            observer.disconnect();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isLoading, isGenresLoading, hasNextPage, isFetchingNextPage, fetchNextPage, manualLoad]);

    const handleManualLoad = () => {
        setManualLoad(true);
        fetchNextPage().finally(() => setManualLoad(false));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Popular Movies</h1>

                {isError && <div className="text-red-500 font-semibold p-4">Failed to load popular movies.</div>}

                {isLoading || isGenresLoading ? (
                    <div className="flex justify-center items-center min-h-[40vh]">
                        <span className="loading loading-bars loading-lg text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {movies.map((movie) => (
                                <div
                                    key={movie.id}
                                    onClick={() => {
                                        setContext({ ...movie, genres: movie.genre_ids.map((id) => genreMap[id]) });
                                        setIsOpen(true);
                                    }}
                                    className="bg-white dark:bg-slate-800 border rounded-xl shadow-md p-4 cursor-pointer"
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full h-64 object-cover rounded mb-2"
                                    />
                                    <h3 className="text-md font-bold text-gray-900 dark:text-white">{movie.title}</h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {movie.release_date?.slice(0, 4)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {hasNextPage && (
                            <>
                                <div ref={sentinelRef} className="h-8 mt-10" />
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={handleManualLoad}
                                        disabled={manualLoad || isFetchingNextPage}
                                        className="btn btn-primary"
                                    >
                                        {manualLoad || isFetchingNextPage ? 'Loading...' : 'Load More'}
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default InfiniteList;
