import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/instance';

export const useFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await instance.get('/friends/friend');
      return response.data;
    }
  });
};