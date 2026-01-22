import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tv, Film, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SkeletonCard from '@/components/ui/skeletonCard';
import { Link } from 'react-router-dom';
import { FilmModalContext } from '@/context/FilmModalProvider';
import ErrorState from '@/components/ui/ErrorState';
import { useUpcomingMovies } from './useUpcomingMovies';
import { useUpcomingTVSeries } from './useUpcomingTVSeries';
import UpcomingFeatureCard from './UpcomingFeatureCard';
import { upcomingFeaturesConfig } from './upcomingFeaturesConfig.jsx';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ComingSoon() {
    const { upcomingMovies, isLoadingMovies, movieGenreMap } = useUpcomingMovies();
    const { upcomingTVShows, isLoadingUpcomingTV, tvGenreMap } = useUpcomingTVSeries();
    const { setIsOpen, setContext } = useContext(FilmModalContext);


    const renderCard = (item, isMovie = true) => {
        const image = item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/no-image-available.png';
        const genres = (item.genre_ids || [])
            .map((id) => (isMovie ? movieGenreMap[id] : tvGenreMap[id]))
            .filter(Boolean);
        return (
            <motion.div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl overflow-hidden flex flex-col h-full cursor-pointer"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => {
                    setContext({ ...item, image, genres });
                    setIsOpen(true);
                }}
            >
                <div className="relative h-64 w-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center overflow-hidden">
                    <Badge className="absolute top-3 left-3 bg-indigo-600 text-white shadow text-xs font-semibold px-2 py-0.5">
                        Coming Soon
                    </Badge>
                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-black shadow text-xs font-semibold px-2 py-0.5">
                        ★ {item.vote_average?.toFixed(1)}
                    </Badge>
                    {item.poster_path ? (
                        <img
                            src={image}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-white opacity-80">
                            {isMovie ? <Film className="w-10 h-10 mb-2" /> : <Tv className="w-10 h-10 mb-2" />}
                            <span className="text-sm">Poster Coming Soon</span>
                        </div>
                    )}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {item.title || item.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {item.overview || 'No description available.'}
                    </p>
                    <div className="flex items-center gap-2 mt-auto flex-wrap">
                        {genres.length > 0 ? (
                            genres.map((genre, idx) => (
                                <Badge
                                    key={genre + idx}
                                    variant="outline"
                                    className="text-xs bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow px-2 py-0.5 border-0 mr-1 mb-1"
                                >
                                    {genre}
                                </Badge>
                            ))
                        ) : (
                            <Badge
                                variant="outline"
                                className="text-xs bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow px-2 py-0.5 border-0"
                            >
                                Uncategorized
                            </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{item.release_date || item.first_air_date}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
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

                {/* Upcoming Movies */}
                <motion.section
                    className="mb-12 sm:mb-16"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="flex items-center justify-between gap-3 mb-8" variants={itemVariants}>
                        <div className="flex items-center gap-3">
                            <Film className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Upcoming Movies
                            </h2>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/coming-soon/movies">
                                <Button variant="outline" className="flex items-center gap-1 group">
                                    See All 
                                    <motion.span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.span>
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                    {isLoadingMovies ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} delay={i * 0.08} />
                            ))}
                        </div>
                    ) : upcomingMovies.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingMovies.map((movie) => renderCard(movie, true))}
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="col-span-1 sm:col-span-2 lg:col-span-3">
                            <ErrorState
                                title="No Upcoming Movies"
                                message="Check back soon for new movie announcements!"
                                fullScreen={false}
                                showHomeButton={false}
                                onRetry={null}
                                transparentBg={true}
                            />
                        </motion.div>
                    )}
                </motion.section>

                {/* Upcoming TV Shows */}
                <motion.section
                    className="mb-12 sm:mb-16"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="flex items-center justify-between gap-3 mb-8" variants={itemVariants}>
                        <div className="flex items-center gap-3">
                            <Tv className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Upcoming TV Shows
                            </h2>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/coming-soon/tvs">
                                <Button variant="outline" className="flex items-center gap-1 group">
                                    See All 
                                    <motion.span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.span>
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                    {isLoadingUpcomingTV ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} delay={i * 0.08} />
                            ))}
                        </div>
                    ) : upcomingTVShows.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingTVShows.map((tv) => renderCard(tv, false))}
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="col-span-1 sm:col-span-2 lg:col-span-3">
                            <ErrorState
                                title="No Upcoming TV Shows"
                                message="Stay tuned for new TV show announcements!"
                                fullScreen={false}
                                showHomeButton={false}
                                onRetry={null}
                                transparentBg={true}
                            />
                        </motion.div>
                    )}
                </motion.section>

                {/* Upcoming Features */}
                <motion.section
                    className="mb-12 sm:mb-16"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        className="text-center mb-8"
                        variants={itemVariants}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0, scale: 1.05 }}
                        transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            New Features Coming Soon
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            We're constantly working to bring you the best movie watching experience.
                        </p>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingFeaturesConfig.map((feature, index) => (
                            <UpcomingFeatureCard key={index} feature={feature} index={index} />
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
