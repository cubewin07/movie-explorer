import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, useScroll, useTransform } from 'framer-motion';
import { Play, Plus, ChevronDown, Info, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthen } from '@/context/AuthenProvider';
import { LoginNotificationModal } from '@/components/react_components/Modal/LoginNotificationModal';
import useAddToWatchlist from '@/hooks/watchList/useAddtoWatchList';
import useWatchlist from '@/hooks/watchList/useWatchList';

function FeaturedHeroSection({ featuredContent }) {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { user, token } = useAuthen();
    const { mutate: addToWatchlist } = useAddToWatchlist(token);
    const { data: watchlist, refetch: refetchWatchlist } = useWatchlist({ enabled: false });
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [addingId, setAddingId] = useState(null);

    // Parallax effect for background
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
    const indicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

    const loadWatchlistSnapshot = async () => {
        if (watchlist) return watchlist;
        try {
            const result = await refetchWatchlist();
            return result?.data ?? null;
        } catch {
            return null;
        }
    };

    const handleAddToWatchlist = async (item) => {
        if (!user) {
            setSelectedItem(item);
            setShowLoginModal(true);
            return;
        }

        const watchlistSnapshot = await loadWatchlistSnapshot();
        const isTV = !!item.name;
        if (isTV) {
            const seriesIds = Array.isArray(watchlistSnapshot?.seriesId) ? watchlistSnapshot.seriesId : [];
            if (seriesIds.includes(item.id)) return;
        } else {
            const movieIds = Array.isArray(watchlistSnapshot?.moviesId) ? watchlistSnapshot.moviesId : [];
            if (movieIds.includes(item.id)) return;
        }

        setAddingId(item.id);
        addToWatchlist(
            { id: item.id, type: isTV ? 'SERIES' : 'MOVIE' },
            {
                onSettled: () => setAddingId(null),
            }
        );
    };

    const handleLoginSuccess = async () => {
        if (selectedItem) {
            const watchlistSnapshot = await loadWatchlistSnapshot();
            const isTV = !!selectedItem.name;
            if (isTV) {
                const seriesIds = Array.isArray(watchlistSnapshot?.seriesId) ? watchlistSnapshot.seriesId : [];
                if (seriesIds.includes(selectedItem.id)) {
                    setSelectedItem(null);
                    return;
                }
            } else {
                const movieIds = Array.isArray(watchlistSnapshot?.moviesId) ? watchlistSnapshot.moviesId : [];
                if (movieIds.includes(selectedItem.id)) {
                    setSelectedItem(null);
                    return;
                }
            }

            setAddingId(selectedItem.id);
            addToWatchlist(
                { id: selectedItem.id, type: isTV ? 'SERIES' : 'MOVIE' },
                {
                    onSettled: () => setAddingId(null),
                }
            );
            setSelectedItem(null);
        }
    };

    const featuredId = featuredContent?.id;
    const isTV = !!featuredContent?.name;
    const isInWatchlist = useMemo(() => {
        if (!watchlist || !featuredId) return false;
        if (isTV) {
            const seriesIds = Array.isArray(watchlist?.seriesId) ? watchlist.seriesId : [];
            return seriesIds.includes(featuredId);
        }
        const movieIds = Array.isArray(watchlist?.moviesId) ? watchlist.moviesId : [];
        return movieIds.includes(featuredId);
    }, [watchlist, featuredId, isTV]);

    if (!featuredContent) return null;

    return (
        <>
            <section 
                ref={containerRef}
                className="relative h-[85vh] min-h-[520px] sm:min-h-[560px] md:min-h-[600px] w-full overflow-hidden rounded-3xl shadow-2xl mb-12 group"
            >
                {/* Parallax Background */}
                <Motion.div 
                    className="absolute inset-0 w-full h-full"
                    style={{ y, scale, opacity }}
                >
                    <Motion.img
                        src={`https://image.tmdb.org/t/p/original${featuredContent.backdrop_path}`}
                        alt={featuredContent.title || featuredContent.name}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent opacity-80" />
                </Motion.div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 pb-24">
                    <div className="max-w-4xl space-y-6">
                        <Motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-semibold tracking-wider mb-4 backdrop-blur-md">
                                FEATURED HIGHLIGHT
                            </span>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
                                {featuredContent.title || featuredContent.name}
                            </h1>
                        </Motion.div>

                        <Motion.p
                            className="text-lg md:text-xl text-gray-200 line-clamp-3 max-w-2xl font-light leading-relaxed drop-shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        >
                            {featuredContent.overview}
                        </Motion.p>

                        <Motion.div
                            className="flex flex-wrap gap-4 pt-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        >
                            <Button
                                onClick={() => navigate(`/${isTV ? 'tv' : 'movie'}/${featuredContent.id}`)}
                                className="bg-white text-black hover:bg-gray-200 px-8 py-6 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105"
                            >
                                <Info className="w-5 h-5 mr-2" /> View Details
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleAddToWatchlist(featuredContent)}
                                className="
                                    border-white/30 bg-white/10 text-white backdrop-blur-md
                                    hover:bg-white/20 hover:border-white/50
                                    px-8 py-6 rounded-full text-lg font-medium
                                    transition-all duration-300
                                "
                                disabled={addingId === featuredContent.id || isInWatchlist}
                                aria-busy={addingId === featuredContent.id}
                                aria-disabled={isInWatchlist}
                            >
                                {addingId === featuredContent.id ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Adding...
                                    </>
                                ) : isInWatchlist ? (
                                    <>
                                        <Check className="w-5 h-5 mr-2" />
                                        In Watchlist
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add to Watchlist
                                    </>
                                )}
                            </Button>
                        </Motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <Motion.div 
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
                    style={{ opacity: indicatorOpacity }}
                >
                    <span className="text-xs tracking-widest uppercase">Scroll to Discover</span>
                    <Motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ChevronDown className="w-6 h-6" />
                    </Motion.div>
                </Motion.div>
            </section>

            {showLoginModal && (
                <LoginNotificationModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </>
    );
}

export default FeaturedHeroSection;
