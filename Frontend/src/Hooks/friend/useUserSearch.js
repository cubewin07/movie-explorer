import { useQuery } from "@tanstack/react-query";
import instance from "@/lib/instance";

const useUserSearch = (debouncedQuery) => {
  return useQuery({
    queryKey: ['userSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const response = await instance.get('/user/search', {
        params: { query: debouncedQuery, page: 0 }
      });
      return response.data;
    },
    enabled: debouncedQuery.length > 0
  });
};

export default useUserSearch;