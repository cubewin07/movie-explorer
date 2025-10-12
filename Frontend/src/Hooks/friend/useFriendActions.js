import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../lib/axiosInstance';

export const useFriendActions = () => {
  const queryClient = useQueryClient();

  // Send friend request
  const sendRequest = useMutation({
    mutationFn: async (email) => {
      const response = await axiosInstance.post('/friends/request', { email });
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
      const response = await axiosInstance.put('/friends/update', { email, status });
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
      const response = await axiosInstance.delete('/friends/delete', {
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