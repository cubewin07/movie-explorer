import { useMemo } from 'react';

/**
 * Hook for searching friends by username or email
 * @param {Array} friends - Array of friend objects
 * @param {string} searchTerm - Search term to filter friends
 * @returns {Array} - Filtered friends array
 */
export const useFriendSearch = (friends = [], searchTerm = '') => {
  const filteredFriends = useMemo(() => {
    if (!friends || friends.length === 0) return [];
    
    if (!searchTerm.trim()) return friends;

    return friends.filter(friend => {
      const username = friend?.user?.username?.toLowerCase() || '';
      const email = friend?.user?.email?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();

      return username.includes(searchLower) || email.includes(searchLower);
    });
  }, [friends, searchTerm]);

  return filteredFriends;
};
