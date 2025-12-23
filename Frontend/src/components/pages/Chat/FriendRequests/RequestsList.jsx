import { motion } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area";
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import RequestItem from './RequestItem';
import EmptyState from './EmptyState';

/**
 * RequestsList Component
 * Renders a list of friend requests with loading, error, and empty states
 * 
 * @param {Array} data - Array of request objects
 * @param {Boolean} isLoading - Loading state
 * @param {Boolean} error - Error state
 * @param {String} errorMessage - Error message to display
 * @param {String} emptyMessage - Empty state message (deprecated, use type for EmptyState)
 * @param {Function} renderActions - Function to render actions for each request
 * @param {Boolean} isPending - Whether an action is pending
 * @param {Boolean} isCompact - Whether to render in compact mode
 * @param {Function} onRequestSelect - Callback for request selection (compact mode)
 * @param {String} type - Request type ('incoming' or 'sent')
 * @param {String} scrollHeight - Custom scroll height CSS class
 * @param {String} contentMaxWidth - Custom max width CSS class
 */
export default function RequestsList({
  data,
  isLoading,
  error,
  errorMessage,
  emptyMessage,
  renderActions,
  isPending,
  isCompact,
  onRequestSelect,
  type,
  scrollHeight = 'h-[calc(100vh-12rem)]',
  contentMaxWidth = 'max-w-3xl mx-auto w-full'
}) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={errorMessage} />;
  if (!data?.length) {
    return <EmptyState type={type} />;
  }

  const containerClass = isCompact 
    ? 'space-y-2 p-2' 
    : 'flex flex-col gap-4 p-4 pb-10';

  return (
    <ScrollArea className={scrollHeight}>
      <div className={contentMaxWidth}>
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
      </div>
    </ScrollArea>
  );
}
