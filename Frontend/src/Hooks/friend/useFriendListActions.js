import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useFriendActions } from './useFriendActions';
import { useChat } from '@/context/ChatProvider';
import { toast } from 'sonner';

/**
 * Hook for managing friend list actions (message, view profile, remove, block)
 * @returns {Object} - Contains action handlers
 */
export const useFriendListActions = () => {
  const navigate = useNavigate();
  const { deleteFriend, updateFriendStatus } = useFriendActions();
  const { createChat } = useChat();

  const onMessage = useCallback(async (friend) => {
    try {
      if (!friend?.id) {
        toast.error("Invalid friend data");
        return;
      }

      // Create or get existing chat with this friend
      const chat = await createChat(friend.id);
      
      if (chat) {
        console.log("Chat created/opened:", chat.id);
        // Chat Provider already sets activeChat, so UI will navigate
        // No additional action needed
      }
    } catch (error) {
      console.error("Error opening chat with friend:", error);
      toast.error("Could not open chat", {
        description: "Please try again"
      });
    }
  }, [createChat]);

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
