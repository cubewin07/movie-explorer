import { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, CalendarDays, Star as StarIcon, Tv } from 'lucide-react';
import Section from './Section';

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
import SkeletonCard from '@/components/ui/skeletonCard';


function Home() {
    const navigate = useNavigate();
    const { setIsOpen, setContext } = useContext(FilmModalContext);
    const { user, token } = useAuthen();
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
    const { mutate: addToWatchlist } = useAddToWatchlist(token);

    // Check if all data is still loading
    const isAnyLoading = useMemo(() => {
        return isFeaturedLoading || isNewReleasesLoading || isTopRatedLoading || 
               isPopularTVLoading || isTrendingLoading || isGenresLoading;
    }, [isFeaturedLoading, isNewReleasesLoading, isTopRatedLoading, 
        isPopularTVLoading, isTrendingLoading, isGenresLoading]);

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
        // Determine if it's a TV show or movie based on whether it has a name property
        const isTV = !!item.name;
        addToWatchlist({ id: item.id, type: isTV ? 'SERIES' : 'MOVIE' }, {
            onSettled: () => setAddingId(null),
        });
    };

    const handleLoginSuccess = () => {
        if (selectedItem) {
            setAddingId(selectedItem.id);
            // Determine if it's a TV show or movie based on whether it has a name property
            const isTV = !!selectedItem.name;
            addToWatchlist({ id: selectedItem.id, type: isTV ? 'TV' : 'MOVIE' }, {
                onSettled: () => setAddingId(null),
            });
            setSelectedItem(null);
        }
    };

    // Show loading state for all sections if any is loading
    if (isAnyLoading) {
        return (
            <div className="w-full max-w-screen-xl mx-auto flex flex-col gap-8 px-2 sm:px-4 md:px-8">
                {/* Featured Hero Skeleton */}
                <section className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden mb-8 shadow-xl bg-gray-200 dark:bg-slate-800 animate-pulse">
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                        <div className="max-w-2xl space-y-4">
                            <div className="h-10 bg-gray-300 dark:bg-slate-700 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-full"></div>
                            <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-5/6"></div>
                            <div className="flex gap-3 mt-6">
                                <div className="h-12 bg-gray-300 dark:bg-slate-700 rounded w-32"></div>
                                <div className="h-12 bg-gray-300 dark:bg-slate-700 rounded w-40"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trending Carousel Skeleton */}
                <section className="mb-8">
                    <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                </section>

                {/* Section Skeletons */}
                {['New Releases', 'Top Rated', 'Popular TV Shows'].map((title) => (
                    <section key={title} className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-48 animate-pulse"></div>
                            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-24 animate-pulse"></div>
                        </div>
                        <div className="flex gap-x-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard
                                    key={i}
                                    delay={i}
                                    variant="movie"
                                    animation="shimmer"
                                    className="w-[180px] md:w-[200px] h-80 flex-shrink-0"
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full max-w-screen-xl mx-auto flex flex-col gap-8 px-2 sm:px-4 md:px-8 ">
            {/* Featured Hero Banner */}
            {featuredContent && (
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
            {carouselItems.length > 0 && (
                <section className="mb-8">
                    <AnimatePresence>
                        <TrendingCarousel items={carouselItems} />
                    </AnimatePresence>
                </section>
            )}
            
            {/* New Releases */}
            <Section
                title="New Releases"
                items={newReleases}
                isLoading={false}
                icon={<CalendarDays className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
                viewAllType="movie"
                viewAllSort="popularity.desc"
                genreMap={genreMap}
                setContext={setContext}
                setIsOpen={setIsOpen}
            />

            {/* Top Rated */}
            <Section
                title="Top Rated"
                items={topRatedMovies}
                isLoading={false}
                icon={<StarIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />}
                viewAllType="movie"
                viewAllSort="vote_average.desc"
                genreMap={genreMap}
                setContext={setContext}
                setIsOpen={setIsOpen}
            />

            {/* Popular TV Shows */}
            <Section
                title="Popular TV Shows"
                items={popularTVShows}
                isLoading={false}
                icon={<Tv className="w-6 h-6 text-purple-500 dark:text-purple-400" />}
                viewAllType="tv"
                viewAllSort="popularity.desc"
                genreMap={genreMap}
                setContext={setContext}
                setIsOpen={setIsOpen}
            />

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