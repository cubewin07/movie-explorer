import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useWebsocket } from '@/context/Websocket/WebsocketProvider';
import useCreateChat from '@/hooks/chat/useCreateChat';
import { useAuthen } from './AuthenProvider';
import queryClient from '@/lib/queryClient';


const ChatContext = createContext();

function ChatProvider({ children }) {
    

  const [activeChat, setActiveChat] = useState(null);
  const [newChatIds, setNewChatIds] = useState(new Set());
  const newChatIdTimeoutsRef = useRef(null);
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

  useEffect(() => {
    const client = stompClientRef.current;
    if (!client || !client.connected || !user?.id) return;

      client.subscribe("/topic/user/" + user?.id, (message) => {
        const newMessage = JSON.parse(message.body);
        console.log(newMessage);
        
        // Add this to ensure the component re-renders
        queryClient.setQueryData(['chat', newMessage?.chatId, 'messages'], (oldData) => {
          if (!oldData) return oldData; // Guard against undefined data
          
          const updatedPages = oldData.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                content: [newMessage, ...page.content],
              };
            }
            return page;
          });
          
          return {
            ...oldData,
            pages: updatedPages,
          };
        });

        setChats((prevChats) => {
            console.log(newMessage.chatId);
            const newChats = prevChats.map(chat => {
              if(chat.id === newMessage.chatId) {
                console.log(chat.id);
                return { ...chat, latestMessage: newMessage };
              }
              return chat;
            })
            return newChats;
        });
      });

  }, [user, stompClientRef.current?.connected]);

  useEffect(() => {
    if (newChatIds.size === 0) return;
    if (newChatIdTimeoutsRef.current) {
        clearTimeout(newChatIdTimeoutsRef.current);
    }
    newChatIdTimeoutsRef.current = setTimeout(() => {
        setNewChatIds(new Set());
    }, 3600000);
    return () => {
        if (newChatIdTimeoutsRef.current) {
            clearTimeout(newChatIdTimeoutsRef.current);
        }
    }
  }, [newChatIds]);

  const createChat = (participants) => {
    // Logic to create a new chat via WebSocket or API
    // For example, send a message to the server to create a new chat
    const payload = {}
    if (stompClientRef.current && stompClientRef.current.connected) {
        for(var i = 0; i < participants.length; i++) {
            const id = i + 1;
            payload['user' + id + 'Id'] = participants[i];
        }
        createChatMutation(payload, {
            onSuccess: (data) => {
              queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
              data.latestMessage = null;
              setChats((prevChats) => [data,...prevChats]);
              subscribeToChat(data.id);
              setActiveChat(data.id);
              setNewChatIds((prev) => new Set(prev).add(data.id));
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
    <ChatContext.Provider value={{ activeChat, setActiveChat, chats, setChats, createChat, sendMessage, subscribeToChat, newChatIds }}>
      {children}
    </ChatContext.Provider>
  );
}


export function useChat() {
  return useContext(ChatContext);
}

export default ChatProvider;