import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Search } from 'lucide-react';

import { useFriends } from '@/hooks/friend/useFriends';
import { useFriendListActions } from '@/hooks/friend/useFriendListActions';
import { useWebsocket } from '@/context/Websocket/WebsocketProvider';
import FriendsList from './FriendsList';
import AddFriendTab from './AddFriendTab';

/**
 * FriendsView Component
 * Main component for managing friends and adding new friends
 * Tabs between viewing friends list and adding new friends
 */
export default function FriendsView({ onFriendSelect, compact = false }) {
  const [activeTab, setActiveTab] = useState('friends');
  const { friends, isLoadingFriends, error } = useWebsocket();
  const { onMessage, onViewProfile, onRemoveFriend, onBlock } = useFriendListActions();

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
          <FriendsList
            friends={friends}
            isLoadingFriends={isLoadingFriends}
            error={error}
            compact={compact}
            onFriendSelect={onFriendSelect}
            onViewProfile={onViewProfile}
            onMessage={onMessage}
            onRemoveFriend={onRemoveFriend}
            onBlock={onBlock}
          />
        </TabsContent>

        <TabsContent value="add" className="mt-0">
          <AddFriendTab compact={compact} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
