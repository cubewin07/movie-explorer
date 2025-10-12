import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../lib/axiosInstance';

export const useFriendStatus = (email) => {
  return useQuery({
    queryKey: ['friendStatus', email],
    queryFn: async () => {
      const response = await axiosInstance.get('/friends/status', {
        params: { email }
      });
      return response.data;
    },
    enabled: !!email // Only run query if email is provided
  });
};