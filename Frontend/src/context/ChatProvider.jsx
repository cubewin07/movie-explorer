import { createContext, useState, useContext } from 'react';
import { useWebsocket } from '@/context/Websocket/WebsocketProvider';
import useCreateChat from '@/hooks/chat/useCreateChat';
import { useAuthen } from './AuthenProvider';
import queryClient from '@/lib/queryClient';
import { set } from 'react-hook-form';


const ChatContext = createContext();

function ChatProvider({ children }) {
    

  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const { stompClientRef } = useWebsocket();
  const { user, token } = useAuthen();
  const {mutate: createChatMutation} = useCreateChat(token);

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
              queryClient.invalidateQueries({ queryKey: ['chats'] });
              queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
              setChats((prevChats) => [data,...prevChats]);
              subscribeToChat(data.id);
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

  const subscribeToChat = (chatIds) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      if (!Array.isArray(chatIds)) {
        chatIds = [chatIds];
      }
      chatIds.forEach((chatId) => {
          stompClientRef.current.subscribe(
              "topic/chat/" + chatId,
              (message) => {
                  queryClient.setQueryData([chatId, "chat", "messages"], (oldData) => {
                      const newMessage = JSON.parse(message.body);
                      const updatedPages = [...oldData.pages];
                      updatedPages[0].content = [newMessage, ...updatedPages[0].content];
                      return {
                          ...oldData,
                          pages: updatedPages,
                      };
                  });
              }
          );
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