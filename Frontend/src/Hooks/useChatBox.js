import axios from "axios";
const N8N_URL = "http://localhost:5678/webhook-test/affccf51-4ce6-42d0-8f58-dc843ac5e3ff";

function useChatBox(sessionToken) {
  const send = async () => {
    try {
        const response = await axios.post(N8N_URL, {
          message: "Hi",
          sessionToken: sessionToken,
        });
        return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
  return { send };
}

export default useChatBox;