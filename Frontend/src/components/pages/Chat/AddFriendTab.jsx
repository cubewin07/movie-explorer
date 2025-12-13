import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import UserSearchCard from "./UserSearchCard";
import { toast } from "sonner";
import useUserSearch from "@/hooks/friend/useUserSearch";
import useUserInfo from "@/hooks/API/useUserInfo";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

const AddFriendTab = ({ compact }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading, error } = useUserSearch(debouncedQuery);

  const handleViewDetails = (user) => {
    navigate(`/user/${user.id}`);
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
            {searchResults?.content.map((user) => (
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
          <motion.div 
            className="text-center text-slate-500 dark:text-slate-400 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            </motion.div>
            <motion.p 
              className="text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Start typing to search for users
            </motion.p>
            <motion.div
              className="flex justify-center gap-1 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AddFriendTab;