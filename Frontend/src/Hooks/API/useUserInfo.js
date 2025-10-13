import { useMutation } from '@tanstack/react-query';
import instance from '@/lib/instance';

const useUserInfo = () => {
  return useMutation({
    mutationFn: async (userId) => {
      const response = await instance.get(`/user/${userId}`);
      return response.data;
    }
  });
};

export default useUserInfo;