import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tv, Film, Users, Bell, Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePaginatedFetch } from '@/hooks/API/data';
import { useMovieGenres, useTvSeriesGenres } from '@/hooks/API/genres';
import SkeletonCard from '@/components/ui/skeletonCard';
import { Link } from 'react-router-dom';
import { FilmModalContext } from '@/context/FilmModalProvider';

export default function ComingSoon() {
    const { data: upcomingMoviesData, isLoading: isLoadingMovies } = usePaginatedFetch('movie/upcoming', 1);
    const today = new Date().toISOString().split('T')[0];
    const { data: upcomingTVData, isLoading: isLoadingUpcomingTV } = usePaginatedFetch(
        `discover/tv?first_air_date.gte=${today}&sort_by=first_air_date.asc`,
        1,
    );
    const { MovieGenres } = useMovieGenres();
    const { TvSeriesGenresRes } = useTvSeriesGenres();
    const { setIsOpen, setContext } = useContext(FilmModalContext);

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

    const now = new Date();
    const upcomingMovies = (upcomingMoviesData?.results || []).filter((m) => new Date(m.release_date) > now);
    const upcomingTVShows = (upcomingTVData?.results || []).filter((tv) => new Date(tv.first_air_date) >= now);

    const renderCard = (item, isMovie = true) => (
        <motion.div
            key={item.id}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl overflow-hidden flex flex-col h-full cursor-pointer"
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => {
                setContext(item);
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
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{item.title || item.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {item.overview || 'No description available.'}
                </p>
                <div className="flex items-center gap-2 mt-auto flex-wrap">
                    <Badge variant="outline" className="text-xs">
                        {(item.genre_ids || [])
                            .map((id) => (isMovie ? movieGenreMap[id] : tvGenreMap[id]))
                            .filter(Boolean)
                            .join(', ') || 'Uncategorized'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{item.release_date || item.first_air_date}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );

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
                        <Link to="/movies/upcoming">
                            <Button variant="outline" className="flex items-center gap-1">
                                See All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </motion.div>
                    {isLoadingMovies ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} delay={i * 0.08} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingMovies.map((movie) => renderCard(movie, true))}
                        </div>
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
                        <Link to="/tv/upcoming">
                            <Button variant="outline" className="flex items-center gap-1">
                                See All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </motion.div>
                    {isLoadingUpcomingTV ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} delay={i * 0.08} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingTVShows.map((show) => renderCard(show, false))}
                        </div>
                    )}
                </motion.section>
            </div>
        </div>
    );
}
