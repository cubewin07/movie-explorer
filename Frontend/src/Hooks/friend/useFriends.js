import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/instance';
import { useAuthen } from '@/context/AuthenProvider';

export const useFriends = () => {
  const { token } = useAuthen();

  return useQuery({
    queryKey: ['friends', token],
    queryFn: async () => {
      const response = await instance.get('/friends/friend');
      return response.data;
    },
    enabled: !!token,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5
  });
};
