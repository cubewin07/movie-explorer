import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from '@stomp/stompjs';
import { useAuthen } from "@/context/AuthenProvider";
import { useQueryClient } from "@tanstack/react-query";
import queryClient from "@/lib/queryClient";
import { useFriends } from "@/hooks/friend/useFriends";

const WebSocketContext = createContext();

function WebsocketProvider({ children }) {

    const stompClientRef = useRef(null);
    const { user, token } = useAuthen();
    const [notifications, setNotifications] = useState(user?.notifications || []);
    const { data: friends, isLoading: isLoadingFriends, error } = useFriends();
    const [timeTick, setTimeTick] = useState(0);
    const queryClient = useQueryClient();

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeTick((prev) => prev + 1);
        }, 60000); // Update every minute
    
        return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
        setNotifications(user?.notifications || []);
    }, [user?.notifications]);

    useEffect(() => {
      if (!user || !token || stompClientRef.current || isLoadingFriends) return;
      console.log("WebSocket effect running", user, token, stompClientRef.current);
      
      const stompClient = new Client({
        brokerURL: "ws://localhost:8080/ws?userId=" + user?.id,
        debug: (str) => {
          console.log(str);
        },
        reconnectDelay: 5000,
        connectHeaders: {
          Authorization: "Bearer " + token,
        },
        onConnect: () => {
            console.log("Connected to WebSocket");
            stompClient.subscribe("/topic/notifications/" + user?.id, (message) => {
                handleWsNotification(message, setNotifications);
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            });

            stompClient.subscribe("/topic/friends/status/" + user?.id, (message) => {
                handleWsFriendStatus(message);
            });

            stompClient.subscribe("/topic/user/" + user?.id, (message) => {
                const newMessage = JSON.parse(message.body);
                queryClient.setQueriesData(['chat', newMessage?.chatId, 'messages'], (oldData) => {
                    const updatedPages = [...oldData.pages];
                      updatedPages[0].content = [newMessage, ...updatedPages[0].content];
                      return {
                          ...oldData,
                          pages: updatedPages,
                      };
                });
            });

        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
        },
      });
      
      stompClientRef.current = stompClient;
      stompClient.activate();
  
      return () => {
        stompClient.deactivate();
      };
    }, [user, token]);

    return (
        <WebSocketContext.Provider value={{notifications, friends, isLoadingFriends, error, setNotifications, stompClientRef}}>
            {children}
        </WebSocketContext.Provider>
    );
}



const handleWsNotification = (message, setNotifications) => {
    console.log(message.body);
    const notification = JSON.parse(message.body);
    setNotifications((prev) => [notification, ...prev]); // Add new notifications to top
}

const handleWsFriendStatus = (message) => {
    console.log("Friend status update:", message.body);
    const friendStatus = JSON.parse(message.body);

    queryClient.setQueryData(['friends'], (oldData) => {
    if (!oldData) return oldData; // nothing cached yet
    return oldData.map((friend) => {
      if (friend.user.email === friendStatus.email) {
        return {
          ...friend,
          status: friendStatus.status,
        };
      }
      return friend;
    });
  });

}
export const useWebsocket = () => {
    return useContext(WebSocketContext);
}

export default WebsocketProvider;