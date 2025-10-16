import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '@/lib/instance';

export const useFriendActions = () => {
  const queryClient = useQueryClient();

  // Send friend request
  const sendRequest = useMutation({
    mutationFn: async (email) => {
      const response = await instance.post('/friends/request', { email });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    }
  });

  // Update friend status (accept/block)
  const updateFriendStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await instance.put('/friends/update', { id, status });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests', 'outgoing'] });

      console.log(" Friend status updated successfully");
    },
    onError: (error) => {
      console.error('Error updating friend status:', error);
    }
  });

  // Delete friend
  const deleteFriend = useMutation({
    mutationFn: async (id) => {
      const response = await instance.delete('/friends/delete', {
        params: { id }
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error) => {
      console.error('Error deleting friend:', error);
    }
  });

  return {
    sendRequest,
    updateFriendStatus,
    deleteFriend
  };
};