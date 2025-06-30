import { useInfinitePaginatedFetch } from '@/hooks/API/data';
import { useMovieGenres } from '@/hooks/API/genres';
import { useRef, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import Breadcrumb from '../Discovery/Breadcrumb';
import SkeletonCard from '@/components/ui/skeletonCard';
import { Film, Calendar, Loader, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { FilmModalContext } from '@/context/FilmModalProvider';

export default function UpcomingMoviesPage() {
    const { MovieGenres } = useMovieGenres();
    const movieGenreMap =
        MovieGenres?.data?.genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfinitePaginatedFetch(
        'movie/upcoming',
        'upcoming-movies',
    );
    const navigate = useNavigate();
    const { setIsOpen, setContext } = useContext(FilmModalContext);

    const observer = useRef();
    const lastMovieRef = useCallback(
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

    const movies = data?.pages.flatMap((page) => page.results) || [];

    const renderCard = (movie, ref) => (
        <motion.div
            key={movie.id}
            ref={ref}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl overflow-hidden flex flex-col h-full cursor-pointer"
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => {
                setContext(movie);
                setIsOpen(true);
            }}
        >
            <div className="relative h-64 w-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center overflow-hidden">
                <Badge className="absolute top-3 left-3 bg-indigo-600 text-white shadow text-xs font-semibold px-2 py-0.5">
                    Coming Soon
                </Badge>
                <Badge className="absolute top-3 right-3 bg-yellow-500 text-black shadow text-xs font-semibold px-2 py-0.5">
                    ★ {movie.vote_average?.toFixed(1)}
                </Badge>
                {movie.poster_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-white opacity-80">
                        <Film className="w-10 h-10 mb-2" />
                        <span className="text-sm">Poster Coming Soon</span>
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{movie.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {movie.overview || 'No description available.'}
                </p>
                <div className="flex items-center gap-2 mt-auto flex-wrap">
                    <Badge variant="outline" className="text-xs">
                        {(movie.genre_ids || [])
                            .map((id) => movieGenreMap[id])
                            .filter(Boolean)
                            .join(', ') || 'Uncategorized'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{movie.release_date}</span>
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
                    { name: 'Upcoming Movies', to: '/movies/upcoming' },
                ]}
            />
            <h1 className="text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-2">
                <Film className="w-7 h-7 text-blue-600 dark:text-blue-400" /> Upcoming Movies
            </h1>
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <SkeletonCard key={i} delay={i * 0.08} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {movies.map((movie, i) =>
                        i === movies.length - 1 ? renderCard(movie, lastMovieRef) : renderCard(movie, null),
                    )}
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
