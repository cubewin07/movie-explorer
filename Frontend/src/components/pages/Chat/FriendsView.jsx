import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Search, Mail } from 'lucide-react';
import { useFriends } from '@/hooks/friend/useFriends';
import { useFriendActions } from '@/hooks/friend/useFriendActions';
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

const AddFriendTab = ({ compact }) => {
  const [email, setEmail] = useState('');
  const { sendRequest } = useFriendActions();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    sendRequest.mutate(email, {
      onSuccess: () => {
        toast.success(`Request sent to ${email}`);
        setEmail('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="email"
            placeholder="Enter friend's email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={sendRequest.isPending}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full"
          disabled={sendRequest.isPending || !email.trim()}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {sendRequest.isPending ? 'Sending...' : 'Send Friend Request'}
        </Button>
      </form>

      {!compact && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Send a friend request by entering their email address. They'll receive a notification and can accept or decline your request.
          </p>
        </div>
      )}
    </div>
  );
};

export default function FriendsView({ onFriendSelect, compact = false }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const { data: friends, isLoading, error } = useFriends();

  if (error) {
    toast.error('Failed to load friends. Please try again later.');
  }

  const filteredFriends = friends?.filter(friend => 
    friend.name.toLowerCase().includes(search.toLowerCase()) ||
    friend.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleAddFriend = () => {
    // Simulate adding a friend
    toast.success('Friend added successfully!');
  };

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
          <ScrollArea className={compact ? 'h-[calc(100vh-16rem)]' : 'h-[calc(100%-8rem)]'}>
            <AddFriendTab compact={compact} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}