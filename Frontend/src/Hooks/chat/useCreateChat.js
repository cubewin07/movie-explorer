import instance from "@/lib/instance";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

const useCreateChat = (token) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (participants) => {
            const response = await instance.post('/chats/private', participants );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userInfo', token] });

        }
    });
}

export default useCreateChat;