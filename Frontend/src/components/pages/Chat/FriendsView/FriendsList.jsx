import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { motion } from 'framer-motion';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import FriendItem from "../FriendItem";
import { useFriendSearch } from '@/hooks/friend/useFriendSearch';

/**
 * FriendsList Component
 * Displays a searchable list of friends with action handlers
 */
const FriendsList = ({
  friends = [],
  isLoadingFriends = false,
  error = null,
  compact = false,
  onFriendSelect,
  onViewProfile,
  onMessage,
  onRemoveFriend,
  onBlock,
}) => {
  const [search, setSearch] = useState('');
  const filteredFriends = useFriendSearch(friends, search);

  return (
    <div className={`mb-3 ${compact ? 'mb-2' : 'mb-3'}`}>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search friends..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          size={compact ? 'sm' : undefined}
        />
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
                  key={friendData.id}
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
              <motion.div 
                className="flex flex-col items-center justify-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-4"
                >
                  <Users className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                </motion.div>
                <motion.p
                  className="text-sm text-slate-500 dark:text-slate-400 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {search ? 'No friends found' : 'No friends yet'}
                </motion.p>
                <motion.p
                  className="text-xs text-slate-400 dark:text-slate-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {search ? 'Try a different search' : 'Start adding friends to connect!'}
                </motion.p>
              </motion.div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default FriendsList;
