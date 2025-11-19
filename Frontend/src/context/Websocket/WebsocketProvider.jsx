import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from '@stomp/stompjs';
import { useAuthen } from "@/context/AuthenProvider";
import { useQueryClient } from "@tanstack/react-query";
// import queryClient from "@/lib/queryClient";
import { useFriends } from "@/hooks/friend/useFriends";

const WebSocketContext = createContext();

function WebsocketProvider({ children }) {

    const stompClientRef = useRef(null);
    const { user, token } = useAuthen();
    const [notifications, setNotifications] = useState(user?.notifications || []);
    const { data: friends, isLoading: isLoadingFriends, error } = useFriends();
    const [timeTick, setTimeTick] = useState(0);
    const queryClient = useQueryClient();
    const onConnectCallBackRef = useRef([]);

    // Update timeTick every minute to trigger re-renders for time-based UI updates
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeTick((prev) => prev + 1);
        }, 60000); // Update every minute
    
        return () => clearInterval(interval);
    }, []);
    
    // Update notifications when user data changes
    useEffect(() => {
        setNotifications(user?.notifications || []);
    }, [user?.notifications]);

    // WebSocket connection effect
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
            const notiSubId = "notifications-" + user?.id;
            const friendStatusSubId = "friends-status-" + user?.id;

            // Subscribe to notifications
            if (stompClientRef.current?._stompHandler?._subscriptions[notiSubId]) {
                console.log("Already subscribed to notifications");
            } else {
                stompClient.subscribe("/topic/notifications/" + user?.id, (message) => {
                    handleWsNotification(message, setNotifications);
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                }, { id: notiSubId });
            }

            // Subscribe to friend status updates
            if (stompClientRef.current?._stompHandler?._subscriptions[friendStatusSubId]) {
                console.log("Already subscribed to friend status");
            } else {
                stompClient.subscribe("/topic/friends/status/" + user?.id, (message) => {
                    handleWsFriendStatus(message);
                }, { id: friendStatusSubId });
            }

            
            // Execute any registered onConnect callbacks
            onConnectCallBackRef.current.forEach((callback) => {
                callback(stompClient);
            });
            onConnectCallBackRef.current = [];

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
        stompClientRef.current?.deactivate();
        stompClientRef.current = null;
      };
    }, [user?.id, isLoadingFriends]);

    // Register a callback to be called when the WebSocket connection is established
    const registerOnConnectCallback = (callback) => {
        if (stompClientRef.current?.connected) {
            callback(stompClientRef.current);
        } else {
            onConnectCallBackRef.current.push(callback);
        }
      }

    // Check if already subscribed to a topic
    const isSubscribedTo = (subId) => {
      console.log(subId);
      console.log(stompClientRef.current?._stompHandler?._subscriptions[subId]);
      if(!stompClientRef.current || !stompClientRef.current._stompHandler) return false;
        return stompClientRef.current._stompHandler._subscriptions[subId] !== undefined;
    }

    return (
        <WebSocketContext.Provider value={{notifications, friends, isLoadingFriends, error, setNotifications, stompClientRef, registerOnConnectCallback, isSubscribedTo}}>
            {children}
        </WebSocketContext.Provider>
    );
}


// Handlers for different WebSocket message types
const handleWsNotification = (message, setNotifications) => {
    console.log(message.body);
    const notification = JSON.parse(message.body);
    setNotifications((prev) => [notification, ...prev]); // Add new notifications to top
}

// Handle friend status updates
const handleWsFriendStatus = (message) => {
    console.log("Friend status update:", message.body);
    const friendStatus = JSON.parse(message.body);

  //   queryClient.setQueryData(['friends'], (oldData) => {
  //   if (!oldData) return oldData; // nothing cached yet
  //   return oldData.map((friend) => {
  //     if (friend.user.email === friendStatus.email) {
  //       return {
  //         ...friend,
  //         status: friendStatus.status,
  //       };
  //     }
  //     return friend;
  //   });
  // });

}
export const useWebsocket = () => {
    return useContext(WebSocketContext);
}

export default WebsocketProvider;