import { User, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import FriendshipStatusButton from './FriendshipStatusButton';

/**
 * UserProfileSection - Displays user profile information, stats, and friendship button
 */
const UserProfileSection = ({
  userInfo,
  friendshipState,
  isLoading,
  onBackClick,
  friendshipActions,
}) => {
  const totalWatchlistItems =
    (userInfo.watchlist?.moviesId?.length || 0) + (userInfo.watchlist?.seriesId?.length || 0);

  return (
    <>
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -5 }}
        onClick={onBackClick}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </motion.button>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <User className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                {userInfo.username}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1"
              >
                <Mail className="w-4 h-4" />
                <span>{userInfo.email}</span>
              </motion.div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <FriendshipStatusButton
              friendshipState={friendshipState}
              isLoading={friendshipActions.isLoading}
              onSendRequest={friendshipActions.handleSendFriendRequest}
              onAcceptRequest={friendshipActions.handleAcceptRequest}
              onBlockRequest={friendshipActions.handleBlockRequest}
              onCancelRequest={friendshipActions.handleCancelRequest}
            />
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-6 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"
          >
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalWatchlistItems}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Watchlist Items</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20"
          >
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {userInfo.watchlist?.moviesId?.length || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Movies</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center px-4 py-2 rounded-lg bg-pink-50 dark:bg-pink-900/20"
          >
            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {userInfo.watchlist?.seriesId?.length || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Series</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default UserProfileSection;
