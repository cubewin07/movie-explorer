import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from '@stomp/stompjs';
import { useAuthen } from "@/context/AuthenProvider";
import { no } from "zod/dist/types/v4/locales";
import { set } from "react-hook-form";


function WebsocketProvider({ children }) {

const WebSocketContext = createContext();
    const stompClientRef = useRef(null);
    const { user, token } = useAuthen();
    const [notifications, setNotifications] = useState([]);
    const [friends, setFriends] = useState([]);

  useEffect(() => {
      if (!user || !token || stompClientRef.current) return;
      
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
                console.log(message.body);
                const notification = JSON.parse(message.body);
                setNotifications((prev) => [notification, ...prev]); // Add new notifications to top
            });

            stompClient.subscribe("/topic/friends/status/" + user?.id, (message) => {
            console.log("Friend status update:", message.body);
            const friendStatus = JSON.parse(message.body);
            setFriends((prevFriends) =>
              prevFriends.map((friend) =>
                friend.email === friendStatus.email ? { ...friend, status: friendStatus.status } : friend
              )
            );
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
        <WebSocketContext.Provider value={{notifications, friends, setFriends, setNotifications}}>
            {children}
        </WebSocketContext.Provider>
    );
}
export const useWebsocket = () => {
    return useContext(WebSocketContext);
}