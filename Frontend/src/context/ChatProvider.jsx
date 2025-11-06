import { createContext, useState, useContext, use } from 'react';
import { useWebsocket } from '@/context/Websocket/WebsocketProvider';
import useCreateChat from '@/hooks/chat/useCreateChat';
import { useAuthen } from './AuthenProvider';


const ChatContext = createContext();

function ChatProvider({ children }) {
    

  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const { stompClientRef } = useWebsocket();
  const { user } = useAuthen();
  const {mutate: createChatMutation} = useCreateChat(user.token);

  useEffect(() => {
    if (user) {
        // Logic to handle when user data changes, if needed
        setChats(user.chats || []);
    }
  }, [user]);

  const createChat = (participants) => {
    // Logic to create a new chat via WebSocket or API
    // For example, send a message to the server to create a new chat
    const payload = {}
    if (stompClientRef.current && stompClientRef.current.connected) {
        for(const i = 0; i < participants.length; i++) {
            const id = i + 1;
            payload['user' + id + 'Id'] = participants[i];
        }
        createChatMutation(payload, {
            onSuccess: (data) => {
                setActiveChat(data.id);
                return data;
            },
            onError: (error) => {
                console.error("Failed to create chat:", error);
            }
        });
    }
  }

  const sendMessage = (chatId, message) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
            destination: "/app/chat/" + chatId + "/send",
            body: message,
        });
    }
  }

  return (
    <ChatContext.Provider value={{ activeChat, setActiveChat }}>
      {children}
    </ChatContext.Provider>
  );
}


export function useChat() {
  return useContext(ChatContext);
}

export default ChatProvider;