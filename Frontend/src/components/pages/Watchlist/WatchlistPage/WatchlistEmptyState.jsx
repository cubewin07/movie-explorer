import { Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * WatchlistEmptyState Component
 * 
 * Displays when the user's watchlist is empty.
 * Provides visual feedback and navigation to discovery page.
 */
function WatchlistEmptyState() {
    const navigate = useNavigate();

    return (
        <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="mx-auto mb-6 w-24 h-24 bg-muted rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
                <div className="flex items-center gap-2">
                    <Film className="w-8 h-8 text-muted-foreground" />
                    <Tv className="w-8 h-8 text-muted-foreground" />
                </div>
            </motion.div>
            
            <motion.h3 
                className="text-xl font-semibold mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                Your Watchlist is Empty
            </motion.h3>
            
            <motion.p 
                className="text-muted-foreground mb-6 max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                Start building your personal collection by adding movies and TV shows you want to watch.
            </motion.p>
            
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Button 
                    onClick={() => navigate('/movies')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                >
                    Discover Movies & TV Shows
                </Button>
            </motion.div>
        </motion.div>
    );
}

export default WatchlistEmptyState;
