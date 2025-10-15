import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, UserCheck, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import useUserInfo from '@/hooks/API/useUserInfo';
import WatchlistCard from '@/components/ui/WatchlistCard';
import useWatchlistFilmData from '@/hooks/watchList/useWatchListFilmData';
import { useFriendActions } from '@/hooks/friend/useFriendActions';

const UserInfoPage = () => {
  const [isRequestSent, setIsRequestSent] = useState(false);
  const { userId } = useParams();
  const navigate = useNavigate();
  const { mutate: fetchUserInfo, data: userInfo, isLoading, isError } = useUserInfo();
  const { films, isLoading: isFilmsLoading, error: filmsError } = useWatchlistFilmData(userInfo?.watchlist);
  const { sendRequest } = useFriendActions();

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

  const getFriendshipStatusButton = () => {
    // Already friends
    if (userInfo?.status === 'ACCEPTED') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
          <UserCheck className="w-4 h-4" />
          <span className="font-medium">Friends</span>
        </div>
      );
    }

    // Pending request
    if (userInfo?.status === 'PENDING') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-medium">Request Pending</span>
        </div>
      );
    }

    // Request sent in this session
    if (isRequestSent) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
          <UserCheck className="w-4 h-4" />
          <span className="font-medium">Request Sent</span>
        </div>
      );
    }

    // No relationship - show send request button
    return (
      <button
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </button>
    );
  };

  const getWatchlistContent = () => {
    if (isFilmsLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (filmsError) {
      return (
        <div className="flex items-center gap-2 text-red-600 py-6">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load watchlist items</p>
        </div>
      );
    }

    if (!films || films.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No items in watchlist yet</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {films.map((item) => (
          <WatchlistCard
            key={item.id}
            item={item}
            onRemove={() => {}} // Read-only for other users
            info
            readOnly
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading user information...</p>
      </div>
    );
  }

  if (isError || !userInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <p className="text-xl text-gray-700 mb-4">Failed to load user information</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  const totalWatchlistItems =
    (userInfo.watchlist?.moviesId?.length || 0) + (userInfo.watchlist?.seriesId?.length || 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userInfo.username}</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Mail className="w-4 h-4" />
                <span>{userInfo.email}</span>
              </div>
            </div>
          </div>
          {getFriendshipStatusButton()}
        </div>

        {/* Stats */}
        <div className="flex gap-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalWatchlistItems}</p>
            <p className="text-sm text-gray-600">Watchlist Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {userInfo.watchlist?.moviesId?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Movies</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-600">
              {userInfo.watchlist?.seriesId?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Series</p>
          </div>
        </div>
      </div>

      {/* Watchlist Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          {userInfo.username}'s Watchlist
        </h2>
        {getWatchlistContent()}
      </div>
    </div>
  );
};

export default UserInfoPage;