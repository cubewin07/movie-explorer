import { motion, AnimatePresence } from 'framer-motion';
import WatchlistCard from '@/components/ui/WatchlistCard';

/**
 * WatchlistGrid Component
 * 
 * Displays films in a responsive grid with staggered animation.
 * 
 * @param {Object} props
 * @param {Array<Object>} props.films - Array of film objects to display
 * @param {Function} props.onRemove - Callback function when film is removed from watchlist
 * @returns {JSX.Element}
 */
function WatchlistGrid({ films, onRemove }) {
    return (
        <div className="grid gap-3 xs:gap-4 sm:gap-5 md:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
                    {films.map((item) => (
                        <WatchlistCard
                            key={item.id}
                            item={item}
                            onRemove={(film) => onRemove(film)}
                        />
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default WatchlistGrid;
