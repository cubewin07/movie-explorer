import { useInfinitePaginatedFetch } from '@/hooks/API/data';
import { useTvSeriesGenres } from '@/hooks/API/genres';
import { useRef, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import Breadcrumb from '../Discovery/Breadcrumb';
import SkeletonCard from '@/components/ui/skeletonCard';
import { Tv, Calendar, Loader, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import { FilmModalContext } from '@/context/FilmModalProvider';

export default function UpcomingTvSeriesPage() {
    const today = new Date().toISOString().split('T')[0];
    const { TvSeriesGenresRes } = useTvSeriesGenres();
    const tvGenreMap =
        TvSeriesGenresRes?.data?.genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfinitePaginatedFetch(
        `discover/tv?first_air_date.gte=${today}&sort_by=first_air_date.asc`,
        'upcoming-tv',
    );

    const observer = useRef();
    const lastTvRef = useCallback(
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

    const tvs = data?.pages.flatMap((page) => page.results) || [];

    const navigate = useNavigate();
    const { setIsOpen, setContext } = useContext(FilmModalContext);

    const renderCard = (tv, ref) => (
        <motion.div
            key={tv.id}
            ref={ref}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl overflow-hidden flex flex-col h-full cursor-pointer"
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => {
                setContext(tv);
                setIsOpen(true);
            }}
        >
            <div className="relative h-64 w-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center overflow-hidden">
                <Badge className="absolute top-3 left-3 bg-indigo-600 text-white shadow text-xs font-semibold px-2 py-0.5">
                    Coming Soon
                </Badge>
                <Badge className="absolute top-3 right-3 bg-yellow-500 text-black shadow text-xs font-semibold px-2 py-0.5">
                    ★ {tv.vote_average?.toFixed(1)}
                </Badge>
                {tv.poster_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w500${tv.poster_path}`}
                        alt={tv.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-white opacity-80">
                        <Tv className="w-10 h-10 mb-2" />
                        <span className="text-sm">Poster Coming Soon</span>
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{tv.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {tv.overview || 'No description available.'}
                </p>
                <div className="flex items-center gap-2 mt-auto flex-wrap">
                    <Badge variant="outline" className="text-xs">
                        {(tv.genre_ids || [])
                            .map((id) => tvGenreMap[id])
                            .filter(Boolean)
                            .join(', ') || 'Uncategorized'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{tv.first_air_date}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8 py-8 min-h-screen">
            <button
                onClick={() => navigate(-1)}
                className="sticky top-10 z-40 mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 shadow hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
            </button>
            <Breadcrumb
                items={[
                    { name: 'Home', to: '/' },
                    { name: 'Upcoming TV Series', to: '/tv/upcoming' },
                ]}
            />
            <h1 className="text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-2">
                <Tv className="w-7 h-7 text-indigo-600 dark:text-indigo-400" /> Upcoming TV Series
            </h1>
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <SkeletonCard key={i} delay={i * 0.08} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tvs.map((tv, i) => (i === tvs.length - 1 ? renderCard(tv, lastTvRef) : renderCard(tv, null)))}
                </div>
            )}
            {isFetchingNextPage && (
                <div className="flex justify-center items-center py-8">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            )}
        </div>
    );
}
