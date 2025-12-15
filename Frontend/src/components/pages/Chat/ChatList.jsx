import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useChat } from '@/context/ChatProvider';
import useMarkMessageAsRead from '@/hooks/chat/useMarkMessageAsRead';
import { useAuthen } from '@/context/AuthenProvider';
import { useNotificationActions } from '@/hooks/notification/useNotificationActions';
import { useWebsocket } from '@/context/Websocket/WebsocketProvider';

export default function ChatList() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { chats, newChatIds } = useChat();
  const { user, token } = useAuthen();
  const { friends } = useWebsocket();
  const { mutate: markMessageAsRead } = useMarkMessageAsRead(token);
  const { markChatNotificationsAsRead } = useNotificationActions(token);

  // Extract the active chatId from the current path
  const activeChatId = location.pathname.split('/').pop();

  // Filter chats based on search
  const filteredChats = useMemo(() => {
    if (!search.trim()) return chats;
    
    return chats.filter(chat => {
      const displayInfo = getChatDisplayInfo(chat, user);
      const searchLower = search.toLowerCase();
      
      // Search in display name
      if (displayInfo.name.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Also search in participant emails
      return chat.participants.some(p => 
        p.id !== user?.id && p.email?.toLowerCase().includes(searchLower)
      );
    });
  }, [chats, search, user]);

  // Sort chats by latest message timestamp (if available)
  const sortedChats = useMemo(() => {
    return [...filteredChats].sort((a, b) => {
      const aIsNew = newChatIds.has(a.id);
      const bIsNew = newChatIds.has(b.id);

      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      if (aIsNew && bIsNew) return b.id - a.id;
      
      if (!a.latestMessage && !b.latestMessage) return 0;
      if (!a.latestMessage) return 1;
      if (!b.latestMessage) return -1;
      return new Date(b.latestMessage.timestamp) - new Date(a.latestMessage.timestamp);
    });
  }, [filteredChats, newChatIds]);


  // Format timestamp to relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now - messageTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageTime.toLocaleDateString();
  };

  const handleClickChat = (chatId) => {
    navigate(`/friend/chat/${chatId}`);
    markMessageAsRead(chatId);
    markChatNotificationsAsRead.mutate(chatId);
  }

  if (!chats || chats.length === 0) {
    return (
      <motion.div 
        className="h-full flex flex-col items-center justify-center p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="mb-4"
        >
          <MessageCircle className="h-12 w-12 text-slate-400 dark:text-slate-500" />
        </motion.div>
        <motion.p
          className="text-sm text-slate-500 dark:text-slate-400 text-center mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          No conversations yet
        </motion.p>
        <motion.p
          className="text-xs text-slate-400 dark:text-slate-500 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Start chatting with your friends!
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <Input 
          placeholder="Search conversations..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="space-y-2 p-4">
          {sortedChats.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">
              No conversations found
            </p>
          ) : (
            sortedChats.map((chat) => {
              const displayInfo = getChatDisplayInfo(chat, user);
              const friendInfo = !displayInfo.isGroup ? getFriendInfo(displayInfo.email, friends) : null;

              return (
                <motion.div
                  key={chat.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors shadow-sm 
                    ${
                      chat.id.toString() === activeChatId
                        ? 'bg-blue-200 dark:bg-blue-900 scale-[1.02] shadow-md'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-[1.02] hover:shadow-md'
                    }`}
                  onClick={() => handleClickChat(chat.id)}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className={friendInfo?.isOnline ? 'ring-2 ring-green-500' : ''}>
                      <AvatarImage src={`https://avatar.vercel.sh/${displayInfo.avatarSeed}.png`} />
                      <AvatarFallback>
                        {displayInfo.isGroup ? '👥' : displayInfo.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online status indicator */}
                    {friendInfo?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex justify-between items-center gap-2 mb-0.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {displayInfo.name}
                        </p>
                        {/* Friend/Stranger badge */}
                        {!displayInfo.isGroup && friendInfo && (
                          <Badge 
                            variant={friendInfo.isFriend ? "default" : "outline"}
                            className={`text-xs flex-shrink-0 ${
                              friendInfo.isFriend 
                                ? 'bg-emerald-500 dark:bg-emerald-600 text-white' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {friendInfo.isFriend ? 'Friend' : 'Stranger'}
                          </Badge>
                        )}
                      </div>
                      {chat.latestMessage && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 whitespace-nowrap">
                          {getRelativeTime(chat.latestMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate overflow-hidden text-ellipsis whitespace-nowrap">
                      {chat.latestMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  
                  {chat.unreadCount > 0 && (
                    <Badge variant="default" className="bg-blue-500 dark:bg-blue-600 flex-shrink-0">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}



// Get friend status and relationship info
const getFriendInfo = (email, friends) => {
  if (!email || !friends) {
    return { isFriend: false, status: undefined };
  }

  const friend = friends.find(f => f.user?.email === email);
  
  if (!friend) {
    return { isFriend: false, status: undefined };
  }

  return {
    isFriend: true,
    status: friend.status,
    isOnline: friend.status === true || friend.status === 'online',
  };
};