import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, UserCircle, MoreVertical, UserMinus, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const FriendItem = ({ 
  friend, 
  compact, 
  onFriendSelect, 
  onMessage,
  onViewProfile,
  onRemoveFriend,
  onBlock,
  showActions = true 
}) => {
  const getStatusColor = (status) => {
    switch(status) {
      case true: return 'ring-2 ring-green-500';
      case false: return 'ring-2 ring-yellow-500';
      case 'busy': return 'ring-2 ring-red-500';
      default: return 'ring-2 ring-slate-300';
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status;
    if (statusLower === true) return <Badge variant="default" className="bg-green-500">Online</Badge>;
    if (statusLower === false) return <Badge variant="secondary">offline</Badge>;
    if (statusLower === 'busy') return <Badge variant="destructive">Busy</Badge>;
    return <Badge variant="outline">Offline</Badge>;
  };

  const handleClick = () => {
    if (compact && onFriendSelect) {
      onFriendSelect(friend.id);
    }
  };

  const handleViewProfile = (e) => {
    e.stopPropagation();
    if (onViewProfile) {
      onViewProfile(friend);
    }
  };

  const handleMessage = (e) => {
    e.stopPropagation();
    if (onMessage) {
      onMessage(friend);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemoveFriend) {
      onRemoveFriend(friend);
    }
  };

  const handleBlock = (e) => {
    e.stopPropagation();
    if (onBlock) {
      onBlock(friend);
    }
  };

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 
        transition-all duration-200 ${compact ? 'cursor-pointer' : ''} hover:shadow-sm`}
      onClick={handleClick}
    >
      {/* Avatar with status indicator */}
      <div className="relative">
        <Avatar className={getStatusColor(friend?.status)}>
          <AvatarImage 
            src={friend?.avatarUrl || `https://avatar.vercel.sh/${friend.id}.png`} 
            alt={friend?.username}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            {friend?.username?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        {/* Status dot indicator */}
        {friend?.status === 'online' && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        )}
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
            {friend?.username || 'Unknown User'}
          </p>
          {!compact && getStatusBadge(friend?.status)}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {friend?.email || 'No email'}
        </p>
      </div>

      {/* Action buttons - Always visible */}
      {!compact && showActions && (
        <div className="flex items-center gap-2">
          {/* Message button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleMessage}
            className="hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>

          {/* View Profile button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleViewProfile}
            className="hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <UserCircle className="w-4 h-4 mr-2" />
            Profile
          </Button>

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewProfile}>
                <UserCircle className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMessage}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleRemove}
                className="text-orange-600 dark:text-orange-400"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Remove Friend
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleBlock}
                className="text-red-600 dark:text-red-400"
              >
                <Ban className="w-4 h-4 mr-2" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Compact mode indicator */}
      {compact && (
        <div className="text-slate-400">
          {getStatusBadge(friend?.status)}
        </div>
      )}
    </div>
  );
};

export default FriendItem;