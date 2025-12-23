import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useFriendActions } from './useFriendActions';

/**
 * Hook for managing friend list actions (message, view profile, remove, block)
 * @returns {Object} - Contains action handlers
 */
export const useFriendListActions = () => {
  const navigate = useNavigate();
  const { deleteFriend, updateFriendStatus } = useFriendActions();

  const onMessage = useCallback((friend) => {
    // Wait for chat ui + logic finished
  }, []);

  const onViewProfile = useCallback((friend) => {
    navigate(`/user/${friend.id}`);
  }, [navigate]);

  const onRemoveFriend = useCallback((friend) => {
    deleteFriend.mutate(friend.id);
  }, [deleteFriend]);

  const onBlock = useCallback((friend) => {
    updateFriendStatus.mutate({ id: friend.id, status: 'BLOCKED' });
  }, [updateFriendStatus]);

  return {
    onMessage,
    onViewProfile,
    onRemoveFriend,
    onBlock,
  };
};
