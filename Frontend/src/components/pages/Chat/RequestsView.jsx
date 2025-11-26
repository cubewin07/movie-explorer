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
    return (
      <div className="flex h-40 items-center justify-center text-center text-slate-500 dark:text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-10">
      {/* Note: The 'p-4' above is crucial. 
        It creates a buffer zone inside the scroll area so the 
        card's hover scale animation doesn't get clipped at the top/sides.
      */}
      {data.map((request) => (
        <div key={request.id} className="w-full">
           <RequestCard 
            request={request} 
            actions={renderActions(request)}
            isPending={isPending}
          />
        </div>
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
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 rounded-lg overflow-hidden">
      <Tabs defaultValue={type} className="flex flex-col h-full w-full">
        
        {/* Header Section */}
        <div className="px-6 pt-6 pb-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-100">
            Friend Requests
          </h2>
          <TabsList className="w-full sm:w-auto grid grid-cols-2 h-11">
            <TabsTrigger value="incoming" className="text-sm">Incoming</TabsTrigger>
            <TabsTrigger value="sent" className="text-sm">Sent</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <TabsContent value="incoming" className="h-full mt-0 border-none outline-none data-[state=inactive]:hidden">
            <ScrollArea className="h-full w-full">
              {/* Max-width container to prevent cards from stretching too wide on 4k screens, 
                  but keeps them wide enough on standard laptops/tablets. */}
              <div className="max-w-3xl mx-auto w-full">
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
                        variant: 'ghost', // Changed to ghost for less visual noise
                        onClick: () => handleStatusUpdate(request.id, 'BLOCKED')
                      }
                    ]
                  })}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sent" className="h-full mt-0 border-none outline-none data-[state=inactive]:hidden">
            <ScrollArea className="h-full w-full">
              <div className="max-w-3xl mx-auto w-full">
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
                      label: 'Cancel Request',
                      onClick: () => handleCancelRequest(request.id)
                    }
                  })}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}