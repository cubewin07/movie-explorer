import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Tv, Film, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

    const getHeaderConfig = () => {
        switch (activeTab) {
            case 'movies':
                return {
                    title: 'Upcoming Movies',
                    icon: Film,
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-500/10 dark:bg-blue-400/10',
                    border: 'border-blue-500/20 dark:border-blue-400/20',
                    link: '/coming-soon/movies'
                };
            case 'tv':
                return {
                    title: 'Upcoming TV Shows',
                    icon: Tv,
                    color: 'text-indigo-600 dark:text-indigo-400',
                    bg: 'bg-indigo-500/10 dark:bg-indigo-400/10',
                    border: 'border-indigo-500/20 dark:border-indigo-400/20',
                    link: '/coming-soon/tvs'
                };
            case 'features':
                return {
                    title: 'New Features',
                    icon: Sparkles,
                    color: 'text-yellow-600 dark:text-yellow-400',
                    bg: 'bg-yellow-500/10 dark:bg-yellow-400/10',
                    border: 'border-yellow-500/20 dark:border-yellow-400/20',
                    link: null
                };
            default:
                return {
                    title: 'Upcoming Movies',
                    icon: Film,
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-500/10 dark:bg-blue-400/10',
                    border: 'border-blue-500/20 dark:border-blue-400/20',
                    link: '/coming-soon/movies'
                };
        }
    };
    const headerConfig = getHeaderConfig();


    const renderCard = (item, isMovie = true) => {
        const image = item.poster_path
            ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
            : '/no-image-available.png';
        const genres = (item.genre_ids || [])
            .map((id) => (isMovie ? movieGenreMap[id] : tvGenreMap[id]))
            .filter(Boolean)
            .slice(0, 2);
        const dateStr = item.release_date || item.first_air_date || '';
        // Parse date for display
        const displayDate = dateStr
            ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
               })
            : '';

        return (
            <motion.div
                key={item.id}
                className="relative flex gap-4 rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm cursor-pointer transition-all duration-200 hover:border-indigo-300/60 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/80 dark:hover:border-indigo-500/30"
                variants={itemVariants}
                whileHover={{ y: -2, scale: 1.01 }}
                onClick={() => {
                    setContext({ ...item, image, genres });
                    setIsOpen(true);
                }}
            >
                {/* Subtle date badge hovering on top right edge */}
                {displayDate && (
                    <div className="absolute -top-2 right-3.5 z-10 bg-indigo-50/90 dark:bg-indigo-950/90 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
                        <Calendar className="h-2.5 w-2.5" />
                        <span>{displayDate}</span>
                    </div>
                )}

                {/* Poster thumbnail scaled up to 80x120px */}
                <div className="relative h-[120px] w-[80px] shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                    {item.poster_path ? (
                        <img
                            src={image}
                            alt={item.title || item.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-300 dark:text-slate-500">
                            {isMovie ? <Film className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
                        </div>
                    )}
                </div>

                {/* Info — now with extra vertical space for overview detail */}
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pr-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                        {item.title || item.name}
                    </h3>

                    {/* Short overview detail */}
                    {item.overview && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {item.overview}
                        </p>
                    )}

                    {/* Genres + rating row */}
                    <div className="flex items-center gap-2 flex-wrap mt-auto pt-1">
                        {genres.map((genre, idx) => (
                            <span
                                key={genre + idx}
                                className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500"
                            >
                                {genre}
                            </span>
                        ))}
                        {item.vote_average != null && (
                            <span className="text-[11px] font-semibold text-amber-500 dark:text-amber-400">
                                ★ {item.vote_average.toFixed(1)}
                            </span>
                        )}
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
                key={`see-all-${type}`}
                className="flex gap-4 rounded-xl border-2 border-dashed border-slate-300/80 bg-white/60 p-3 cursor-pointer transition-all duration-200 hover:border-indigo-400/60 hover:bg-indigo-50/40 dark:border-slate-600 dark:bg-slate-800/40 dark:hover:border-indigo-500/40 dark:hover:bg-slate-800/60"
                variants={itemVariants}
                whileHover={{ y: -2, scale: 1.01 }}
            >
                <Link to={link} className="flex items-center gap-4 w-full min-w-0">
                    <div className="flex h-[120px] w-[80px] shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-300/80 bg-slate-100/60 transition-colors group-hover:border-indigo-300 dark:border-slate-500 dark:bg-slate-700/40 dark:group-hover:border-indigo-500">
                        <Icon className="h-6 w-6 text-slate-400 transition-colors group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-400" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            View All Upcoming {isMovie ? 'Movies' : 'TV Shows'}
                        </span>
                        <span className="flex items-center gap-1.5 text-[13px] font-medium text-indigo-500 transition-colors dark:text-indigo-400">
                            See All
                            <ArrowRight className="h-3.5 w-3.5" />
                        </span>
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
                    {/* Unified Sticky Header: Title + Navigation */}
                    <div className="sticky top-[56px] z-40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-8 transition-all duration-300">
                        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Title & Link */}
                            <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 ${headerConfig.bg} rounded-xl border ${headerConfig.border}`}>
                                        <headerConfig.icon className={`w-6 h-6 ${headerConfig.color}`} />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">
                                        {headerConfig.title}
                                    </h2>
                                </div>
                                {headerConfig.link && (
                                    <Link to={headerConfig.link}>
                                        <Button variant="ghost" className={`flex items-center gap-1 group ${headerConfig.color} hover:bg-slate-500/10`}>
                                            See All 
                                            <motion.span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                                <ArrowRight className="w-4 h-4" />
                                            </motion.span>
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            {/* Tabs Navigation under/next to the Title */}
                            <div className="flex justify-center">
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
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'movies' && (
                            <motion.section
                                key="movies"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                                className="relative space-y-8"
                            >
                                {isLoadingMovies ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <SkeletonCard key={i} delay={i * 0.08} />
                                        ))}
                                    </div>
                                ) : upcomingMovies.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                                 className="relative space-y-8"
                             >
                                {isLoadingUpcomingTV ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <SkeletonCard key={i} delay={i * 0.08} />
                                        ))}
                                    </div>
                                ) : upcomingTVShows.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                                className="relative space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {upcomingFeaturesConfig.map((feature, idx) => (
                                        <UpcomingFeatureCard key={feature.title || idx} feature={feature} index={idx} />
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
