import instance from "@/lib/instance";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to create a new private chat with one or more users
 * @param {string} token - User authentication token (for cache key)
 * @returns {Object} - React Query mutation with createChat function
 */
const useCreateChat = (token) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (userIds) => {
            // Normalize input: accept single ID or array of IDs
            const normalizedIds = Array.isArray(userIds) ? userIds : [userIds];
            
            // Use standard REST format
            const response = await instance.post('/chats/private', {
                userIds: normalizedIds
            });
            
            return response.data;
        },
        onSuccess: (data) => {
            // Update cache immediately to prevent UI flicker/stale data
            queryClient.setQueryData(['userInfo', token], (oldUser) => {
                if (!oldUser) return oldUser;
                
                // Check if chat already exists to prevent duplicates
                const chatExists = oldUser.chats?.some(chat => chat.id === data.id);
                if (chatExists) return oldUser;

                return {
                    ...oldUser,
                    chats: [data, ...(oldUser.chats || [])]
                };
            });

            // Invalidate user info to refresh chat list
            queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
            
            // Optional: Invalidate chats list if it exists
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        },
        onError: (error) => {
            console.error("Failed to create chat:", error);
            // Error handling done by component (toast notifications)
        }
    });
}

export default useCreateChat;
