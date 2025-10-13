import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus } from 'lucide-react';
import { useFriends } from '@/hooks/friend/useFriends';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

const FriendItem = ({ friend, compact, onFriendSelect }) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 
      transition-colors ${compact ? 'cursor-pointer' : ''}`}
    onClick={() => compact && onFriendSelect?.(friend.id)}
  >
    <Avatar className={friend.status === 'online' ? 'ring-2 ring-green-500' : ''}>
      <AvatarImage src={friend.avatarUrl || `https://avatar.vercel.sh/${friend.id}.png`} />
      <AvatarFallback>{friend.name[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="font-medium text-slate-900 dark:text-slate-100">{friend.name}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{friend.status || 'offline'}</p>
    </div>
    {!compact && <Button variant="ghost" size="sm">Message</Button>}
  </div>
);

export default function FriendsView({ onFriendSelect, compact = false }) {
  const [search, setSearch] = useState('');
  const { data: friends, isLoading, error } = useFriends();

  const filteredFriends = friends?.filter(friend => 
    friend.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className={`h-full ${compact ? 'p-2' : 'p-4'} ${
      compact ? 'bg-white dark:bg-transparent' : 'bg-white dark:bg-slate-900'
    } rounded-lg`}>
      <div className={`flex gap-2 ${compact ? 'mb-2' : 'mb-4'}`}>
        <Input 
          placeholder="Search friends..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
          size={compact ? 'sm' : undefined}
        />
        {!compact && (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[calc(100%-4rem)]">
        {isLoading && <LoadingState />}
        {error && <ErrorState message="Failed to load friends" />}
        {friends && (
          <div className="space-y-2">
            {filteredFriends.map((friend) => (
              <FriendItem 
                key={friend.id}
                friend={friend}
                compact={compact}
                onFriendSelect={onFriendSelect}
              />
            ))}
            {filteredFriends.length === 0 && (
              <div className="text-center text-slate-500 dark:text-slate-400">
                {search ? 'No friends found' : 'No friends yet'}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}