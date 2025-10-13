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
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start typing to search for users</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AddFriendTab;