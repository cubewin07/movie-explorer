import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RequestCard from '@/components/ui/RequestCard';
import { REQUEST_MESSAGES, REQUEST_TYPES } from './requestTypeConstants';

/**
 * RequestItem Component
 * Renders a single friend request in either compact or full view
 * 
 * @param {Object} request - Request data (id, username, avatarUrl, type)
 * @param {Boolean} isCompact - Whether to render compact list view
 * @param {Function} onSelect - Callback when request is selected (compact mode)
 * @param {Object} actions - Actions object with buttons/inline properties
 * @param {Boolean} isPending - Whether an action is pending
 */
export default function RequestItem({ 
  request, 
  isCompact, 
  onSelect, 
  actions, 
  isPending 
}) {
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
            <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
              {request?.username}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {request.type === REQUEST_TYPES.INCOMING 
                ? REQUEST_MESSAGES.INCOMING 
                : REQUEST_MESSAGES.SENT
              }
            </p>
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
}
