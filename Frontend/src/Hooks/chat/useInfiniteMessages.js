import instance from "@/lib/instance";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

function useInfiniteMessages(chatId) {
    const queryClient = useQueryClient();
    return useInfiniteQuery({
        queryKey: ['chat', chatId, 'messages'],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await instance.get(`/chats/${chatId}/messages`, {
                params: {
                    page: pageParam,
                    size: 20,
                }
            });
            return response.data;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.last ? undefined : lastPage.number + 1;
        },
        enabled: !!chatId,
    });
}