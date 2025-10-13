import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Info, UserPlus } from "lucide-react";
import { useFriendActions } from "@/hooks/friend/useFriendActions";
import { toast } from "sonner";

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

export default UserSearchCard;