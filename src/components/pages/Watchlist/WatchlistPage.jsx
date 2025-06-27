import { useAuthen } from '@/context/AuthenProvider';
import { useNavigate } from 'react-router-dom';
import useWatchlist from '@/hooks/watchList/useWatchList';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function WatchlistPage() {
    const { user } = useAuthen();
    const navigate = useNavigate();

    const { data: watchlist = [], isLoading, isError } = useWatchlist(user?.email || 'guest');

    if (!user) {
        return (
            <div className="text-center py-10">
                <p className="text-lg text-muted-foreground mb-4">Please log in to view your watchlist.</p>
                <Button onClick={() => navigate('/')}>Go Home</Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader className="animate-spin w-6 h-6 text-blue-500" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">Failed to load your watchlist. Please try again later.</p>
            </div>
        );
    }

    return (
        <section className="px-4 py-8 max-w-screen-xl mx-auto min-h-[80vh]">
            <motion.h1
                className="text-3xl font-bold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                Your Watchlist
            </motion.h1>

            {watchlist.length === 0 ? (
                <motion.p className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    You haven’t added anything yet.
                </motion.p>
            ) : (
                <div
                    className="grid gap-6"
                    style={{
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    }}
                >
                    <AnimatePresence>
                        {watchlist.map((item) => {
                            const isTVSeries = !!item.name;
                            const displayTitle = item.title || item.name;
                            const redirectPath = isTVSeries ? `/tv/${item.id}` : `/movie/${item.id}`;

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                                    whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    onClick={() => navigate(redirectPath)}
                                    className="relative bg-card border border-border rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all min-w-[240px]"
                                >
                                    {/* Floating type badge */}
                                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                                        <span className="bg-black/80 text-white text-[10px] px-2 py-0.5 rounded">
                                            {isTVSeries ? 'TV Series' : 'Movie'}
                                        </span>
                                    </div>

                                    {isTVSeries && item.totalSeasons && (
                                        <div className="absolute top-2 right-2 z-10">
                                            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow-sm">
                                                {item.totalSeasons} Seasons
                                            </span>
                                        </div>
                                    )}

                                    <img
                                        src={item.image || '/placeholder.svg'}
                                        alt={displayTitle}
                                        className="w-full h-56 object-cover"
                                    />

                                    <div className="p-4 flex flex-col gap-2 flex-grow">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-base font-bold truncate">{displayTitle}</h3>
                                            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                                                ★ {item.rating}
                                            </span>
                                        </div>

                                        <div className="text-xs text-muted-foreground">{item.year}</div>

                                        {/* Tags */}
                                        <div className="flex gap-2 flex-wrap">
                                            {item.extra?.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mt-auto text-xs hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-800 dark:hover:text-white"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </section>
    );
}

export default WatchlistPage;
