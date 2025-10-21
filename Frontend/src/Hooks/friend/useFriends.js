import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/instance';
import { $ZodCheckGreaterThan } from 'zod/v4/core';

export const useFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await instance.get('/friends/friend');
      console.log("Fetched");
      return response.data;
    }
  });
};