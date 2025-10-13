import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const FriendItem = ({ friend, compact, onFriendSelect }) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 
      transition-colors ${compact ? 'cursor-pointer' : ''}`}
    onClick={() => compact && onFriendSelect?.(friend.id)}
  >
    <Avatar className={friend?.status === 'online' ? 'ring-2 ring-green-500' : ''}>
      <AvatarImage src={friend?.avatarUrl || `https://avatar.vercel.sh/${friend.id}.png`} />
      <AvatarFallback>{friend?.username[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{friend?.username}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{friend?.status || 'offline'}</p>
    </div>
    {!compact && <Button variant="ghost" size="sm">Message</Button>}
  </div>
);

export default FriendItem;