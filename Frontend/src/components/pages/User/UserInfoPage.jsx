import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import useUserInfo from '@/hooks/API/useUserInfo';
import WatchlistCard from '@/components/ui/WatchlistCard';
import useWatchlistFilmData from '@/hooks/watchList/useWatchListFilmData';


const UserInfoPage = () => {
  const { userId } = useParams();
  const { mutate: fetchUserInfo, data: userInfo, isLoading, isError } = useUserInfo();
  const { films, isLoading: isFilmsLoading, error: filmsError } = useWatchlistFilmData(userInfo?.watchlist);

  useEffect(() => {
    if (userId) {
      fetchUserInfo(userId, {
        onError: () => {
          toast.error('Failed to fetch user details');
        },
      });
    }
  }, [userId, fetchUserInfo]);

  if (isLoading) return <p>Loading user information...</p>;
  if (isError || !userInfo) return <p>Failed to load user information.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{userInfo.username}'s Profile</h1>
      <p><strong>Email:</strong> {userInfo.email}</p>
      <p><strong>Status:</strong> {userInfo.status || 'N/A'}</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Watchlist</h2>
        {userInfo.watchlist.moviesId.length > 0 && (
          <div className="mb-6">
            {films.map((item) => (
                <WatchlistCard
                    key={item.id}
                    item={item}
                    onRemove={(film) => handleRemoveFromWatchlist(film)}
                />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoPage;