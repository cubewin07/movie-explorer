import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFriendRequests } from '@/hooks/friend/useFriendRequests';
import { useFriendActions } from '@/hooks/friend/useFriendActions';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

export default function FriendRequests() {
  const { incomingRequests: { data: requests, isLoading, error } } = useFriendRequests();
  const { updateFriendStatus } = useFriendActions();
  return (
    <div className="h-full p-4">
      <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Friend Requests</h2>
      
      <ScrollArea className="h-[calc(100%-2rem)]">
        {isLoading && <LoadingState />}
        {error && <ErrorState message="Failed to load friend requests" />}
        {requests && (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarImage src={request.avatarUrl || `https://avatar.vercel.sh/${request.id}.png`} />
                    <AvatarFallback>{request.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{request.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {request.mutualFriends ? `${request.mutualFriends} mutual friends` : 'No mutual friends'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    variant="default"
                    onClick={() => updateFriendStatus.mutate({ email: request.email, status: 'accepted' })}
                    disabled={updateFriendStatus.isPending}
                  >
                    Accept
                  </Button>
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => updateFriendStatus.mutate({ email: request.email, status: 'declined' })}
                    disabled={updateFriendStatus.isPending}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center text-slate-500 dark:text-slate-400">
                No pending friend requests
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
