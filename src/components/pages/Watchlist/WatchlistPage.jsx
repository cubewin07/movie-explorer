import { useAuthen } from '@/context/AuthenProvider';
import { useNavigate } from 'react-router-dom';
import useWatchlist from '@/hooks/watchList/useWatchList';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useRemoveFromWatchList from '@/hooks/watchList/useRemoveFromWatchList';

function WatchlistPage() {
    const { user } = useAuthen();
    const navigate = useNavigate();
    const { mutate: removeFromWatchList, isError: isRemoveFailed } = useRemoveFromWatchList();

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
        <section className="px-2 sm:px-4 md:px-8 py-8 max-w-screen-xl mx-auto min-h-[80vh]">
            <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                Your Watchlist
            </motion.h1>

            {watchlist.length === 0 ? (
                <motion.p className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    You haven't added anything yet.
                </motion.p>
            ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <AnimatePresence>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: {
                                        staggerChildren: 0.1,
                                    },
                                },
                            }}
                            className="contents"
                        >
                            {watchlist.map((item) => {
                                const isTVSeries = !!item.name;
                                const displayTitle = item.title || item.name;
                                const redirectPath = isTVSeries ? `/tv/${item.id}` : `/movie/${item.id}`;

                                return (
                                    <motion.div
                                        key={item.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 50, scale: 0.9 },
                                            visible: {
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                                transition: {
                                                    type: 'spring',
                                                    stiffness: 300,
                                                    damping: 24,
                                                },
                                            },
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            rotate: -0.2,
                                            transition: { type: 'spring', stiffness: 200 },
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: 50,
                                            scale: 0.8,
                                            transition: { duration: 0.2 },
                                        }}
                                        onClick={() => navigate(redirectPath)}
                                        className="relative bg-card border border-border rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all"
                                    >
                                        {/* Floating badges */}
                                        <div className="absolute top-2 left-2 z-10">
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
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold truncate flex-grow">
                                                    {displayTitle}
                                                </h3>
                                                <span className="flex-shrink-0 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                                                    ★ {item.rating}
                                                </span>
                                            </div>

                                            <div className="text-xs text-muted-foreground">{item.year}</div>

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
                                                className="mt-auto text-xs hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-800 dark:hover:text-white transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromWatchList(item.id);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </section>
    );
}

export default WatchlistPage;
