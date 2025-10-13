import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/instance';

export const useFriendStatus = (email) => {
  return useQuery({
    queryKey: ['friendStatus', email],
    queryFn: async () => {
      const response = await instance.get('/friends/status', {
        params: { email }
      });
      return response.data;
    },
    enabled: !!email // Only run query if email is provided
  });
};