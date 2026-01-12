import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Play, Plus, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthen } from '@/context/AuthenProvider';
import { LoginNotificationModal } from '@/components/react_components/Modal/LoginNotificationModal';
import useAddToWatchlist from '@/hooks/watchList/useAddtoWatchList';

function FeaturedHeroSection({ featuredContent }) {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { user, token } = useAuthen();
    const { mutate: addToWatchlist } = useAddToWatchlist(token);
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

    const handleAddToWatchlist = (item) => {
        if (!user) {
            setSelectedItem(item);
            setShowLoginModal(true);
            return;
        }
        setAddingId(item.id);
        const isTV = !!item.name;
        addToWatchlist(
            { id: item.id, type: isTV ? 'SERIES' : 'MOVIE' },
            {
                onSettled: () => setAddingId(null),
            }
        );
    };

    const handleLoginSuccess = () => {
        if (selectedItem) {
            setAddingId(selectedItem.id);
            const isTV = !!selectedItem.name;
            addToWatchlist(
                { id: selectedItem.id, type: isTV ? 'TV' : 'MOVIE' },
                {
                    onSettled: () => setAddingId(null),
                }
            );
            setSelectedItem(null);
        }
    };

    if (!featuredContent) return null;

    return (
        <>
            <section 
                ref={containerRef}
                className="relative h-[85vh] min-h-[600px] w-full overflow-hidden rounded-3xl shadow-2xl mb-12 group"
            >
                {/* Parallax Background */}
                <motion.div 
                    className="absolute inset-0 w-full h-full"
                    style={{ y, scale, opacity }}
                >
                    <motion.img
                        src={`https://image.tmdb.org/t/p/original${featuredContent.backdrop_path}`}
                        alt={featuredContent.title}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent opacity-80" />
                </motion.div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 pb-24">
                    <div className="max-w-4xl space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-semibold tracking-wider mb-4 backdrop-blur-md">
                                FEATURED HIGHLIGHT
                            </span>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
                                {featuredContent.title}
                            </h1>
                        </motion.div>

                        <motion.p
                            className="text-lg md:text-xl text-gray-200 line-clamp-3 max-w-2xl font-light leading-relaxed drop-shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        >
                            {featuredContent.overview}
                        </motion.p>

                        <motion.div
                            className="flex flex-wrap gap-4 pt-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        >
                            <Button
                                onClick={() => navigate(`/movie/${featuredContent.id}`)}
                                className="bg-white text-black hover:bg-gray-200 px-8 py-6 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105"
                            >
                                <Play className="w-5 h-5 mr-2 fill-black" /> Watch Trailer
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
                                disabled={addingId === featuredContent.id}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                {addingId === featuredContent.id ? 'Adding...' : 'Add to List'}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate(`/movie/${featuredContent.id}`)}
                                className="text-white hover:bg-white/10 px-6 py-6 rounded-full text-lg font-medium backdrop-blur-sm"
                            >
                                <Info className="w-5 h-5 mr-2" /> More Info
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                >
                    <span className="text-xs tracking-widest uppercase">Scroll to Discover</span>
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ChevronDown className="w-6 h-6" />
                    </motion.div>
                </motion.div>
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
