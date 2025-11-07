import instance from "@/lib/instance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useGettingSpecificChat() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (chatId) => {
            const response = await instance.get(`/chats`, {
                params: {
                    chatId: chatId
                }
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['chat', variables.chatId] });
        }
    });
}