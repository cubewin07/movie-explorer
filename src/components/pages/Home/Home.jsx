import { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, ArrowRight, Flame, CalendarDays, Star as StarIcon, Tv } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TrendingCarousel } from '@/components/TrendingCarousel';
import { useMovieGenres } from '@/hooks/API/genres';
import {
    useFeaturedContent,
    useNewReleases,
    useTopRatedMovies,
    usePopularTVShows,
    usePaginatedFetch,
} from '@/hooks/API/data';
import { FilmModalContext } from '@/context/FilmModalProvider';
import { useAuthen } from '@/context/AuthenProvider';
import { LoginNotificationModal } from '@/components/react_components/Modal/LoginNotificationModal';
import useAddToWatchlist from '@/hooks/watchList/useAddtoWatchList';

function Home() {
    const navigate = useNavigate();
    const { setIsOpen, setContext } = useContext(FilmModalContext);
    const { user } = useAuthen();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [addingId, setAddingId] = useState(null);

    // Fetch data using new hooks
    const { featuredContent, isLoading: isFeaturedLoading } = useFeaturedContent();
    const { newReleases, isLoading: isNewReleasesLoading } = useNewReleases();
    const { topRatedMovies, isLoading: isTopRatedLoading } = useTopRatedMovies();
    const { popularTVShows, isLoading: isPopularTVLoading } = usePopularTVShows();
    const { data: trendingData, isLoading: isTrendingLoading } = usePaginatedFetch('trending/movie/week', 1);
    const { MovieGenres, isGenresLoading } = useMovieGenres();
    const { mutate: addToWatchlist } = useAddToWatchlist(user?.email, 'movie');

    const genreMap =
        MovieGenres?.data?.genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};

    // Create carousel items for trending carousel
    const carouselItems =
        trendingData?.results?.slice(0, 8).map((movie) => ({
            title: movie.title,
            id: movie.id,
            subtitle: movie.tagline,
            image: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(movie.title),
            description: movie.overview,
            rating: movie.vote_average?.toFixed(1),
            year: movie.release_date?.slice(0, 4),
            extra: movie.genre_ids?.map((id) => genreMap[id]) || [],
        })) || [];

    const handleAddToWatchlist = (item) => {
        if (!user) {
            setSelectedItem(item);
            setShowLoginModal(true);
            return;
        }
        setAddingId(item.id);
        addToWatchlist(item.id, {
            onSettled: () => setAddingId(null),
        });
    };

    const handleLoginSuccess = () => {
        if (selectedItem) {
            setAddingId(selectedItem.id);
            addToWatchlist(selectedItem.id, {
                onSettled: () => setAddingId(null),
            });
            setSelectedItem(null);
        }
    };

    const renderMovieCard = (movie, type = 'movie', index = 0) => {
        const genreNames = movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean) || [];

        return (
            <motion.div
                key={movie.id}
                className="w-[180px] md:w-[200px] flex-shrink-0 relative bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col overflow-hidden group cursor-pointer"
                whileHover={{ y: -4, scale: 1.03 }}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.08 * index }}
                onClick={() => {
                    setContext({ ...movie, genres: genreNames });
                    setIsOpen(true);
                }}
            >
                <div className="relative h-72 overflow-hidden">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title || movie.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow">
                        ★ {movie.vote_average?.toFixed(1)}
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                    <div className="flex flex-col flex-grow min-h-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {movie.title || movie.name}
                        </h3>
                        <motion.div
                            className="flex flex-wrap gap-1"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: { staggerChildren: 0.08 },
                                },
                            }}
                        >
                            {genreNames.slice(0, 2).map((name, idx) => (
                                <motion.span
                                    key={name + idx}
                                    className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.1 * idx }}
                                >
                                    {name}
                                </motion.span>
                            ))}
                        </motion.div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4)}
                    </span>
                </div>
            </motion.div>
        );
    };

    const renderSection = (title, items, isLoading, icon, viewAllPath) => {
        const scrollRef = useRef(null);
        const [isHovered, setIsHovered] = useState(false);
        const [canScrollLeft, setCanScrollLeft] = useState(false);
        const [canScrollRight, setCanScrollRight] = useState(true);

        // Check scroll position
        const checkScroll = () => {
            const el = scrollRef.current;
            if (!el) return;
            setCanScrollLeft(el.scrollLeft > 0);
            setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
        };

        // Scroll by one card width
        const scrollBy = (dir) => {
            const el = scrollRef.current;
            if (!el) return;
            const card = el.querySelector('div[class*="w-[180px]"]') || el.querySelector('div[class*="w-[200px]"]');
            const cardWidth = card ? card.offsetWidth + 16 : 200; // 16px gap-x-4
            el.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
        };

        // Listen for scroll events
        const handleScroll = () => checkScroll();

        return (
            <section className="mb-12">
                <motion.div
                    className="flex items-center justify-between mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {icon} {title}
                    </h2>
                    <motion.button
                        onClick={() => navigate(viewAllPath)}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors flex items-center gap-1"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </motion.div>
                <div
                    className="relative group"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Scrollable Row */}
                    <div
                        ref={scrollRef}
                        className="flex flex-nowrap overflow-x-auto gap-x-4 py-2 scrollbar-hide scroll-smooth"
                        onScroll={handleScroll}
                    >
                        {isLoading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                  <motion.div
                                      key={i}
                                      className="w-[180px] md:w-[200px] h-80 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse flex-shrink-0"
                                  />
                              ))
                            : items?.map((item, idx) => renderMovieCard(item, 'movie', idx))}
                    </div>
                    {/* Left Button */}
                    <button
                        type="button"
                        onClick={() => scrollBy(-1)}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-full p-2 shadow transition-all duration-200
                            ${isHovered ? (canScrollLeft ? 'opacity-100' : 'opacity-50 grayscale cursor-not-allowed') : 'opacity-0 pointer-events-none'}
                            ${isHovered && canScrollLeft ? 'hover:-translate-x-1' : ''}
                        `}
                        style={{ transition: 'opacity 0.2s, transform 0.2s' }}
                        disabled={!canScrollLeft}
                        tabIndex={-1}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    {/* Right Button */}
                    <button
                        type="button"
                        onClick={() => scrollBy(1)}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-full p-2 shadow transition-all duration-200
                            ${isHovered ? (canScrollRight ? 'opacity-100' : 'opacity-50 grayscale cursor-not-allowed') : 'opacity-0 pointer-events-none'}
                            ${isHovered && canScrollRight ? 'hover:translate-x-1' : ''}
                        `}
                        style={{ transition: 'opacity 0.2s, transform 0.2s' }}
                        disabled={!canScrollRight}
                        tabIndex={-1}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </section>
        );
    };

    return (
        <div className="w-full max-w-screen-xl mx-auto flex flex-col gap-8 px-2 sm:px-4 md:px-8 ">
            {/* Featured Hero Banner */}
            {featuredContent && !isFeaturedLoading && (
                <section className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden mb-8 shadow-xl">
                    <div className="absolute inset-0">
                        <img
                            src={`https://image.tmdb.org/t/p/original${featuredContent.backdrop_path}`}
                            alt={featuredContent.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent dark:from-slate-950/90 dark:via-slate-900/60 dark:to-transparent" />
                    </div>
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="max-w-2xl">
                            <motion.h1
                                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                {featuredContent.title}
                            </motion.h1>
                            <motion.p
                                className="text-white/90 text-sm sm:text-base mb-6 line-clamp-3 drop-shadow"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                {featuredContent.overview}
                            </motion.p>
                            <motion.div
                                className="flex flex-col sm:flex-row gap-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <Button
                                    onClick={() => navigate(`/movie/${featuredContent.id}`)}
                                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 shadow-lg"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <Play className="w-4 h-4 mr-2" /> Watch Now
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleAddToWatchlist(featuredContent)}
                                    className="
                                        border-black text-black bg-white 
                                        hover:from-blue-500 hover:to-cyan-500 hover:bg-gradient-to-r hover:text-white
                                        shadow-md 
                                        dark:border-white dark:text-white dark:bg-transparent 
                                        dark:hover:bg-blue-900 dark:hover:text-white 
                                        transition-all duration-200
                                    "
                                    whileHover={{ scale: 1.05 }}
                                    disabled={addingId === featuredContent.id}
                                >
                                    <Plus className="w-4 h-4 mr-2" />{' '}
                                    {addingId === featuredContent.id ? 'Adding...' : 'Add to Watchlist'}
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>
            )}

            {/* Trending Carousel */}
            {carouselItems.length > 0 && !isTrendingLoading && (
                <section className="mb-8">
                    <AnimatePresence>
                        <TrendingCarousel items={carouselItems} />
                    </AnimatePresence>
                </section>
            )}

            {/* New Releases */}
            {renderSection(
                'New Releases',
                newReleases,
                isNewReleasesLoading,
                <CalendarDays className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
                '/movies/popular',
            )}

            {/* Top Rated */}
            {renderSection(
                'Top Rated',
                topRatedMovies,
                isTopRatedLoading,
                <StarIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />,
                '/movies/top_rated',
            )}

            {/* Popular TV Shows */}
            {renderSection(
                'Popular TV Shows',
                popularTVShows,
                isPopularTVLoading,
                <Tv className="w-6 h-6 text-purple-500 dark:text-purple-400" />,
                '/tvseries/popular',
            )}

            {showLoginModal && (
                <LoginNotificationModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </div>
    );
}

export default Home;
