import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search as SearchIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '@/components/ui/MovieCard';
import axiosInstance from '@/lib/axiosInstance';

function SearchInput() {
    const inputRef = useRef(null);
    const modalInputRef = useRef(null);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const navigate = useNavigate();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Keyboard shortcut (⌘K or Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setIsModalOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus on modal input when opened
    useEffect(() => {
        if (isModalOpen) {
            setTimeout(() => modalInputRef.current?.focus(), 50);
        }
    }, [isModalOpen]);

    // Main search query
    const { data, isLoading } = useQuery({
        queryKey: ['search-all', debouncedSearch],
        queryFn: async () => {
            if (!debouncedSearch) {
                const [trending, topRated] = await Promise.all([
                    axiosInstance.get('/trending/all/week'),
                    axiosInstance.get('/movie/top_rated'),
                ]);
                return {
                    movies: [],
                    tv: [],
                    trending: trending.data.results,
                    topRated: topRated.data.results,
                };
            }

            const [movies, tv] = await Promise.all([
                axiosInstance.get(`/search/movie?query=${debouncedSearch}`),
                axiosInstance.get(`/search/tv?query=${debouncedSearch}`),
            ]);
            return {
                movies: movies.data.results,
                tv: tv.data.results,
                trending: [],
                topRated: [],
            };
        },
        enabled: isModalOpen,
    });

    // Render cards
    const renderCards = (items, type) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item, i) => (
                <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <MovieCard
                        title={item.title || item.name}
                        year={(item.release_date || item.first_air_date)?.split('-')[0]}
                        rating={item.vote_average?.toFixed(1)}
                        genres={[]} // Add genre names here if needed later
                        image={`https://image.tmdb.org/t/p/w154${item.poster_path}`}
                        onClick={() => navigate(`/${type}/${item.id}`)}
                        type={type}
                    />
                </div>
            ))}
        </div>
    );

    return (
        <>
            {/* Static Search Input Bar */}
            <label
                onClick={() => setIsModalOpen(true)}
                className="input input-accent border border-primary text-white bg-slate-800 animate-pulse-glow sticky top-4 cursor-pointer"
            >
                <SearchIcon className="h-[1em] opacity-50" />
                <input
                    type="search"
                    className="grow bg-transparent placeholder:text-gray-400 text-white"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    ref={inputRef}
                />
                <kbd className="kbd kbd-sm">⌘</kbd>
                <kbd className="kbd kbd-sm">K</kbd>
            </label>

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden">
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Search</h2>
                        </div>

                        {/* Input with clear icon */}
                        <div className="p-4 border-b relative">
                            <input
                                ref={modalInputRef}
                                className="w-full h-10 pl-4 pr-10 rounded border bg-background text-foreground"
                                placeholder="Search movies or TV series..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Search Results */}
                        <div className="p-4 overflow-y-auto max-h-[calc(80vh-100px)] space-y-6">
                            {isLoading && (
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, idx) => (
                                        <div key={idx} className="flex items-center gap-4 animate-pulse">
                                            <div className="w-[100px] h-[150px] bg-gray-300 rounded" />
                                            <div className="space-y-2 w-full">
                                                <div className="w-1/2 h-4 bg-gray-300 rounded" />
                                                <div className="w-3/4 h-3 bg-gray-200 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* No Results */}
                            {debouncedSearch && !isLoading && data?.movies?.length === 0 && data?.tv?.length === 0 && (
                                <p className=" text-center text-warning">No results found.</p>
                            )}

                            {/* Movies */}
                            {data?.movies?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">🎬 Movies</h3>
                                    {renderCards(data.movies, 'movie')}
                                </div>
                            )}

                            {/* TV Shows */}
                            {data?.tv?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">📺 TV Series</h3>
                                    {renderCards(data.tv, 'tv')}
                                </div>
                            )}

                            {/* Trending / Top Rated (when no search) */}
                            {!debouncedSearch && (
                                <>
                                    {data?.trending?.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-2">🔥 Trending</h3>
                                            {renderCards(data.trending.slice(0, 5), 'movie')}
                                        </div>
                                    )}
                                    {data?.topRated?.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-2 mt-6">⭐ Top Rated</h3>
                                            {renderCards(data.topRated.slice(0, 5), 'movie')}
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
