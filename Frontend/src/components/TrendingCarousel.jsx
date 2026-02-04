import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAddToWatchlist from '@/hooks/watchList/useAddtoWatchList';
import { useAuthen } from '@/context/AuthenProvider';
import { LoginNotificationModal } from '@/components/react_components/Modal/LoginNotificationModal';
import useWatchlist from '@/hooks/watchList/useWatchList';
import { Loader2, Check, Plus } from 'lucide-react';

export function TrendingCarousel({ items }) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const { user, token } = useAuthen();
    const { mutate: addToWatchlist, isPending } = useAddToWatchlist(token);
    const { data: watchlist } = useWatchlist();

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrent((prev) => (prev + 1) % items.length);
        }, 8000); // Increased duration for better readability
        return () => clearInterval(timer);
    }, [items.length]);

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9,
            rotateY: direction > 0 ? 15 : -15,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9,
            rotateY: direction < 0 ? 15 : -15,
        }),
    };

    const next = () => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % items.length);
    };
    const prev = () => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + items.length) % items.length);
    };

    const handleAddToWatchlist = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        const isTV = !!items[current].name;
        if (isTV) {
            const sIds = Array.isArray(watchlist?.seriesId) ? watchlist.seriesId : [];
            if (sIds.includes(items[current].id)) return;
        } else {
            const mIds = Array.isArray(watchlist?.moviesId) ? watchlist.moviesId : [];
            if (mIds.includes(items[current].id)) return;
        }
        addToWatchlist({ id: items[current].id, type: isTV ? 'SERIES' : 'MOVIE' });
    };

    const handleLoginSuccess = () => {
        const isTV = !!items[current].name;
        addToWatchlist({ id: items[current].id, type: isTV ? 'SERIES' : 'MOVIE' });
    };

    return (
        <section className="relative py-12 sm:py-16 md:py-24 bg-white/5 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden perspective-1000">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative max-w-5xl mx-auto min-h-[400px] flex items-center px-4 sm:px-8">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 200, damping: 30 },
                            opacity: { duration: 0.6 },
                            scale: { duration: 0.6 },
                            rotateY: { duration: 0.6 }
                        }}
                        className="absolute inset-0 w-full h-full flex items-center justify-center"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full max-w-4xl">
                            <motion.img
                                layoutId={`img-${items[current].id}`}
                                src={items[current].image}
                                alt={items[current].title}
                                className="w-48 sm:w-64 h-72 sm:h-96 object-cover rounded-2xl shadow-2xl mx-auto md:mx-0 transform hover:scale-105 transition-transform duration-500"
                            />
                            <div className="flex-1 min-w-0 text-center md:text-left">
                                <motion.h2 
                                    className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {items[current].title}
                                </motion.h2>
                                
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                                    {items[current].year && (
                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm px-3 py-1 rounded-full font-medium">
                                            {items[current].year}
                                        </span>
                                    )}
                                    {items[current].rating && (
                                        <span className="bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 text-sm font-bold px-3 py-1 rounded-full border border-yellow-400/30">
                                            ★ {items[current].rating}
                                        </span>
                                    )}
                                </div>

                                <motion.p 
                                    className="text-gray-600 dark:text-gray-300 mb-8 text-base sm:text-lg line-clamp-4 leading-relaxed"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {items[current].description}
                                </motion.p>

                                {/* Buttons */}
                                <motion.div 
                                    className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <button
                                        onClick={() => navigate(`/movie/${items[current].id}`)}
                                        className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleAddToWatchlist()}
                                        className="px-8 py-3 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                                        disabled={isPending || (watchlist && ((!!items[current].name ? (watchlist.seriesId || []).includes(items[current].id) : (watchlist.moviesId || []).includes(items[current].id))))}
                                        aria-busy={isPending}
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
                                                Adding...
                                            </>
                                        ) : watchlist && ((!!items[current].name ? (watchlist.seriesId || []).includes(items[current].id) : (watchlist.moviesId || []).includes(items[current].id))) ? (
                                            <>
                                                <Check className="w-4 h-4 inline-block mr-2" />
                                                In Watchlist
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 inline-block mr-2" />
                                                Add to List
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-8 right-8 flex gap-4 z-20">
                <button 
                    onClick={prev} 
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-gray-800 dark:text-white transition-all hover:scale-110"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <button 
                    onClick={next} 
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-gray-800 dark:text-white transition-all hover:scale-110"
                >
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>

            {showLoginModal && (
                <LoginNotificationModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </section>
    );
}
