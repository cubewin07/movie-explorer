import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFriendRequests } from '@/hooks/friend/useFriendRequests';
import { useFriendActions } from '@/hooks/friend/useFriendActions';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

export default function RequestTabs({ onRequestSelect }) {
  const { incomingRequests, outgoingRequests } = useFriendRequests();
  const { updateFriendStatus } = useFriendActions();

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {incomingRequests.isLoading && <LoadingState />}
            {incomingRequests.error && <ErrorState message="Failed to load incoming requests" />}
            {incomingRequests.data && (
              <div className="space-y-2 p-2">
                {incomingRequests?.data?.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => onRequestSelect?.(request.id)}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.avatarUrl || `https://avatar.vercel.sh/${request.id}.png`} />
                        <AvatarFallback>{request?.username[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{request?.username}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Incoming request</p>
                      </div>
                    </div>
                  </div>
                ))}
                {incomingRequests.data.length === 0 && (
                  <div className="text-center text-sm text-slate-500 dark:text-slate-400 p-2">
                    No incoming requests
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sent" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {outgoingRequests.isLoading && <LoadingState />}
            {outgoingRequests.error && <ErrorState message="Failed to load sent requests" />}
            {outgoingRequests.data && (
              <div className="space-y-2 p-2">
                {outgoingRequests?.data?.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => onRequestSelect?.(request.id)}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.avatarUrl || `https://avatar.vercel.sh/${request.id}.png`} />
                        <AvatarFallback>{request?.username[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{request?.username}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Pending sent request</p>
                      </div>
                    </div>
                  </div>
                ))}
                {outgoingRequests.data.length === 0 && (
                  <div className="text-center text-sm text-slate-500 dark:text-slate-400 p-2">
                    No sent requests
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
