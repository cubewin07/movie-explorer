import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/instance';

export const useFriendRequests = () => {
  // Get requests sent to current user
  const incomingRequests = useQuery({
    queryKey: ['friendRequests', 'incoming'],
    queryFn: async () => {
      const response = await instance.get('/friends/requestsTo');
      return response.data;
    }
  });

  // Get requests sent by current user
  const outgoingRequests = useQuery({
    queryKey: ['friendRequests', 'outgoing'],
    queryFn: async () => {
      const response = await instance.get('/friends/requestsFrom');
      return response.data;
    }
  });

  return {
    incomingRequests,
    outgoingRequests
  };
};