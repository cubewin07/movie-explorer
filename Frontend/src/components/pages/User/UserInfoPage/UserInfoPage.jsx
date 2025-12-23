import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserInfo from '@/hooks/API/useUserInfo';
import useWatchlistFilmData from '@/hooks/watchList/useWatchListFilmData';
import UserProfileSection from './UserProfileSection';
import UserWatchlistSection from './UserWatchlistSection';
import { useFriendshipState } from './useFriendshipState';
import { useFriendshipActions } from './useFriendshipActions';

/**
 * UserInfoPage - Main component for displaying user profile and watchlist
 * Orchestrates sub-components and manages overall page state
 */
const UserInfoPage = () => {
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const { userId } = useParams();
  const navigate = useNavigate();

  const { mutate: fetchUserInfo, data: userInfo, isLoading, isError } = useUserInfo();
  const { films, isLoading: isFilmsLoading, error: filmsError } = useWatchlistFilmData(
    userInfo?.watchlist
  );

  const friendshipState = useFriendshipState(userInfo, isRequestSent, isAccepted);
  const friendshipActions = useFriendshipActions(userInfo, setIsRequestSent, setIsAccepted);

  useEffect(() => {
    if (userId) {
      fetchUserInfo(userId, {
        onError: (error) => {
          toast.error('Failed to fetch user details');
          console.error('User fetch error:', error);
        },
      });
    }
  }, [userId, fetchUserInfo]);

  const handleRetry = () => {
    if (userId) {
      fetchUserInfo(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Loading user information...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Please wait a moment</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (isError || !userInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            User Not Found
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load this user's information. They may not exist or there was a connection
            issue.
          </p>
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm"
              onClick={handleRetry}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              onClick={() => navigate(-1)}
            >
              Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors"
    >
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <UserProfileSection
          userInfo={userInfo}
          friendshipState={friendshipState}
          isLoading={isLoading}
          onBackClick={() => navigate(-1)}
          friendshipActions={friendshipActions}
        />

        <UserWatchlistSection
          username={userInfo.username}
          films={films}
          isLoading={isFilmsLoading}
          error={filmsError}
          onRetry={handleRetry}
        />
      </div>
    </motion.div>
  );
};

export default UserInfoPage;
