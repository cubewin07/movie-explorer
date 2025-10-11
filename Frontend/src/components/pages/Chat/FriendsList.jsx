import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus } from 'lucide-react';

const SAMPLE_FRIENDS = [
  { id: 1, name: 'Alice Cooper', status: 'online' },
  { id: 2, name: 'Bob Wilson', status: 'offline' },
  { id: 3, name: 'Carol Smith', status: 'online' },
];

export default function FriendsList() {
  const [search, setSearch] = useState('');

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex gap-2 mb-4">
        <Input 
          placeholder="Search friends..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {SAMPLE_FRIENDS.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 
                transition-colors"
            >
              <Avatar className={friend.status === 'online' ? 'ring-2 ring-green-500' : ''}>
                <AvatarImage src={`https://avatar.vercel.sh/${friend.id}.png`} />
                <AvatarFallback>{friend.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-slate-100">{friend.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{friend.status}</p>
              </div>
              <Button variant="ghost" size="sm">Message</Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
