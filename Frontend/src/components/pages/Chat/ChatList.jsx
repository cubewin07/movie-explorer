import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useChat } from '@/context/ChatProvider';
import { useAuthen } from '@/context/AuthenProvider';

export default function ChatList() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { chats, newChatIds } = useChat();
  const { user } = useAuthen();

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
  }, [filteredChats]);


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

  if (!chats || chats.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <p className="text-slate-500 dark:text-slate-400 text-center">
          No conversations yet. Start chatting with your friends!
        </p>
      </div>
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
      
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {sortedChats.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">
              No conversations found
            </p>
          ) : (
            sortedChats.map((chat) => {
              const displayInfo = getChatDisplayInfo(chat, user);

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
                  onClick={() => navigate(`/friend/chat/${chat.id}`)}
                >
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${displayInfo.avatarSeed}.png`} />
                    <AvatarFallback>
                      {displayInfo.isGroup ? '👥' : displayInfo.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {displayInfo.name}
                      </p>
                      {chat.latestMessage && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {getRelativeTime(chat.latestMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {chat.latestMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  
                  {chat.unreadCount > 0 && (
                    <Badge variant="default" className="bg-blue-500 dark:bg-blue-600">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

const getChatDisplayInfo = (chat, currentUser) => {
  if (chat.isGroup) {
    return {
      name: chat.name || 'Unnamed Group',
      avatarSeed: chat.name || 'group-chat',
      isGroup: true,
    };
  }

  const otherParticipant = chat.participants.find(p => p.id !== currentUser?.id);

  return {
    name: otherParticipant?.username || otherParticipant?.email || 'Unknown User',
    avatarSeed: otherParticipant?.email || otherParticipant?.username || 'user',
    isGroup: false,
  };
};