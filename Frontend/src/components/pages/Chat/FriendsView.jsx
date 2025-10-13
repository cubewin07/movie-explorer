import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Search, Info } from 'lucide-react';
import { useFriends } from '@/hooks/friend/useFriends';
import { useFriendActions } from '@/hooks/friend/useFriendActions';
import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/instance';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import { toast } from 'sonner';

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
    <div className="flex-1 min-w-0">
      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{friend.name}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{friend.status || 'offline'}</p>
    </div>
    {!compact && <Button variant="ghost" size="sm">Message</Button>}
  </div>
);

const UserSearchCard = ({ user, compact, onViewDetails }) => {
  const { sendRequest } = useFriendActions();
  const [requestSent, setRequestSent] = useState(false);

  const handleSendRequest = () => {
    sendRequest.mutate(user.email, {
      onSuccess: () => {
        toast.success(`Friend request sent to ${user.name}`);
        setRequestSent(true);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to send request");
      }
    });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <Avatar>
        <AvatarImage src={user.avatarUrl || `https://avatar.vercel.sh/${user.id}.png`} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
        {user.mutualFriends > 0 && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {user.mutualFriends} mutual friend{user.mutualFriends > 1 ? 's' : ''}
          </p>
        )}
      </div>
      <div className="flex gap-1.5">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={() => onViewDetails?.(user)}
        >
          <Info className="h-4 w-4" />
        </Button>
        <Button 
          variant="default"
          size={compact ? "sm" : "default"}
          onClick={handleSendRequest}
          disabled={sendRequest.isPending || requestSent || user.isFriend || user.requestPending}
        >
          {requestSent || user.requestPending ? (
            'Pending'
          ) : user.isFriend ? (
            'Friends'
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Add
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const AddFriendTab = ({ compact }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['userSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const response = await instance.get('/user/search', {
        params: { query: debouncedQuery, page: 0 }
      });
      return response.data;
    },
    enabled: debouncedQuery.length > 0
  });


  const handleViewDetails = (user) => {
    // Open modal or navigate to user profile
    toast.info(`Viewing details for ${user.name}`);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className={compact ? 'h-[calc(100vh-18rem)]' : 'h-[calc(100%-5rem)]'}>
        {isLoading && <LoadingState />}
        {error && <ErrorState message="Failed to search users" />}
        
        {searchResults && searchResults?.totalPages > 0 && (
          <div className="space-y-2">
            {searchResults.map((user) => (
              <UserSearchCard 
                key={user.id}
                user={user}
                compact={compact}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {searchResults && searchResults?.totalPages === 0 && debouncedQuery && (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            No users found matching "{debouncedQuery}"
          </div>
        )}

        {!debouncedQuery && (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start typing to search for users</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default function FriendsView({ onFriendSelect, compact = false }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const { data: friends, isLoading, error } = useFriends();

  const filteredFriends = friends?.filter(friend => 
    friend.name.toLowerCase().includes(search.toLowerCase()) ||
    friend.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

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
