import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../lib/axiosInstance';

export const useFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await axiosInstance.get('/friends/friend');
      return response.data;
    }
  });
};