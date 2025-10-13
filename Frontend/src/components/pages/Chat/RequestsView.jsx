import { useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFriendRequests } from '@/hooks/friend/useFriendRequests';
import { useFriendActions } from '@/hooks/friend/useFriendActions';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

const RequestCard = ({ request, actions, isPending }) => (
  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-lg">
    <div className="flex items-center gap-3 mb-3">
      <Avatar>
        <AvatarImage src={request.avatarUrl || `https://avatar.vercel.sh/${request.id}.png`} />
        <AvatarFallback>{request?.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium text-slate-900 dark:text-slate-100">{request?.username}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {request.mutualFriends ? `${request.mutualFriends} mutual friends` : actions?.subtitle || 'No mutual friends'}
        </p>
      </div>
      {actions?.inline && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={actions.inline.onClick}
          disabled={isPending}
        >
          {actions.inline.label}
        </Button>
      )}
    </div>
    
    {actions?.buttons && (
      <div className="flex gap-2">
        {actions.buttons.map((btn, i) => (
          <Button 
            key={i}
            className="flex-1" 
            variant={btn.variant}
            onClick={btn.onClick}
            disabled={isPending}
          >
            {btn.label}
          </Button>
        ))}
      </div>
    )}
  </div>
);

const RequestsList = ({ data, isLoading, error, errorMessage, emptyMessage, renderActions, isPending }) => {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={errorMessage} />;
  if (!data?.length) {
    return <div className="text-center text-slate-500 dark:text-slate-400">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-4">
      {data.map((request) => (
        <RequestCard 
          key={request.id} 
          request={request} 
          actions={renderActions(request)}
          isPending={isPending}
        />
      ))}
    </div>
  );
};

export default function RequestsView() {
  const { type = 'incoming' } = useParams();
  const { incomingRequests, outgoingRequests } = useFriendRequests();
  const { updateFriendStatus } = useFriendActions();
  
  const handleStatusUpdate = (email, status) => {
    updateFriendStatus.mutate({ email, status });
  };

  return (
    <div className="h-full p-4 bg-white dark:bg-slate-900 rounded-lg">
      <Tabs defaultValue={type} className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
          <TabsTrigger value="sent">Sent Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="mt-0">
          <ScrollArea className="h-[calc(100%-4rem)]">
            <RequestsList 
              data={incomingRequests.data}
              isLoading={incomingRequests.isLoading}
              error={incomingRequests.error}
              errorMessage="Failed to load incoming requests"
              emptyMessage="No incoming friend requests"
              isPending={updateFriendStatus.isPending}
              renderActions={(request) => ({
                buttons: [
                  {
                    label: 'Accept',
                    variant: 'default',
                    onClick: () => handleStatusUpdate(request.email, 'ACCEPTED')
                  },
                  {
                    label: 'Block',
                    variant: 'outline',
                    onClick: () => handleStatusUpdate(request.email, 'BLOCKED')
                  }
                ]
              })}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sent" className="mt-0">
          <ScrollArea className="h-[calc(100%-4rem)]">
            <RequestsList 
              data={outgoingRequests.data}
              isLoading={outgoingRequests.isLoading}
              error={outgoingRequests.error}
              errorMessage="Failed to load sent requests"
              emptyMessage="No sent friend requests"
              isPending={updateFriendStatus.isPending}
              renderActions={(request) => ({
                subtitle: 'Request pending',
                inline: {
                  label: 'Cancel',
                  onClick: () => handleStatusUpdate(request.email, 'cancelled')
                }
              })}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}