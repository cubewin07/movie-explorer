import { useEffect, useState } from "react";
import { Bell, UserPlus, MessageCircle, Trash2, CheckCheck, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthen } from '@/context/AuthenProvider';
import { Button } from "@/components/ui/button";
import { useNotificationActions } from "@/hooks/notification/useNotificationActions";
import { useNotification } from "@/hooks/notification/useNotification";

export default function NotificationsPage() {
  const [timetick, setTimeTick] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'friendRequest', 'chat'
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading, error } = useNotification();
  const { user } = useAuthen();
  const { markAsRead, markAllAsRead, deleteNotification } = useNotificationActions();
  const navigate = useNavigate();

  // Get notifications from the query
  const notifications = data || [];

  // Update time ago every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friendRequest':
        return <UserPlus className="w-5 h-5 text-blue-400" />;
      case 'chat':
        return <MessageCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'friendRequest':
        return 'border-l-blue-500';
      case 'chat':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead.mutate(notification.id);

    if (notification.type === 'friendRequest') {
      navigate(`/user/${notification.relatedId}`);
    } else if (notification.type === 'chat') {
      // TODO: Navigate to chat when messages feature is ready
      // navigate(`/messages/${notification.relatedId}`);
      console.log("Navigate to chat with id: " + notification.relatedId);
    }
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMs = now - notifTime;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return notifTime.toLocaleDateString();
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'unread' ? !n.read :
      filter === n.type;
    
    const matchesSearch = n.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 dark:text-red-400 font-medium">Failed to load notifications</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Please try again later</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
          {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                className="flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>
              <button
                onClick={() => setFilter('friendRequest')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === 'friendRequest'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                Friend Requests
              </button>
              <button
                onClick={() => setFilter('chat')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === 'chat'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                Messages
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 py-16 text-center"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  {filter === 'unread' ? (
                    <CheckCheck className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                  ) : (
                    <Bell className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-base font-medium">
                  {searchQuery ? 'No matching notifications' : 
                   filter === 'unread' ? 'All caught up!' : 
                   'No notifications yet'}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  {searchQuery ? 'Try a different search term' : 
                   filter === 'unread' ? "You've read all your notifications" :
                   "We'll notify you when something happens"}
                </p>
              </motion.div>
            ) : (
              <ul>
                {filteredNotifications.map((notification, index) => (
                  <motion.li
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      group relative px-6 py-4 border-l-4 cursor-pointer transition-all duration-200
                      ${notification.read 
                        ? 'bg-transparent dark:bg-transparent hover:bg-gray-50/80 dark:hover:bg-slate-800/50' 
                        : 'bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-100/70 dark:hover:bg-blue-950/30'
                      }
                      ${getNotificationColor(notification.type)}
                      border-b border-gray-100 dark:border-slate-800/50 last:border-b-0
                    `}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          notification.read
                            ? 'bg-gray-100/50 dark:bg-slate-800/50 group-hover:bg-gray-100 dark:group-hover:bg-slate-800'
                            : 'bg-blue-100/80 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-base leading-relaxed transition-colors ${
                          notification.read 
                            ? 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200' 
                            : 'text-gray-900 dark:text-white font-semibold'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-sm transition-colors ${
                            notification.read
                              ? 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-500'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {getTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                          <span className={`text-xs transition-colors ${
                            notification.read
                              ? 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-500'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            • {notification.type === 'friendRequest' ? 'Friend Request' : 'Message'}
                          </span>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination or Load More - TODO */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}