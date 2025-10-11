import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const SAMPLE_CHATS = [
  { id: 1, name: 'Sarah Johnson', message: 'Hey! How are you?', time: '2m', unread: 2, online: true },
  { id: 2, name: 'Michael Chen', message: 'Thanks for your help!', time: '1h', online: true },
  { id: 3, name: 'Emma Davis', message: 'See you tomorrow 👋', time: '3h', online: false },
  // Add more sample data
];

export default function ChatList() {
  const [search, setSearch] = useState('');

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
          {SAMPLE_CHATS.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 
                cursor-pointer transition-colors"
            >
              <Avatar className={chat.online ? 'ring-2 ring-green-500' : ''}>
                <AvatarImage src={`https://avatar.vercel.sh/${chat.id}.png`} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{chat.name}</p>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{chat.time}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{chat.message}</p>
              </div>
              
              {chat.unread && (
                <Badge variant="default" className="bg-blue-500 dark:bg-blue-600">
                  {chat.unread}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
