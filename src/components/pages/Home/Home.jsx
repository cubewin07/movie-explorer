import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Plus, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
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

function Home() {
    const navigate = useNavigate();
    const { setIsOpen, setContext } = useContext(FilmModalContext);
    const { user } = useAuthen();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Fetch data using new hooks
    const { featuredContent, isLoading: isFeaturedLoading } = useFeaturedContent();
    const { newReleases, isLoading: isNewReleasesLoading } = useNewReleases();
    const { topRatedMovies, isLoading: isTopRatedLoading } = useTopRatedMovies();
    const { popularTVShows, isLoading: isPopularTVLoading } = usePopularTVShows();
    const { data: trendingData, isLoading: isTrendingLoading } = usePaginatedFetch('trending/movie/week', 1);
    const { MovieGenres, isGenresLoading } = useMovieGenres();

    const genreMap =
        MovieGenres?.data?.genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};

    const handleAddToWatchlist = (item) => {
        if (!user) {
            setSelectedItem(item);
            setShowLoginModal(true);
            return;
        }
        // Add to watchlist logic here
    };

    const handleLoginSuccess = () => {
        if (selectedItem) {
            // Add selected item to watchlist
            setSelectedItem(null);
        }
    };

    const renderMovieCard = (movie, type = 'movie') => {
        const genreNames = movie.genre_ids?.map((id) => genreMap[id]).filter(Boolean) || [];

        return (
            <motion.div
                key={movie.id}
                className="relative bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col overflow-hidden group cursor-pointer"
                whileHover={{ y: -4 }}
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
                <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {movie.title || movie.name}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                        {movie.genre_ids?.slice(0, 2).map((id) => (
                            <span
                                key={id}
                                className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full"
                            >
                                {genreMap[id]}
                            </span>
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4)}
                    </span>
                </div>
            </motion.div>
        );
    };

    const renderSection = (title, items, isLoading, icon, viewAllPath) => {
        if (isLoading) {
            return (
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {icon} {title}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-80 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </section>
            );
        }

        return (
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {icon} {title}
                    </h2>
                    <button
                        onClick={() => navigate(viewAllPath)}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors flex items-center gap-1"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {items?.map((item) => renderMovieCard(item))}
                </div>
            </section>
        );
    };

    return (
        <div className="w-full max-w-screen-xl mx-auto flex flex-col gap-8 px-2 sm:px-4 md:px-8">
            {/* Featured Hero Banner */}
            {featuredContent && !isFeaturedLoading && (
                <section className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden mb-8">
                    <div className="absolute inset-0">
                        <img
                            src={`https://image.tmdb.org/t/p/original${featuredContent.backdrop_path}`}
                            alt={featuredContent.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                        <div className="max-w-2xl">
                            <motion.h1
                                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                {featuredContent.title}
                            </motion.h1>

                            <motion.p
                                className="text-white/90 text-sm sm:text-base mb-6 line-clamp-3"
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
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                                >
                                    <Play className="w-4 h-4 mr-2" /> Watch Now
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleAddToWatchlist(featuredContent)}
                                    className="border-white text-white hover:bg-white hover:text-black"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add to Watchlist
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            {/* Trending Now Carousel */}
            {renderSection(
                'Trending Now',
                trendingData?.results?.slice(0, 8),
                isTrendingLoading,
                '🔥',
                '/movies/popular',
            )}

            {/* New Releases */}
            {renderSection('New Releases', newReleases, isNewReleasesLoading, '📅', '/movies/popular')}

            {/* Top Rated */}
            {renderSection('Top Rated', topRatedMovies, isTopRatedLoading, '🧠', '/movies/top_rated')}

            {/* Popular TV Shows */}
            {renderSection('Popular TV Shows', popularTVShows, isPopularTVLoading, '📺', '/tvseries/popular')}

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
