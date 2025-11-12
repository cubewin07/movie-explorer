import instance from "@/lib/instance";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

function useInfiniteMessages(chatId) {
    const queryClient = useQueryClient();
    const normalizedChatId = Number(chatId);
    return useInfiniteQuery({
        queryKey: ['chat', normalizedChatId, 'messages'],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await instance.get(`/messages`, {
                params: {
                    chatId: chatId,
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

export default useInfiniteMessages;