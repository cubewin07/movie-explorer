import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useWebsocket } from '@/context/Websocket/WebsocketProvider';
import useCreateChat from '@/hooks/chat/useCreateChat';
import { useAuthen } from './AuthenProvider';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';


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
  const createChat = useCallback(async (userIds) => {
    // 1. Input validation
    if (!userIds || (Array.isArray(userIds) && userIds.length === 0)) {
        console.warn("createChat: No user IDs provided");
        return null;
    }

    // 2. WebSocket connection check with proper feedback
    if (!stompClientRef.current?.connected) {
        toast.error(
            "Connection lost. Please check your internet connection.",
            {
                description: "WebSocket is not connected"
            }
        );
        return null;
    }

    // 3. Check for existing chat to prevent duplicates
    const normalizedIds = Array.isArray(userIds) ? userIds : [userIds];
    const existingChat = chats.find(chat => {
        const chatParticipants = new Set(
            chat.participants?.map(p => p.id) || []
        );
        // For 1-on-1 chats, check if same participants
        if (normalizedIds.length === 1) {
            return chatParticipants.has(normalizedIds[0]) && 
                   chatParticipants.size === 2; // 2 = user + other
        }
        // For group chats, check exact match
        return normalizedIds.every(id => chatParticipants.has(id)) &&
               chatParticipants.size === normalizedIds.length + 1;
    });

    if (existingChat) {
        console.log("Chat already exists, switching to existing chat");
        setActiveChat(existingChat.id);
        return existingChat;
    }

    // 4. Create the chat with proper error handling
    return new Promise((resolve, reject) => {
        createChatMutation(normalizedIds, {
            onSuccess: (data) => {
                try {
                    // Invalidate user info to refresh
                    queryClient.invalidateQueries({ 
                        queryKey: ['userInfo', token] 
                    });

                    // Initialize chat data
                    const newChat = {
                        ...data,
                        latestMessage: null
                    };

                    // Add to local state if not already present (sync with cache)
                    setChats((prevChats) => {
                        if (prevChats.some(c => c.id === newChat.id)) {
                            return prevChats;
                        }
                        return [newChat, ...prevChats];
                    });

                    // Subscribe to chat messages
                    subscribeToChat(stompClientRef.current, data.id);

                    // Set as active chat
                    setActiveChat(data.id);

                    // Mark as new (visual indicator)
                    setNewChatIds((prev) => new Set(prev).add(data.id));

                    // Show success feedback
                    toast.success("Chat created successfully", {
                        duration: 2000
                    });

                    resolve(newChat);
                } catch (error) {
                    console.error("Error processing chat creation response:", error);
                    reject(error);
                }
            },
            onError: (error) => {
                console.error("Failed to create chat:", error);
                
                // User-friendly error messages
                const errorMessage = 
                    error.response?.data?.message || 
                    error.message || 
                    "Failed to create chat";

                toast.error("Failed to create chat", {
                    description: errorMessage
                });

                reject(error);
            }
        });
    });
}, [chats, token, createChatMutation, queryClient, stompClientRef]);

  // Function to send a message via WebSocket
  const sendMessage = async (chatId, message) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      throw new Error("Not connected");
    }

    stompClientRef.current.publish({
      destination: "/app/chat/" + chatId + "/send",
      body: message,
    });

    // Keep signature async to allow callers to await / catch failures
    return true;
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
                if(newMessage.type === "markAsRead") {

                  // If the message is a read receipt, do not add it to messages
                  return;

                }
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