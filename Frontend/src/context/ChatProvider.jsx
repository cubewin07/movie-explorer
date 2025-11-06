import { createContext, useState, useContext } from 'react';
import { useWebsocket } from '@/context/Websocket/WebsocketProvider';


const ChatContext = createContext();

function ChatProvider({ children }) {
    

  const [activeChat, setActiveChat] = useState(null);
  const { stompClientRef } = useWebsocket();

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