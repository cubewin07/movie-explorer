import axios from "axios";
const N8N_URL = import.meta.env.VITE_N8N_CHATBOT_WEBHOOK_URL;

function useChatBox(sessionToken) {
  const send = async (message) => {
    try {
        const response = await axios.post(N8N_URL, {
          message: message,
          sessionToken: sessionToken,
        });
        return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
  return { send };
}

export default useChatBox;