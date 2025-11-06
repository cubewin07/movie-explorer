import instance from "@/lib/instance";
import { useQuery } from "@tanstack/react-query";

const useCreateChat = (participants) => {
    return useQuery({
        queryKey: ['createChat', participants],
        queryFn: async () => {
            const response = await instance.post('/chats/private', participants );
            return response.data;
        },
        enabled: !!participants && Object.keys(participants).length > 0, // Only run if participants are provided
    });
}