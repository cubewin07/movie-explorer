import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useFriends } from '@/hooks/friend/useFriends';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import FriendItem from "./FriendItem";
import AddFriendTab from "./AddFriendTab";
import { useFriendActions } from '@/hooks/friend/useFriendActions';
import { useWebsocket } from '@/context/Websocket/WebsocketProvider';

export default function FriendsView({ onFriendSelect, compact = false }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const { deleteFriend, updateFriendStatus } = useFriendActions();
  const navigate = useNavigate();
  const { friends, isLoadingFriends, error } = useWebsocket();

  const filteredFriends = friends?.filter(friend => 
    friend?.user?.username.toLowerCase().includes(search.toLowerCase()) ||
    friend?.user?.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Actions methods
  const onMessage = (friend) => {
    // Wait for chat ui + logic finished
  }

  const onViewProfile = (friend) => {
    navigate(`/user/${friend.id}`);
  }

  const onRemoveFriend = (friend) => {
    deleteFriend.mutate(friend.id);
  }

  const onBlock = (friend) => {
    updateFriendStatus.mutate({ id: friend.id, status: 'BLOCKED' });
  }

  return (
    <div className={`h-full ${compact ? 'p-2' : 'p-4'} ${
      compact ? 'bg-white dark:bg-transparent' : 'bg-white dark:bg-slate-900'
    } rounded-lg`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`w-full ${compact ? 'mb-2' : 'mb-4'} grid grid-cols-2`}>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span className={compact ? 'text-xs' : ''}>Friends</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <UserPlus className="h-3.5 w-3.5" />
            <span className={compact ? 'text-xs' : ''}>Add Friend</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-0">
          <div className={`mb-3 ${compact ? 'mb-2' : 'mb-3'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search friends..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                size={compact ? 'sm' : undefined}
              />
            </div>
          </div>
          
          <ScrollArea className={compact ? 'h-[calc(100vh-16rem)]' : 'h-[calc(100%-8rem)]'}>
            {isLoadingFriends && <LoadingState />}
            {error && <ErrorState message="Failed to load friends" />}
            {friends && (
              <div className="space-y-2">
                {filteredFriends.map((friend) => {
                  const friendData = { ...friend.user, status: friend.status };
                  return (
                    <FriendItem 
                      key={friend.id}
                      friend={friendData}
                      compact={compact}
                      onFriendSelect={onFriendSelect}
                      onViewProfile={onViewProfile}
                      onMessage={onMessage}
                      onRemoveFriend={onRemoveFriend}
                      onBlock={onBlock}
                    />
                  );
                })}
                {filteredFriends.length === 0 && (
                  <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                    {search ? 'No friends found' : 'No friends yet'}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="add" className="mt-0">
          <AddFriendTab compact={compact} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
