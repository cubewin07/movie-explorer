import { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchX, Clapperboard, Tv } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Search, X, Flame, Star } from 'lucide-react';
import { useSearchOrFallbackContent } from '@/hooks/API/data';
import MovieCard from '@/components/ui/MovieCard';
import TabbedResults from './TabbedResults';
import SkeletonCard from '@/components/ui/skeletonCard';
import SearchSkeletonItem from '@/components/ui/SearchSkeletonItem';
import { FilmModalContext } from '@/context/FilmModalProvider';
import { useAllGenres } from '@/hooks/API/genres';

function SearchInput() {
    const inputRef = useRef(null);
    const modalInputRef = useRef(null);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const navigate = useNavigate();
    const { setIsOpen, setContext } = useContext(FilmModalContext);
    const openedFromSearchRef = useRef(false);

    const { movieGenres, tvGenres, isLoading: isLoadingGenres, isFetching: isFetchingGenres } = useAllGenres();
    const genreArr = useMemo(() => [...movieGenres, ...tvGenres], [movieGenres, tvGenres]);
    const genreMap = useMemo(
        () =>
            genreArr?.reduce((acc, g) => {
                acc[g.id] = g.name;
                return acc;
            }, {}) || {},
        [genreArr],
    );
    const handleNavigate = (movie) => {
        const isTV = !!movie.name && !movie.title; // Typical way to detect TV
        const path = isTV ? `/tv/${movie.id}` : `/movies/${movie.id}`;
        navigate(path);
    };

    // Debounce user input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Keyboard shortcut
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsModalOpen(true);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Autofocus inside modal
    useEffect(() => {
        if (isModalOpen) {
            setTimeout(() => modalInputRef.current?.focus(), 50);
        }
    }, [isModalOpen]);

    const { data, isLoading, isFetching } = useSearchOrFallbackContent(isModalOpen, debouncedSearch);
    const renderCards = (items, type) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {items.map((item, i) => {
                const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
                const type = mediaType === 'tv' ? 'tv' : 'movie';
                // Prepare genres as array of names if available
                const genres =
                    item.genre_ids && Array.isArray(item.genre_ids)
                        ? item.genre_ids.map((g) => genreMap[g])
                        : [];
                return (
                    <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                        <MovieCard
                            title={item.title || item.name}
                            year={(item.release_date || item.first_air_date)?.split('-')[0]}
                            rating={item.vote_average?.toFixed(1)}
                            genres={genres}
                            image={`https://image.tmdb.org/t/p/w154${item.poster_path}`}
                            onClick={() => {
                                setContext({
                                    id: item.id,
                                    title: item.title,
                                    name: item.name,
                                    original_title: item.original_title,
                                    original_name: item.original_name,
                                    release_date: item.release_date,
                                    first_air_date: item.first_air_date,
                                    genres: genres,
                                    poster_path: item.poster_path,
                                    vote_average: item.vote_average,
                                    vote_count: item.vote_count,
                                    overview: item.overview,
                                    original_language: item.original_language,
                                    image: item.poster_path
                                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                                        : undefined,
                                });
                                setIsOpen(true);
                                setIsModalOpen(false);
                                openedFromSearchRef.current = true;
                            }}
                            type={type}
                        />
                    </div>
                );
            })}
        </div>
    );

    // Listen for film modal close and re-open search modal if needed
    useEffect(() => {
        if (!isModalOpen && openedFromSearchRef.current) {
            // Listen for when film modal closes
            const handleFilmModalClose = () => {
                setIsModalOpen(true);
                openedFromSearchRef.current = false;
            };
            // Attach a one-time event listener to window for modal close
            window.addEventListener('film-modal-close', handleFilmModalClose, { once: true });
            return () => window.removeEventListener('film-modal-close', handleFilmModalClose);
        }
    }, [isModalOpen]);

    return (
        <>
            {/* Floating Search Input */}
            <label
                onClick={() => setIsModalOpen(true)}
                className="input input-bordered w-full max-w-xs sm:max-w-md 
             bg-white text-gray-800 
             dark:bg-gray-900 dark:text-gray-100 
             border border-gray-300 dark:border-gray-600 
             focus-within:ring focus-within:ring-blue-500 
             shadow-sm dark:shadow-md 
             animate-pulse-glow 
             sticky top-4 z-10 cursor-pointer transition"
            >
                <Search className="h-[1.2em] opacity-60 text-gray-500 dark:text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search movies or shows..."
                    className="grow bg-transparent text-gray-800 
               placeholder:text-gray-500 
               dark:text-gray-100 dark:placeholder:text-gray-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <kbd
                    className="kbd kbd-sm hidden sm:inline-flex 
               text-gray-700 bg-gray-100 border border-gray-300 
               dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 shadow-sm"
                >
                    ⌘
                </kbd>
                <kbd
                    className="kbd kbd-sm hidden sm:inline-flex 
               text-gray-700 bg-gray-100 border border-gray-300 
               dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 shadow-sm"
                >
                    K
                </kbd>
            </label>

            {/* Modal Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="w-full max-w-xs sm:max-w-md md:max-w-2xl max-h-[80vh] p-0 overflow-hidden bg-base-100 text-base-content dark:bg-neutral dark:text-white border border-base-300">
                    <div className="flex flex-col h-full">
                        <DialogTitle className="text-base sm:text-lg font-bold border-b border-base-300 p-3 sm:p-4">
                            Search
                        </DialogTitle>

                        {/* Modal Input */}
                        <div className="p-3 sm:p-4 border-b border-base-300 relative">
                            <input
                                ref={modalInputRef}
                                type="text"
                                className="input input-bordered w-full bg-base-200 text-base-content"
                                placeholder="Search movies or TV series..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Search Results */}
                        <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(80vh-120px)] space-y-4 sm:space-y-6">
                            
                            {(isLoading || isFetching || isLoadingGenres || isFetchingGenres) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {Array.from({ length: 6 }).map((_, idx) => (
                                        <SearchSkeletonItem key={idx} delay={idx * 0.05} />
                                    ))}
                                </div>
                            )}

                            {debouncedSearch && !isLoading && data?.movies?.length === 0 && data?.tv?.length === 0 && (
                                <motion.div
                                    className="flex flex-col items-center justify-center py-8 text-warning"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                                >
                                    <motion.div
                                        initial={{ rotate: -10, scale: 0.8 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ duration: 0.5, type: "spring" }}
                                    >
                                        <SearchX className="w-10 h-10 mb-2 opacity-70" />
                                    </motion.div>
                                    <motion.p
                                        className="text-lg font-semibold"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                    >
                                        No results found.
                                    </motion.p>
                                    <motion.span
                                        className="text-sm text-base-content/60 mt-1"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35, duration: 0.3 }}
                                    >
                                        Try a different search term.
                                    </motion.span>
                                </motion.div>
                            )}

                            {/* Tabs for Search Results */}
                            {(data?.movies?.length > 0 || data?.tv?.length > 0) && (
                                <TabbedResults data={data} renderCards={renderCards} />
                            )}

                            {!debouncedSearch && (
                                <>
                                    {data?.week?.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-base sm:text-lg mb-2">
                                                <Flame className="inline w-5 h-5 mr-1 text-orange-500" />
                                                Trending
                                            </h3>

                                            {renderCards(data.week.slice(0, 4))}
                                        </div>
                                    )}
                                    {data?.top_rated?.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-base sm:text-lg mb-2 mt-14">
                                                <Star className="inline w-5 h-5 mr-1 text-yellow-400" />
                                                Top Rated
                                            </h3>
                                            {renderCards(data.top_rated.slice(0, 4))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default SearchInput;
