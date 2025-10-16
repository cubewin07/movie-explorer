import { useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFriendRequests } from '@/hooks/friend/useFriendRequests';
import { useFriendActions } from '@/hooks/friend/useFriendActions';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import RequestCard from '@/components/ui/RequestCard';



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
  const { updateFriendStatus, deleteFriend } = useFriendActions();
  
  const handleStatusUpdate = (id, status) => {
    updateFriendStatus.mutate({ id, status });
  };

  const handleCancelRequest = (id) => {
    deleteFriend.mutate(id);
  }

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
                    onClick: () => handleStatusUpdate(request.id, 'ACCEPTED')
                  },
                  {
                    label: 'Block',
                    variant: 'outline',
                    onClick: () => handleStatusUpdate(request.id, 'BLOCKED')
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
                  onClick: () => handleCancelRequest(request.id)
                }
              })}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}