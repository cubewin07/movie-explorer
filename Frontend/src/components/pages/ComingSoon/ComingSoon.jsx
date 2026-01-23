import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Tv, Film, Bell, ArrowRight, Sparkles } from 'lucide-react';
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

const tabs = [
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Shows', icon: Tv },
    { id: 'features', label: 'Features', icon: Sparkles },
];

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
    const [activeTab, setActiveTab] = useState('movies');
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
                whileHover={{ y: -5 }}
                onClick={() => {
                    setContext({ ...item, image, genres });
                    setIsOpen(true);
                }}
            >
                <div className="relative h-64 w-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center overflow-hidden">
                    <Badge className="absolute top-3 left-3 bg-indigo-600 text-white shadow text-xs font-semibold px-2 py-0.5 z-10">
                        Coming Soon
                    </Badge>
                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-black shadow text-xs font-semibold px-2 py-0.5 z-10">
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

    const renderSeeAllCard = (type) => {
        const isMovie = type === 'movie';
        const link = isMovie ? '/coming-soon/movies' : '/coming-soon/tvs';
        const Icon = isMovie ? Film : Tv;

        return (
            <motion.div
                className="bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-sm border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 flex flex-col h-full cursor-pointer transition-all duration-300 group"
                variants={itemVariants}
                initial="visible"
                whileHover={{ y: -5 }}
            >
                <Link to={link} className="flex flex-col items-center justify-center w-full h-full p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        View All Upcoming {isMovie ? 'Movies' : 'TV Shows'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Discover more upcoming releases
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 transition-all">
                        See All <ArrowRight className="w-4 h-4" />
                    </div>
                </Link>
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

                <div className="w-full">
                    <div className="sticky top-16 z-40 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-8 transition-all duration-300 pointer-events-none">
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent dark:via-slate-600/50" />
                        <div className="relative flex justify-center pointer-events-auto">
                            <div className="flex p-1.5 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-full border border-white/20 dark:border-white/10 shadow-lg">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            relative flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 outline-none select-none
                                            ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                                        `}
                                    >
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="active-tab-bg"
                                                className="absolute inset-0 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse-glow' : ''}`} />
                                            {tab.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'movies' && (
                            <motion.section
                                key="movies"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                                className="space-y-8"
                            >
                                <div className="sticky top-36 z-30 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 transition-all duration-300">
                                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent dark:via-slate-600/50" />
                                    <div className="relative flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-xl backdrop-blur-sm border border-blue-500/20 dark:border-blue-400/20">
                                                <Film className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">
                                                Upcoming Movies
                                            </h2>
                                        </div>
                                        <Link to="/coming-soon/movies">
                                            <Button variant="ghost" className="flex items-center gap-1 group text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 dark:hover:bg-blue-400/10">
                                                See All 
                                                <motion.span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                                    <ArrowRight className="w-4 h-4" />
                                                </motion.span>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                
                                {isLoadingMovies ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <SkeletonCard key={i} delay={i * 0.08} />
                                        ))}
                                    </div>
                                ) : upcomingMovies.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {upcomingMovies.map((movie) => renderCard(movie, true))}
                                        {renderSeeAllCard('movie')}
                                    </div>
                                ) : (
                                    <ErrorState
                                        title="No Upcoming Movies"
                                        message="Check back soon for new movie announcements!"
                                        fullScreen={false}
                                        showHomeButton={false}
                                        onRetry={null}
                                        transparentBg={true}
                                    />
                                )}
                            </motion.section>
                        )}

                        {activeTab === 'tv' && (
                            <motion.section
                                 key="tv"
                                 variants={containerVariants}
                                 initial="hidden"
                                 animate="visible"
                                 exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                                 className="space-y-8"
                             >
                                <div className="sticky top-36 z-30 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 transition-all duration-300">
                                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent dark:via-slate-600/50" />
                                    <div className="relative flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-xl backdrop-blur-sm border border-indigo-500/20 dark:border-indigo-400/20">
                                                <Tv className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">
                                                Upcoming TV Shows
                                            </h2>
                                        </div>
                                        <Link to="/coming-soon/tvs">
                                            <Button variant="ghost" className="flex items-center gap-1 group text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10">
                                                See All 
                                                <motion.span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                                    <ArrowRight className="w-4 h-4" />
                                                </motion.span>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {isLoadingUpcomingTV ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <SkeletonCard key={i} delay={i * 0.08} />
                                        ))}
                                    </div>
                                ) : upcomingTVShows.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {upcomingTVShows.map((tv) => renderCard(tv, false))}
                                        {renderSeeAllCard('tv')}
                                    </div>
                                ) : (
                                    <ErrorState
                                        title="No Upcoming TV Shows"
                                        message="Check back soon for new TV show announcements!"
                                        fullScreen={false}
                                        showHomeButton={false}
                                        onRetry={null}
                                        transparentBg={true}
                                    />
                                )}
                            </motion.section>
                        )}

                        {activeTab === 'features' && (
                            <motion.section
                                key="features"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                                className="space-y-8"
                            >
                                <div className="sticky top-36 z-30 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 transition-all duration-300">
                                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent dark:via-slate-600/50" />
                                    <div className="relative flex items-center gap-3">
                                        <div className="p-2 bg-yellow-500/10 dark:bg-yellow-400/10 rounded-xl backdrop-blur-sm border border-yellow-500/20 dark:border-yellow-400/20">
                                            <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">
                                            New Features
                                        </h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {upcomingFeaturesConfig.map((feature) => (
                                        <UpcomingFeatureCard key={feature.id} feature={feature} />
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
