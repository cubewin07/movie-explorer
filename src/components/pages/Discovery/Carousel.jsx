import { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { useInfinitePaginatedFetch } from '@/hooks/API/data';
import { useAllGenres } from '@/hooks/API/genres';
import { FilmModalContext } from '@/context/FilmModalProvider';
import { useMemo } from 'react';
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.4,
            ease: 'easeOut',
        },
    }),
};

export default function Carousel({ title, url, type }) {
    const { data, isLoading, isError } = useInfinitePaginatedFetch(url, [url, type]);
    const items = data?.pages?.[0]?.results || [];

    const { setIsOpen, setContext } = useContext(FilmModalContext);
    const { movieGenres, tvGenres, isLoading: isLoadingGenres } = useAllGenres();
    const genreArr = useMemo(() => [...movieGenres, ...tvGenres], [movieGenres, tvGenres]);
    const genreMap = useMemo(
        () =>
            genreArr?.reduce((acc, g) => {
                acc[g.id] = g.name;
                return acc;
            }, {}) || {},
        [genreArr],
    );

    const navigate = useNavigate();

    const handleViewAll = () => {
        const section = title.toLowerCase().replace(' ', '_'); // e.g., "Top Rated" → "top_rated"
        const basePath = type === 'movie' ? '/movies' : '/tvseries';
        navigate(`${basePath}/${section}`);
    };

    if (isLoading && isLoadingGenres) {
        return (
            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-6 w-32 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="flex space-x-4 overflow-x-auto px-1 no-scrollbar">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="min-w-[160px] h-[260px] bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse flex-shrink-0"
                        />
                    ))}
                </div>
            </section>
        );
    }
    if (isError) return <div className="py-6 text-red-500">Failed to load {title}</div>;

    return (
        <motion.section
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <motion.button
                    onClick={handleViewAll}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 border border-blue-300 dark:border-blue-700 dark:text-blue-400 rounded-full px-4 py-1 hover:bg-blue-50 dark:hover:bg-blue-900 transition"
                >
                    View All <ArrowRight className="w-4 h-4" />
                </motion.button>
            </div>

            <div className="relative">
                <div className="flex space-x-4 overflow-x-auto overflow-y-hidden px-1 no-scrollbar">
                    {items.map((item, i) => {
                        const genreNames = item.genre_ids.map((id) => genreMap[id]).filter(Boolean);
                        console.log(genreMap);
                        return (
                            <motion.div
                                key={item.id}
                                className="relative w-[180px] flex-shrink-0 group rounded-xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:shadow-blue-300/20 dark:hover:shadow-blue-900/30"
                                variants={cardVariants}
                                custom={i}
                                initial="hidden"
                                animate="visible"
                                onClick={() => {
                                    setContext({ ...item, genres: genreNames });
                                    setIsOpen(true);
                                }}
                            >
                                {/* Image */}
                                <img
                                    src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                    alt={item.title || item.name}
                                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    loading="lazy"
                                    onError={(e) => (e.target.src = '/placeholder-movie.jpg')}
                                />

                                {/* Bottom gradient fade only */}
                                <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />

                                {/* Text with backdrop */}
                                <div className="absolute bottom-2 left-2 right-2 z-10 text-white">
                                    <h3 className="text-sm font-semibold truncate drop-shadow">
                                        {item.title || item.name}
                                    </h3>
                                    <p className="text-xs text-white/80 drop-shadow-sm">
                                        {(item.release_date || item.first_air_date || '—').slice(0, 4)}
                                    </p>
                                </div>

                                {/* Minimal badge (top-right for less clutter) */}
                                <div className="absolute top-2 right-2 z-10">
                                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/40 text-white font-medium backdrop-blur-sm shadow-sm">
                                        {title === 'Trending' ? '🔥' : title === 'Top Rated' ? '⭐' : '📺'}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.section>
    );
}
