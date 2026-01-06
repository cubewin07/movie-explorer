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
            
            // Optimistically update userInfo to mark latest message as read if applicable
            queryClient.setQueryData(['userInfo', token], (oldUser) => {
                if (!oldUser || !oldUser.chats) return oldUser;

                const chatIndex = oldUser.chats.findIndex(c => c.id === Number(variables.chatId));
                if (chatIndex === -1) return oldUser;

                const chat = oldUser.chats[chatIndex];
                
                // If the latest message exists and is unread, mark it as read
                // (Assuming the user just read it)
                if (chat.latestMessage && !chat.latestMessage.read) {
                     const updatedChat = {
                        ...chat,
                        latestMessage: {
                            ...chat.latestMessage,
                            read: true
                        }
                    };
                    
                    const newChats = [...oldUser.chats];
                    newChats[chatIndex] = updatedChat;
                    
                    return {
                        ...oldUser,
                        chats: newChats
                    };
                }
                
                return oldUser;
            });
        },
        onError: (error) => {
            console.error("Error marking messages as read:", error);
        }
    })
}