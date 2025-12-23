import { User, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import WatchlistCard from '@/components/ui/WatchlistCard';

/**
 * UserWatchlistSection - Displays user's watchlist with loading and error states
 */
const UserWatchlistSection = ({ username, films, isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          {username}'s Watchlist
        </h2>
        <div className="flex flex-col justify-center items-center py-12 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Loading watchlist...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          {username}'s Watchlist
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 py-12"
        >
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-6 py-4 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="w-6 h-6" />
            <p className="font-medium">Failed to load watchlist items</p>
          </div>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (!films || films.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          {username}'s Watchlist
        </h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700"
        >
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">No items in watchlist yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This user hasn't added any movies or series</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
        {username}'s Watchlist
      </h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {films.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <WatchlistCard item={item} onRemove={() => {}} info readOnly />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default UserWatchlistSection;
