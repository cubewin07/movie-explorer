import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFriendRequests } from '@/hooks/friend/useFriendRequests';
import { useFriendActions } from '@/hooks/friend/useFriendActions';
import RequestsList from './RequestsList';
import { REQUEST_TYPES, REQUEST_STATUS } from './requestTypeConstants';

/**
 * FriendRequests Main Component
 * Manages incoming and sent friend requests with tab switching
 * Handles responsive layout (compact vs full view)
 * 
 * @param {Function} onRequestSelect - Callback when a request is selected (compact mode)
 */
export default function FriendRequests({ onRequestSelect }) {
  const { type = REQUEST_TYPES.INCOMING } = useParams();
  const { incomingRequests, outgoingRequests } = useFriendRequests();
  const { updateFriendStatus, deleteFriend } = useFriendActions();
  const [isCompact, setIsCompact] = useState(window.innerWidth < 768);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle status updates (accept/block incoming requests)
  const handleStatusUpdate = (id, status) => {
    updateFriendStatus.mutate({ id, status });
  };

  // Handle request cancellation (sent requests)
  const handleCancelRequest = (id) => {
    deleteFriend.mutate(id);
  };

  // CSS Classes for responsive layout
  const headerClass = isCompact 
    ? '' 
    : 'px-6 pt-6 pb-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800';
  
  const containerClass = isCompact 
    ? 'flex flex-col h-full' 
    : 'flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 rounded-lg overflow-hidden';
  
  const scrollHeight = isCompact ? 'h-[calc(100vh-12rem)]' : 'h-full';
  const contentMaxWidth = isCompact ? '' : 'max-w-3xl mx-auto w-full';

  return (
    <div className={containerClass}>
      <Tabs defaultValue={type} className="flex flex-col h-full w-full">
        
        {/* Header Section - Only visible on larger screens */}
        {!isCompact && (
          <div className={headerClass}>
            <h2 className="text-2xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-100">
              Friend Requests
            </h2>
            <TabsList className="w-full sm:w-auto grid grid-cols-2 h-11">
              <TabsTrigger value={REQUEST_TYPES.INCOMING} className="text-sm">
                Incoming
              </TabsTrigger>
              <TabsTrigger value={REQUEST_TYPES.SENT} className="text-sm">
                Sent
              </TabsTrigger>
            </TabsList>
          </div>
        )}

        {/* Tabs for compact mode */}
        {isCompact && (
          <TabsList className="w-full">
            <TabsTrigger value={REQUEST_TYPES.INCOMING}>Incoming</TabsTrigger>
            <TabsTrigger value={REQUEST_TYPES.SENT}>Sent</TabsTrigger>
          </TabsList>
        )}
        
        {/* Content Area */}
        <div className={isCompact ? 'flex-1 mt-0' : 'flex-1 overflow-hidden relative'}>
          
          {/* Incoming Requests Tab */}
          <TabsContent 
            value={REQUEST_TYPES.INCOMING} 
            className={`${isCompact 
              ? 'flex-1 mt-0' 
              : 'h-full mt-0 border-none outline-none data-[state=inactive]:hidden'
            }`}
          >
            <RequestsList 
              data={incomingRequests.data}
              isLoading={incomingRequests.isLoading}
              error={incomingRequests.error}
              errorMessage="Failed to load incoming requests"
              emptyMessage="No incoming friend requests"
              isPending={updateFriendStatus.isPending}
              isCompact={isCompact}
              onRequestSelect={onRequestSelect}
              type={REQUEST_TYPES.INCOMING}
              scrollHeight={scrollHeight}
              contentMaxWidth={contentMaxWidth}
              renderActions={(request) => ({
                buttons: [
                  {
                    label: 'Accept',
                    variant: 'default',
                    onClick: () => handleStatusUpdate(request.id, REQUEST_STATUS.ACCEPTED)
                  },
                  {
                    label: 'Block',
                    variant: 'ghost',
                    onClick: () => handleStatusUpdate(request.id, REQUEST_STATUS.BLOCKED)
                  }
                ]
              })}
            />
          </TabsContent>

          {/* Sent Requests Tab */}
          <TabsContent 
            value={REQUEST_TYPES.SENT} 
            className={`${isCompact 
              ? 'flex-1 mt-0' 
              : 'h-full mt-0 border-none outline-none data-[state=inactive]:hidden'
            }`}
          >
            <RequestsList 
              data={outgoingRequests.data}
              isLoading={outgoingRequests.isLoading}
              error={outgoingRequests.error}
              errorMessage="Failed to load sent requests"
              emptyMessage="No sent friend requests"
              isPending={updateFriendStatus.isPending}
              isCompact={isCompact}
              onRequestSelect={onRequestSelect}
              type={REQUEST_TYPES.SENT}
              scrollHeight={scrollHeight}
              contentMaxWidth={contentMaxWidth}
              renderActions={(request) => ({
                subtitle: 'Request pending',
                inline: {
                  label: 'Cancel Request',
                  onClick: () => handleCancelRequest(request.id)
                }
              })}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
