import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Search, X, Flame, Star } from 'lucide-react';
import { useSearchOrFallbackContent } from '@/hooks/API/data';
import MovieCard from '@/components/ui/MovieCard';
import TabbedResults from './TabbedResults';
import SkeletonCard from '@/components/ui/skeletonCard';
function SearchInput() {
    const inputRef = useRef(null);
    const modalInputRef = useRef(null);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const navigate = useNavigate();

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

    const { data, isLoading } = useSearchOrFallbackContent(isModalOpen, debouncedSearch);

    const renderCards = (items) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {items.map((item, i) => {
                const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
                const type = mediaType === 'tv' ? 'tv' : 'movie';

                return (
                    <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                        <MovieCard
                            title={item.title || item.name}
                            year={(item.release_date || item.first_air_date)?.split('-')[0]}
                            rating={item.vote_average?.toFixed(1)}
                            genres={[]}
                            image={`https://image.tmdb.org/t/p/w154${item.poster_path}`}
                            onClick={() => {
                                navigate(`/${type}/${item.id}`);
                                setIsModalOpen(false);
                            }}
                            type={type}
                        />
                    </div>
                );
            })}
        </div>
    );

    return (
        <>
            {/* Floating Search Input */}
            <label
                onClick={() => setIsModalOpen(true)}
                className="input input-bordered input-accent w-full max-w-xs sm:max-w-md text-white bg-neutral dark:bg-neutral-content/10 dark:text-white border border-primary focus-within:ring focus-within:ring-blue-500 sticky top-4 z-10 cursor-pointer"
            >
                <Search className="h-[1.2em] opacity-60" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search movies or shows..."
                    className="grow bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 text-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <kbd className="kbd kbd-sm hidden sm:inline-flex">⌘</kbd>
                <kbd className="kbd kbd-sm hidden sm:inline-flex">K</kbd>
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
                            {isLoading && (
                                <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <SkeletonCard key={idx} delay={idx * 0.05} />
                                    ))}
                                </div>
                            )}

                            {debouncedSearch && !isLoading && data?.movies?.length === 0 && data?.tv?.length === 0 && (
                                <p className="text-center text-warning">No results found.</p>
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

                                            {renderCards(data.week.slice(0, 5))}
                                        </div>
                                    )}
                                    {data?.top_rated?.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-base sm:text-lg mb-2">
                                                <Star className="inline w-5 h-5 mr-1 text-yellow-400" />
                                                Top Rated
                                            </h3>
                                            {renderCards(data.top_rated.slice(0, 5))}
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
