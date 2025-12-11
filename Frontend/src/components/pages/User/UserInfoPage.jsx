import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, UserCheck, UserPlus, Loader2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserInfo from '@/hooks/API/useUserInfo';
import WatchlistCard from '@/components/ui/WatchlistCard';
import useWatchlistFilmData from '@/hooks/watchList/useWatchListFilmData';
import { useFriendActions } from '@/hooks/friend/useFriendActions';
import { useAuthen } from '@/context/AuthenProvider';

const UserInfoPage = () => {
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const { userId } = useParams();
  const navigate = useNavigate();
  const { mutate: fetchUserInfo, data: userInfo, isLoading, isError } = useUserInfo();
  const { films, isLoading: isFilmsLoading, error: filmsError } = useWatchlistFilmData(userInfo?.watchlist);
  const { sendRequest, updateFriendStatus, deleteFriend } = useFriendActions();
  const { user } = useAuthen();
  console.log(userInfo);
  console.log(user);
  

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

  const handleSendFriendRequest = () => {
    if (!userInfo?.email) {
      toast.error('User email not available');
      return;
    }

    sendRequest.mutate(userInfo.email, {
      onSuccess: () => {
        toast.success('Friend request sent successfully');
        setIsRequestSent(true);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || 'Failed to send friend request';
        toast.error(errorMessage);
      },
    });
  };

  // Accept an incoming pending request from this user
  const handleAcceptRequest = () => {
    if (!userInfo?.id) return;
    updateFriendStatus.mutate(
      { id: userInfo.id, status: 'ACCEPTED' },
      {
        onSuccess: () => toast.success('Friend request accepted'),
        onError: () => toast.error('Failed to accept request')
      }
    );
  };

  // Block the requester
  const handleBlockRequest = () => {
    if (!userInfo?.id) return;
    updateFriendStatus.mutate(
      { id: userInfo.id, status: 'BLOCKED' },
      {
        onSuccess: () => toast.success('User blocked'),
        onError: () => toast.error('Failed to block user')
      }
    );
  };

  // Cancel an outgoing pending request to this user
  const handleCancelRequest = () => {
    if (!userInfo?.id) return;
    deleteFriend.mutate(userInfo.id, {
      onSuccess: () => toast.success('Friend request canceled'),
      onError: () => toast.error('Failed to cancel request')
    });
  };

  const handleRetry = () => {
    if (userId) {
      fetchUserInfo(userId);
    }
  };

  const getFriendshipStatusButton = () => {
    // Determine pending states using current user's request lists
    const incomingPending = user?.requestsTo?.some(
      (r) => r?.user?.id === userInfo?.id && r?.status === 'PENDING'
    );
    const outgoingPending = user?.requestsFrom?.some(
      (r) => r?.user?.id === userInfo?.id && r?.status === 'PENDING'
    );

    // If there is an incoming pending request from this user -> show Accept/Block
    if (incomingPending) {
      return (
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            onClick={handleAcceptRequest}
            disabled={updateFriendStatus.isPending}
          >
            {updateFriendStatus.isPending ? 'Processing...' : 'Accept'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-50"
            onClick={handleBlockRequest}
            disabled={updateFriendStatus.isPending}
          >
            {updateFriendStatus.isPending ? 'Processing...' : 'Block'}
          </motion.button>
        </div>
      );
    }

    // If there is an outgoing pending request to this user -> show Pending + Cancel
    if (outgoingPending) {
      return (
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium">Request Pending</span>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-50"
            onClick={handleCancelRequest}
            disabled={deleteFriend.isPending}
          >
            {deleteFriend.isPending ? 'Processing...' : 'Cancel'}
          </motion.button>
        </div>
      );
    }
    // Already friends
    if (userInfo?.status === 'ACCEPTED' || isAccepted) {
      return (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800"
        >
          <UserCheck className="w-4 h-4" />
          <span className="font-medium">Friends</span>
        </motion.div>
      );
    }

    // // Pending request
    // if (userInfo?.status === 'PENDING') {
    //   return (
    //     <motion.div
    //       initial={{ scale: 0.9, opacity: 0 }}
    //       animate={{ scale: 1, opacity: 1 }}
    //       className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-200 dark:border-yellow-800"
    //     >
    //       <Loader2 className="w-4 h-4 animate-spin" />
    //       <span className="font-medium">Request Pending</span>
    //     </motion.div>
    //   );
    // }

    // Request sent in this session
    if (isRequestSent) {
      return (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <UserCheck className="w-4 h-4" />
          <span className="font-medium">Request Sent</span>
        </motion.div>
      );
    }

    // No relationship - show send request button
    return (
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        onClick={handleSendFriendRequest}
        disabled={sendRequest.isLoading}
      >
        {sendRequest.isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Send Friend Request</span>
          </>
        )}
      </motion.button>
    );
  };

  const getWatchlistContent = () => {
    if (isFilmsLoading) {
      return (
        <div className="flex flex-col justify-center items-center py-12 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
      );
    }

    if (filmsError) {
      return (
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
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </motion.div>
      );
    }

    if (!films || films.length === 0) {
      return (
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
      );
    }

    return (
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
            <WatchlistCard
              item={item}
              onRemove={() => {}}
              info
              readOnly
            />
          </motion.div>
        ))}
      </motion.div>
    );
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
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
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
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading user information...</p>
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
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            User Not Found
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load this user's information. They may not exist or there was a connection issue.
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
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalWatchlistItems =
    (userInfo.watchlist?.moviesId?.length || 0) + (userInfo.watchlist?.seriesId?.length || 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors"
    >
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
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
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
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
              {getFriendshipStatusButton()}
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

        {/* Watchlist Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            {userInfo.username}'s Watchlist
          </h2>
          {getWatchlistContent()}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserInfoPage;