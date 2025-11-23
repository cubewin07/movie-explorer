import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useWebsocket } from '@/context/Websocket/WebsocketProvider';
import useCreateChat from '@/hooks/chat/useCreateChat';
import { useAuthen } from './AuthenProvider';
import { useQueryClient } from '@tanstack/react-query';
import { set } from 'react-hook-form';


const ChatContext = createContext();

function ChatProvider({ children }) {
    

  const [activeChat, setActiveChat] = useState(null);
  const [newChatIds, setNewChatIds] = useState(new Set());
  const [chatNotifications, setChatNotifications] = useState([]);
  const newChatIdTimeoutsRef = useRef(null);
  const [chats, setChats] = useState([]);
  const { stompClientRef, registerOnConnectCallback, isSubscribedTo } = useWebsocket();
  const { user, token } = useAuthen();
  const {mutate: createChatMutation} = useCreateChat(token);
  const queryClient = useQueryClient();

  // Update chats when user data changes
  useEffect(() => {
    if (user) {
        // Logic to handle when user data changes, if needed
        setChats(user.chats || []);
    }
  }, [user?.id, user?.chats]);

  useEffect(() => {
      if (!user) return;
      setChatNotifications(user?.notifications?.filter(noti => noti.type === 'chat' && noti.read === false) || []);
      console.log("user?.notifications:", user?.notifications);

    }, [user?.notifications]);

  useEffect(() => {
    console.log("chatNotifications changed:", chatNotifications);

  }, [chatNotifications])


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

  }, [user?.id]);

  // Clear newChatIds after 1 hour
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

  // Function to create a new chat
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
              console.log(data);
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

  // Function to send a message via WebSocket
  const sendMessage = (chatId, message) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
            destination: "/app/chat/" + chatId + "/send",
            body: message,
        });
    }
  }

  // Function to subscribe to chat messages
  const subscribeToChat = (stompClient = stompClientRef.current, chatIds) => {
    if (stompClient && stompClient.connected) {
      // Ensure chatIds is an array
      if (!Array.isArray(chatIds)) {
        chatIds = [chatIds];
      }

      // Subscribe to each chat's topic
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
                    // Update latest message and move chat to top
                    const updatedChat = prevChats[chatIndex];
                    updatedChat.latestMessage = newMessage;
                    const newChats = [...prevChats];

                    newChats.splice(chatIndex, 1);
                    return [updatedChat, ...newChats];
                });

                // Add to chat notifications if the message is not from the current user
                if (newMessage.senderId !== user?.id) {
                  console.log("New chat message notification:", newMessage);
                  setChatNotifications((prev) => [newMessage, ...prev]);
                }
              },
              { id: subId }
          );
      });
    }
  } 

  return (
    <ChatContext.Provider value={{ activeChat, setActiveChat, chats, setChats, createChat, sendMessage, subscribeToChat, newChatIds, chatNotifications, setChatNotifications }}>
      {children}
    </ChatContext.Provider>
  );
}


export function useChat() {
  return useContext(ChatContext);
}

export default ChatProvider;