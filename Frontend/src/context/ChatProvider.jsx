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
  const { stompClientRef, registerOnConnectCallback, isSubscribedTo } = useWebsocket();
  const { user, token } = useAuthen();
  const {mutate: createChatMutation} = useCreateChat(token);

  useEffect(() => {
    if (user) {
        // Logic to handle when user data changes, if needed
        setChats(user.chats || []);
    }
  }, [user]);

  useEffect(() => {

    if(!user) return;

    const userWsSubId = "user-" + user?.id;
    if (isSubscribedTo(userWsSubId)) {
        console.log("Already subscribed to user updates");
        return;
    }

    registerOnConnectCallback((stompClient) => {
      stompClient.subscribe("/topic/user/" + user?.id, (message) => {
        const newMessage = JSON.parse(message.body);
        console.log(newMessage);

      }, { id: userWsSubId });
    });

    registerOnConnectCallback((stompClient) => {
      subscribeToChat(stompClient, user.chats.flatMap(chat => chat.id));
    })

  }, [user]);

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

  const subscribeToChat = (stompClient = stompClientRef.current, chatIds) => {
    if (stompClient && stompClient.connected) {
      if (!Array.isArray(chatIds)) {
        chatIds = [chatIds];
      }
      chatIds.forEach((chatId) => {
        const destination = "/topic/chat/" + chatId;
        const subId = "chat-" + chatId;
        if (isSubscribedTo(subId)) {
          console.log("Already subscribed to chat:", chatId);

          return;
        }
          stompClient.subscribe(
              destination ,
              (message) => {
                const newMessage = JSON.parse(message.body);
                  queryClient.setQueryData(["chat", chatId, "messages"], (oldData) => {
                    if (!oldData) return oldData; // Guard against undefined data
                    console.log(newMessage);
          
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
                  // Update latest message in chats list
                  setChats((prevChats) => {
                    const chatIndex = prevChats.findIndex(chat => chat.id === chatId);
                    if (chatIndex === -1) {
                        // If chat not found, return previous chats
                        return prevChats;
                    }
                    const updatedChat = prevChats[chatIndex];
                    updatedChat.latestMessage = newMessage;
                    const newChats = [...prevChats];

                    newChats.splice(chatIndex, 1);
                    return [updatedChat, ...newChats];
                });

              },
              { id: subId }
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