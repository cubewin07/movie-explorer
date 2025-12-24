import { Play, Plus, Share, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function SeriesInfoSection({
    series,
    trailerUrl,
    isLoadingTrailer,
    onAddToWatchlist,
    onWatchlistPending,
}) {
    return (
        <motion.div
            className="p-4 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 -mt-32 sm:-mt-40 md:-mt-48 relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
                hidden: { opacity: 0, y: 40 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: 'spring', stiffness: 120, damping: 18, staggerChildren: 0.15 },
                },
            }}
        >
            {/* Poster */}
            <motion.div
                className="flex items-center justify-center w-32 sm:w-48 md:w-60 h-48 sm:h-72 md:h-90 rounded-xl bg-gray-100 dark:bg-slate-800 shadow-2xl border border-white dark:border-slate-700 mx-auto md:mx-0"
                initial={{ opacity: 0, x: -30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
                <img
                    src={`https://image.tmdb.org/t/p/w342${series.poster_path}`}
                    alt={series.name}
                    className="object-cover w-full h-full rounded-xl my-auto"
                />
            </motion.div>

            {/* Info Content */}
            <motion.div
                className="flex-1 space-y-4"
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            >
                <motion.h1
                    className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {series.name}
                </motion.h1>

                <motion.div
                    className="flex flex-wrap items-center gap-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                >
                    <span>
                        {series.first_air_date?.slice(0, 4)} - {series.last_air_date?.slice(0, 4)}
                    </span>
                    <span className="opacity-60">•</span>
                    <span>{series.number_of_seasons} Seasons</span>
                    <span className="opacity-60">•</span>
                    <span>{series.number_of_episodes} Episodes</span>
                    <span className="opacity-60">•</span>
                    <Badge className="bg-green-600 text-white">{series.status}</Badge>
                </motion.div>

                <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-lg font-bold">{series.vote_average?.toFixed(1)}</span>
                    <span className="text-slate-400">/10</span>
                </motion.div>

                <motion.div
                    className="flex flex-wrap gap-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: { staggerChildren: 0.08 },
                        },
                    }}
                >
                    {series?.genres?.map((g) => (
                        <motion.div
                            key={g.id}
                            className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs px-2 py-1 rounded"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {g.name}
                        </motion.div>
                    ))}
                </motion.div>

                <motion.p
                    className="text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-3xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                >
                    {series.overview}
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row flex-wrap gap-3 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Button
                        className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-emerald-700 hover:to-emerald-800 shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out text-white px-6 py-2 text-sm sm:text-base w-full sm:w-auto"
                        onClick={() => window.open(trailerUrl, '_blank')}
                        disabled={!trailerUrl || isLoadingTrailer}
                    >
                        <Play className="w-4 h-4 mr-2" /> Watch Trailer
                    </Button>

                    <Button
                        variant="outline"
                        className="border-slate-400 dark:border-slate-600 text-slate-800 dark:text-white hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-800 dark:hover:text-white disabled:bg-blue-100 disabled:text-blue-800 px-6 py-2 text-sm sm:text-base w-full sm:w-auto"
                        onClick={onAddToWatchlist}
                        disabled={onWatchlistPending}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add to Watchlist
                    </Button>

                    <Button
                        variant="outline"
                        className="border-slate-400 dark:border-slate-600 text-slate-800 dark:text-white hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-800 dark:hover:text-white px-6 py-2 text-sm sm:text-base w-full sm:w-auto"
                    >
                        <Share className="w-4 h-4 mr-2" /> Share
                    </Button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
