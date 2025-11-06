import instance from "@/lib/instance";
import { useMutation } from "@tanstack/react-query";

const useCreateChat = (participants) => {
    return useMutation({
        mutationFn: async () => {
            const response = await instance.post('/chats/private', participants );
            return response.data;
        },
        enabled: !!participants && Object.keys(participants).length > 0, // Only run if participants are provided
    });
}

export default useCreateChat;