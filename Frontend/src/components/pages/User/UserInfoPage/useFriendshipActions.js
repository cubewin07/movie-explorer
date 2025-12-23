import { useCallback } from 'react';
import { toast } from 'sonner';
import { useFriendActions } from '@/hooks/friend/useFriendActions';

/**
 * Hook to manage friendship action handlers
 * @param {Object} userInfo - The user being interacted with
 * @param {Function} setIsRequestSent - Update session request sent state
 * @param {Function} setIsAccepted - Update session accepted state
 * @returns {Object} Friendship action handlers and loading states
 */
export const useFriendshipActions = (userInfo, setIsRequestSent, setIsAccepted) => {
  const { sendRequest, updateFriendStatus, deleteFriend } = useFriendActions();

  const handleSendFriendRequest = useCallback(() => {
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
  }, [userInfo?.email, sendRequest, setIsRequestSent]);

  const handleAcceptRequest = useCallback(() => {
    if (!userInfo?.id) return;
    updateFriendStatus.mutate(
      { id: userInfo.id, status: 'ACCEPTED' },
      {
        onSuccess: () => {
          toast.success('Friend request accepted');
          setIsAccepted(true);
        },
        onError: () => toast.error('Failed to accept request'),
      }
    );
  }, [userInfo?.id, updateFriendStatus, setIsAccepted]);

  const handleBlockRequest = useCallback(() => {
    if (!userInfo?.id) return;
    updateFriendStatus.mutate(
      { id: userInfo.id, status: 'BLOCKED' },
      {
        onSuccess: () => toast.success('User blocked'),
        onError: () => toast.error('Failed to block user'),
      }
    );
  }, [userInfo?.id, updateFriendStatus]);

  const handleCancelRequest = useCallback(() => {
    if (!userInfo?.id) return;
    deleteFriend.mutate(userInfo.id, {
      onSuccess: () => toast.success('Friend request canceled'),
      onError: () => toast.error('Failed to cancel request'),
    });
  }, [userInfo?.id, deleteFriend]);

  return {
    handleSendFriendRequest,
    handleAcceptRequest,
    handleBlockRequest,
    handleCancelRequest,
    isLoading: {
      send: sendRequest.isLoading,
      update: updateFriendStatus.isPending,
      delete: deleteFriend.isPending,
    },
  };
};
