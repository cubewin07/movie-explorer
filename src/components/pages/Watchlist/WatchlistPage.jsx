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
        <section className="px-4 py-8">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {watchlist.map((item) => {
                            const isTVSeries = !!item.name;
                            const displayTitle = item.title || item.name;

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 30 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative bg-card border border-border rounded-xl shadow-lg overflow-hidden flex flex-col"
                                >
                                    {/* Floating badge for type */}
                                    <div className="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded z-10">
                                        {isTVSeries ? 'TV Series' : 'Movie'}
                                    </div>

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

                                        {/* Show seasons if it's a TV series */}
                                        {isTVSeries && item.totalSeasons && (
                                            <div className="text-xs text-blue-700 font-semibold">
                                                {item.totalSeasons} Seasons
                                            </div>
                                        )}

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
                                            className="mt-auto text-xs"
                                            onClick={() => console.log('Remove feature coming soon')}
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
