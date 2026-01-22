import { useInfinitePaginatedFetch } from '@/hooks/API/data';
import { useMovieGenres, useTvSeriesGenres } from '@/hooks/API/genres';
import { useRef, useCallback, useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import Breadcrumb from '../Discovery/Breadcrumb';
import SkeletonCard from '@/components/ui/skeletonCard';
import { Film, Tv, Calendar, Loader, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { FilmModalContext } from '@/context/FilmModalProvider';

export default function UpcomingListPage({ type = 'movie' }) {
    const isMovie = type === 'movie';
    const navigate = useNavigate();
    const { setIsOpen, setContext } = useContext(FilmModalContext);
    
    // Genres
    const { MovieGenres } = useMovieGenres();
    const { TvSeriesGenresRes } = useTvSeriesGenres();
    
    const genreMap = useMemo(() => {
        const genres = isMovie ? MovieGenres?.data?.genres : TvSeriesGenresRes?.data?.genres;
        return genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};
    }, [isMovie, MovieGenres, TvSeriesGenresRes]);

    // API Config
    const today = new Date().toISOString().split('T')[0];
    const endpoint = isMovie 
        ? 'movie/upcoming' 
        : `discover/tv?first_air_date.gte=${today}&sort_by=first_air_date.asc`;
    
    const queryKey = isMovie ? 'upcoming-movies' : 'upcoming-tv';
    const params = isMovie ? { region: import.meta.env.VITE_TMDB_REGION || 'US' } : {};

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfinitePaginatedFetch(
        endpoint,
        queryKey,
        params
    );

    // Intersection Observer
    const observer = useRef();
    const lastItemRef = useCallback(
        (node) => {
            if (isFetchingNextPage) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new window.IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            });
            if (node) observer.current.observe(node);
        },
        [isFetchingNextPage, fetchNextPage, hasNextPage],
    );

    const items = data?.pages.flatMap((page) => page.results) || [];

    const getTitle = (item) => isMovie ? item.title : item.name;
    const getDate = (item) => isMovie ? item.release_date : item.first_air_date;

    return (
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8 py-8 min-h-screen">
            <motion.button
                onClick={() => navigate(-1)}
                className="sticky top-12 z-40 mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 shadow hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
            </motion.button>
            <div className="sticky top-2 z-40 mb-4">
                <Breadcrumb
                    items={[
                        { name: 'Home', to: '/' },
                        { name: 'Coming Soon', to: '/coming-soon' },
                        { name: isMovie ? 'Upcoming Movies' : 'Upcoming TV Series', to: isMovie ? '/coming-soon/movies' : '/coming-soon/tvs' },
                    ]}
                />
            </div>
            <motion.h1
                className="text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                {isMovie ? (
                    <><Film className="w-7 h-7 text-blue-600 dark:text-blue-400" /> Upcoming Movies</>
                ) : (
                    <><Tv className="w-7 h-7 text-indigo-600 dark:text-indigo-400" /> Upcoming TV Series</>
                )}
            </motion.h1>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <SkeletonCard key={i} delay={i * 0.08} />
                    ))}
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.08 } },
                    }}
                >
                    {items.map((item, i) => {
                        const ref = i === items.length - 1 ? lastItemRef : null;
                        const image = item.poster_path
                            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                            : '/no-image-available.png';
                        const genres = (item.genre_ids || []).map((id) => genreMap[id]).filter(Boolean);
                        
                        return (
                            <motion.div
                                key={item.id}
                                ref={ref}
                                className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl overflow-hidden flex flex-col h-full cursor-pointer"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "100px" }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ y: -5 }}
                                onClick={() => {
                                    setContext({ ...item, image, genres });
                                    setIsOpen(true);
                                }}
                            >
                                <div className="relative h-64 w-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center overflow-hidden">
                                    <Badge className="absolute top-3 left-3 bg-indigo-600 text-white shadow text-xs font-semibold px-2 py-0.5 z-10">
                                        Coming Soon
                                    </Badge>
                                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-black shadow text-xs font-semibold px-2 py-0.5 z-10">
                                        ★ {item.vote_average?.toFixed(1)}
                                    </Badge>
                                    {item.poster_path ? (
                                        <img
                                            src={image}
                                            alt={getTitle(item)}
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
                                        {getTitle(item)}
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
                                            <span>{getDate(item)}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
            {isFetchingNextPage && (
                <div className="flex justify-center items-center py-8">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            )}
        </div>
    );
}
