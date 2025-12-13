import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFriendRequests } from '@/hooks/friend/useFriendRequests';
import { useFriendActions } from '@/hooks/friend/useFriendActions';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import RequestCard from '@/components/ui/RequestCard';
import { motion } from 'framer-motion';
import { Inbox, Send } from 'lucide-react';

const RequestItem = ({ request, isCompact, onSelect, actions, isPending }) => {
  if (isCompact && onSelect) {
    return (
      <div
        onClick={() => onSelect(request.id)}
        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={request.avatarUrl || `https://avatar.vercel.sh/${request.id}.png`} />
            <AvatarFallback>{request?.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{request?.username}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{request.type === 'incoming' ? 'Incoming request' : 'Pending sent request'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequestCard 
      request={request} 
      actions={actions}
      isPending={isPending}
    />
  );
};

const EmptyState = ({ type }) => {
  const isIncoming = type === 'incoming';
  const Icon = isIncoming ? Inbox : Send;
  const title = isIncoming ? 'No incoming requests' : 'No sent requests';
  const subtitle = isIncoming ? "You're all caught up!" : 'Start adding friends!';

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={isIncoming ? { y: [0, -12, 0] } : { rotate: [0, 20, -20, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-4"
      >
        <Icon className="h-12 w-12 text-slate-400 dark:text-slate-500" />
      </motion.div>
      <motion.p
        className="text-sm text-slate-500 dark:text-slate-400 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {title}
      </motion.p>
      <motion.p
        className="text-xs text-slate-400 dark:text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
};

const RequestsList = ({ data, isLoading, error, errorMessage, emptyMessage, renderActions, isPending, isCompact, onRequestSelect, type }) => {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={errorMessage} />;
  if (!data?.length) {
    return <EmptyState type={type} />;
  }

  const containerClass = isCompact ? 'space-y-2 p-2' : 'flex flex-col gap-4 p-4 pb-10';

  return (
    <div className={containerClass}>
      {data.map((request, index) => (
        <motion.div 
          key={request.id} 
          className={isCompact ? '' : 'w-full'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <RequestItem 
            request={{ ...request, type }}
            isCompact={isCompact}
            onSelect={onRequestSelect}
            actions={renderActions(request)}
            isPending={isPending}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default function FriendRequests({ onRequestSelect }) {
  const { type = 'incoming' } = useParams();
  const { incomingRequests, outgoingRequests } = useFriendRequests();
  const { updateFriendStatus, deleteFriend } = useFriendActions();
  const [isCompact, setIsCompact] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStatusUpdate = (id, status) => {
    updateFriendStatus.mutate({ id, status });
  };

  const handleCancelRequest = (id) => {
    deleteFriend.mutate(id);
  };

  const headerClass = isCompact ? '' : 'px-6 pt-6 pb-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800';
  const containerClass = isCompact ? 'flex flex-col h-full' : 'flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 rounded-lg overflow-hidden';
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
              <TabsTrigger value="incoming" className="text-sm">Incoming</TabsTrigger>
              <TabsTrigger value="sent" className="text-sm">Sent</TabsTrigger>
            </TabsList>
          </div>
        )}

        {/* Tabs for compact mode */}
        {isCompact && (
          <TabsList className="w-full">
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>
        )}
        
        {/* Content Area */}
        <div className={isCompact ? 'flex-1 mt-0' : 'flex-1 overflow-hidden relative'}>
          <TabsContent value="incoming" className={`${isCompact ? 'flex-1 mt-0' : 'h-full mt-0 border-none outline-none data-[state=inactive]:hidden'}`}>
            <ScrollArea className={scrollHeight}>
              <div className={contentMaxWidth}>
                <RequestsList 
                  data={incomingRequests.data}
                  isLoading={incomingRequests.isLoading}
                  error={incomingRequests.error}
                  errorMessage="Failed to load incoming requests"
                  emptyMessage="No incoming friend requests"
                  isPending={updateFriendStatus.isPending}
                  isCompact={isCompact}
                  onRequestSelect={onRequestSelect}
                  type="incoming"
                  renderActions={(request) => ({
                    buttons: [
                      {
                        label: 'Accept',
                        variant: 'default',
                        onClick: () => handleStatusUpdate(request.id, 'ACCEPTED')
                      },
                      {
                        label: 'Block',
                        variant: 'ghost',
                        onClick: () => handleStatusUpdate(request.id, 'BLOCKED')
                      }
                    ]
                  })}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sent" className={`${isCompact ? 'flex-1 mt-0' : 'h-full mt-0 border-none outline-none data-[state=inactive]:hidden'}`}>
            <ScrollArea className={scrollHeight}>
              <div className={contentMaxWidth}>
                <RequestsList 
                  data={outgoingRequests.data}
                  isLoading={outgoingRequests.isLoading}
                  error={outgoingRequests.error}
                  errorMessage="Failed to load sent requests"
                  emptyMessage="No sent friend requests"
                  isPending={updateFriendStatus.isPending}
                  isCompact={isCompact}
                  onRequestSelect={onRequestSelect}
                  type="sent"
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
