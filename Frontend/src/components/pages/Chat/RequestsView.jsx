import { useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFriendRequests } from '@/hooks/friend/useFriendRequests';
import { useFriendActions } from '@/hooks/friend/useFriendActions';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

export default function RequestsView() {
  const { type = 'incoming' } = useParams();
  const { incomingRequests, outgoingRequests } = useFriendRequests();
  const { updateFriendStatus } = useFriendActions();
  
  return (
    <div className="h-full p-4 bg-white dark:bg-slate-900 rounded-lg">
      <Tabs defaultValue={type} className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
          <TabsTrigger value="sent">Sent Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="mt-0">
          <ScrollArea className="h-[calc(100%-4rem)]">
            {incomingRequests.isLoading && <LoadingState />}
            {incomingRequests.error && <ErrorState message="Failed to load incoming requests" />}
            {incomingRequests.data && (
              <div className="space-y-4">
                {incomingRequests.data.map((request) => (
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
                {incomingRequests.data.length === 0 && (
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    No incoming friend requests
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sent" className="mt-0">
          <ScrollArea className="h-[calc(100%-4rem)]">
            {outgoingRequests.isLoading && <LoadingState />}
            {outgoingRequests.error && <ErrorState message="Failed to load sent requests" />}
            {outgoingRequests.data && (
              <div className="space-y-4">
                {outgoingRequests.data.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.avatarUrl || `https://avatar.vercel.sh/${request.id}.png`} />
                        <AvatarFallback>{request.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{request.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Request pending</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateFriendStatus.mutate({ email: request.email, status: 'cancelled' })}
                        disabled={updateFriendStatus.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
                {outgoingRequests.data.length === 0 && (
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    No sent friend requests
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
