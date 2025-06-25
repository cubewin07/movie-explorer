import { motion } from 'framer-motion';
import { useInfinitePaginatedFetch } from '@/hooks/API/data';

export default function Carousel({ title, url, type }) {
    const { data, isLoading, isError } = useInfinitePaginatedFetch(url, [url, type]);
    const items = data?.pages?.[0]?.results || [];

    if (isLoading) return <div className="py-6 animate-pulse">Loading {title}...</div>;
    if (isError) return <div className="py-6 text-red-500">Failed to load {title}</div>;

    return (
        <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <div className="flex space-x-4 overflow-x-auto px-1 no-scrollbar">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        className="min-w-[160px] flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg shadow-md p-2 cursor-pointer"
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
        </section>
    );
}
