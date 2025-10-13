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
    mutationFn: async ({ email, status }) => {
      const response = await instance.put('/friends/update', { email, status });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    }
  });

  // Delete friend
  const deleteFriend = useMutation({
    mutationFn: async (email) => {
      const response = await instance.delete('/friends/delete', {
        data: { email }
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    }
  });

  return {
    sendRequest,
    updateFriendStatus,
    deleteFriend
  };
};