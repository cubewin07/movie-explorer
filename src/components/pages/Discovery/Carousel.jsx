import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useInfinitePaginatedFetch } from '@/hooks/API/data';
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
    const navigate = useNavigate();

    const handleViewAll = () => {
        const section = title.toLowerCase().replace(' ', '_'); // e.g., "Top Rated" → "top_rated"
        const basePath = type === 'movie' ? '/movies' : '/tvseries';
        navigate(`${basePath}/${section}`);
    };

    if (isLoading) {
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
                    {items.map((item, i) => (
                        <motion.div
                            key={item.id}
                            className="min-w-[160px] flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg shadow-md p-2 cursor-pointer"
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            whileHover={{ scale: 1.05 }}
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                alt={item.title || item.name}
                                className="w-full h-40 object-cover rounded"
                                loading="lazy"
                                onError={(e) => (e.target.src = '/placeholder-movie.jpg')}
                            />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                {item.title || item.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(item.release_date || item.first_air_date || '—').slice(0, 4)}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}
