import { useMutation, useQueryClient } from '@tanstack/react-query';
import instance from "@/lib/instance";

export const useNotificationActions = () => {
  const queryClient = useQueryClient();

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async ({id, token}) => {
      const response = await instance.put(`/notifications/read/${id}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
    }
  });

//   Delete notification
    const deleteNotification = useMutation({
        mutationFn: async ({id, token}) => {
            const response = await instance.delete(`/notifications/delete/${id}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
        },
        onError: (error) => {
            console.error('Error deleting notification:', error);
        }
    });

    const markAllAsRead = useMutation({
        mutationFn: async (token) => {
            const response = await instance.put('/notifications/allRead');
        return response.data;
        },
        onSuccess: () => {
        // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
        },
        onError: (error) => {
            console.error('Error marking all notifications as read:', error);
        }
    });

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}