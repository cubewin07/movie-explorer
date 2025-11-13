import instance from "@/lib/instance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useMarkMessageAsRead(token) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (chatId) => {
            const response = await instance.post(`/messages/mark-as-read`, null, {
                params: {
                    chatId: chatId
                }
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['chat', variables.chatId, 'messages'] });
            queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
            console.log(data);
        },
        onError: (error) => {
            console.error("Error marking messages as read:", error);
        }
    })
}