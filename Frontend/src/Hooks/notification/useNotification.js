import instance from "@/lib/instance";
import { useQuery } from "@tanstack/react-query";

export const useNotification = () => {
  const fetchNotifications = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await instance.get('/notifications');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    onError: (error) => {
      console.error('Error fetching notifications:', error);
    }
  });   

  return { fetchNotifications };
}