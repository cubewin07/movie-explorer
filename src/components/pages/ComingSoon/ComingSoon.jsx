import { motion } from 'framer-motion';
import { Calendar, Clock, Star, Play, Plus, ArrowRight, Film, Tv, Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePaginatedFetch } from '@/hooks/API/data';
import { useMovieGenres, useTvSeriesGenres } from '@/hooks/API/genres';

export default function ComingSoon() {
    // Fetch upcoming movies and TV series
    const { data: upcomingMoviesData, isLoading: isLoadingMovies } = usePaginatedFetch('movie/upcoming', 1);
    const { data: upcomingTVData, isLoading: isLoadingTV } = usePaginatedFetch('tv/on_the_air', 1);
    const { MovieGenres } = useMovieGenres();
    const { TvSeriesGenresRes } = useTvSeriesGenres();

    // Genre maps for display
    const movieGenreMap =
        MovieGenres?.data?.genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};
    const tvGenreMap =
        TvSeriesGenresRes?.data?.genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};

    // Filter for future release dates
    const today = new Date();
    const upcomingMovies = (upcomingMoviesData?.results || []).filter((m) => {
        const date = m.release_date ? new Date(m.release_date) : null;
        return date && date > today;
    });
    const upcomingTVShows = (upcomingTVData?.results || []).filter((tv) => {
        const date = tv.first_air_date ? new Date(tv.first_air_date) : null;
        return date && date > today;
    });

    const upcomingFeatures = [
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Community Reviews',
            description: 'Share your thoughts and read reviews from other movie enthusiasts.',
            eta: 'Coming in April',
        },
        {
            icon: <Bell className="w-6 h-6" />,
            title: 'Release Notifications',
            description: 'Get notified when your favorite movies and shows are released.',
            eta: 'Coming in May',
        },
        {
            icon: <Play className="w-6 h-6" />,
            title: 'Watch Together',
            description: 'Watch movies simultaneously with friends and family.',
            eta: 'Coming in June',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Hero Section */}
                <motion.div
                    className="text-center mb-12 sm:mb-16"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full mb-6"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Coming Soon
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Discover the latest movies, TV shows, and exciting new features that are just around the corner.
                    </p>
                </motion.div>

                {/* Upcoming Movies Section */}
                <motion.section
                    className="mb-12 sm:mb-16"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="flex items-center gap-3 mb-8" variants={itemVariants}>
                        <Film className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            Upcoming Movies
                        </h2>
                    </motion.div>
                    {isLoadingMovies ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Loading upcoming movies...
                        </div>
                    ) : upcomingMovies.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No upcoming movies found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingMovies.map((movie) => (
                                <motion.div
                                    key={movie.id}
                                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="relative h-48 sm:h-56 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600">
                                        {movie.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                alt={movie.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-white text-center">
                                                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-80" />
                                                <p className="text-sm opacity-90">Poster Coming Soon</p>
                                            </div>
                                        )}
                                        <Badge className="absolute top-3 right-3 bg-yellow-500 text-black">
                                            ★ {movie.vote_average?.toFixed(1)}
                                        </Badge>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {movie.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                            {movie.overview}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-xs">
                                                {(movie.genre_ids || [])
                                                    .map((id) => movieGenreMap[id])
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                <span>{movie.release_date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>

                {/* Upcoming TV Shows Section */}
                <motion.section
                    className="mb-12 sm:mb-16"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="flex items-center gap-3 mb-8" variants={itemVariants}>
                        <Tv className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            Upcoming TV Shows
                        </h2>
                    </motion.div>
                    {isLoadingTV ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Loading upcoming TV shows...
                        </div>
                    ) : upcomingTVShows.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No upcoming TV shows found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {upcomingTVShows.map((show) => (
                                <motion.div
                                    key={show.id}
                                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="relative h-48 sm:h-56 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-600">
                                        {show.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                                                alt={show.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-white text-center">
                                                <Tv className="w-12 h-12 mx-auto mb-2 opacity-80" />
                                                <p className="text-sm opacity-90">Poster Coming Soon</p>
                                            </div>
                                        )}
                                        <Badge className="absolute top-3 right-3 bg-yellow-500 text-black">
                                            ★ {show.vote_average?.toFixed(1)}
                                        </Badge>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {show.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                            {show.overview}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-xs">
                                                {(show.genre_ids || [])
                                                    .map((id) => tvGenreMap[id])
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                <span>{show.first_air_date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>

                {/* Upcoming Features Section */}
                <motion.section
                    className="mb-12 sm:mb-16"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="text-center mb-8" variants={itemVariants}>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            New Features Coming Soon
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            We're constantly working to bring you the best movie watching experience.
                        </p>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                                variants={itemVariants}
                                whileHover={{ y: -5, scale: 1.02 }}
                            >
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                                    <div className="text-blue-600 dark:text-blue-400">{feature.icon}</div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>
                                <Badge variant="secondary" className="text-xs">
                                    {feature.eta}
                                </Badge>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Call to Action */}
                <motion.div
                    className="text-center bg-white dark:bg-slate-800 rounded-2xl p-8 sm:p-12 shadow-lg"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Stay Updated</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                        Be the first to know when new content and features are available.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                            <Bell className="w-4 h-4 mr-2" />
                            Get Notifications
                        </Button>
                        <Button variant="outline" className="px-6 py-3">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Explore Current Content
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
