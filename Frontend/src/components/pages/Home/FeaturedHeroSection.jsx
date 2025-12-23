import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthen } from '@/context/AuthenProvider';
import { LoginNotificationModal } from '@/components/react_components/Modal/LoginNotificationModal';
import useAddToWatchlist from '@/hooks/watchList/useAddtoWatchList';

function FeaturedHeroSection({ featuredContent }) {
    const navigate = useNavigate();
    const { user, token } = useAuthen();
    const { mutate: addToWatchlist } = useAddToWatchlist(token);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [addingId, setAddingId] = useState(null);

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
            <section className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden mb-8 shadow-xl">
                <div className="absolute inset-0">
                    <img
                        src={`https://image.tmdb.org/t/p/original${featuredContent.backdrop_path}`}
                        alt={featuredContent.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent dark:from-slate-950/90 dark:via-slate-900/60 dark:to-transparent" />
                </div>
                <motion.div
                    className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="max-w-2xl">
                        <motion.h1
                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {featuredContent.title}
                        </motion.h1>
                        <motion.p
                            className="text-white/90 text-sm sm:text-base mb-6 line-clamp-3 drop-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {featuredContent.overview}
                        </motion.p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Button
                                onClick={() => navigate(`/movie/${featuredContent.id}`)}
                                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 shadow-lg"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Play className="w-4 h-4 mr-2" /> Watch Now
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleAddToWatchlist(featuredContent)}
                                className="
                                    border-black text-black bg-white 
                                    hover:from-blue-500 hover:to-cyan-500 hover:bg-gradient-to-r hover:text-white
                                    shadow-md 
                                    dark:border-white dark:text-white dark:bg-transparent 
                                    dark:hover:bg-blue-900 dark:hover:text-white 
                                    transition-all duration-200
                                "
                                whileHover={{ scale: 1.05 }}
                                disabled={addingId === featuredContent.id}
                            >
                                <Plus className="w-4 h-4 mr-2" />{' '}
                                {addingId === featuredContent.id ? 'Adding...' : 'Add to Watchlist'}
                            </Button>
                        </motion.div>
                    </div>
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
