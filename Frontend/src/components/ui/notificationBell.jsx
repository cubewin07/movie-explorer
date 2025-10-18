import { useEffect, useState, useRef } from "react";
import { Bell, X, UserPlus, MessageCircle, Check, Trash2, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthen } from '@/context/AuthenProvider';
import { Client } from "@stomp/stompjs";
import { Button } from "@/components/ui/button";
import { useNotificationActions } from "@/hooks/notification/useNotificationActions";
import { useThemeToggle } from "@/hooks/useThemeToggle";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useThemeToggle();
  const [timetick, setTimeTick] = useState(0); // For re-rendering time ago
  const { user, token } = useAuthen();
  const stompClientRef = useRef(null);
  const [notifications, setNotifications] = useState(user?.notifications || []);
  const { markAsRead, markAllAsRead, deleteNotification } = useNotificationActions();
  const navigate = useNavigate();

  useEffect(() => {
    setNotifications(user?.notifications || []);
  }, [user?.notifications]);


  // Update time ago every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick((prev) => prev + 1);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || !token || stompClientRef.current) return;
    
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws?userId=" + user?.id,
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: "Bearer " + token,
      },
      onConnect: () => {
        console.log("Connected to WebSocket");
        stompClient.subscribe("/topic/notifications/" + user?.id, (message) => {
          console.log(message.body);
          const notification = JSON.parse(message.body);
          setNotifications((prev) => [notification, ...prev]); // Add new notifications to top
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    stompClientRef.current = stompClient;
    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [user, token]);

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
  markAsRead.mutate(
    { id: notification.id, token },
    {
      onSuccess: () => {
        // Mark as read locally
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );

        // Navigate based on notification type
        if (notification.type === 'friendRequest') {
          navigate(`/user/${notification.relatedId}`);
        } else if (notification.type === 'chat') {
          // TODO: Navigate to chat with the specific chat ID
          console.log('Navigate to chat:', notification.relatedId);
          // navigate(`/messages/${notification.relatedId}`);
        }

        setOpen(false);
      },
    }
  );
};

const handleDeleteNotification = (e, notificationId) => {
  e.stopPropagation();

  deleteNotification.mutate(
    { id: notificationId, token },
    {
      onSuccess: () => {
        // Remove locally
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      },
    }
  );
};

const handleMarkAllAsRead = () => {
  markAllAsRead.mutate(token, {
    onSuccess: () => {
      // Mark all as read locally
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    },
  });
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Bell button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-300 dark:text-gray-400" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-semibold shadow-lg"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown notification list */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-gray-900 dark:text-white text-base font-bold">Notifications</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleMarkAllAsRead}
                      className="text-xs h-7 px-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <CheckCheck className="w-3.5 h-3.5 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <ul className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {notifications.length === 0 ? (
                    <motion.li
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-6 py-12 text-center"
                    >
                      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No notifications yet</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">We'll notify you when something happens</p>
                    </motion.li>
                  ) : (
                    notifications.map((notification, index) => (
                      <motion.li
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          backgroundColor: notification.read
                            ? (isDark ? 'rgba(15, 23, 42, 0)' : 'rgba(255, 255, 255, 1)')
                            : (isDark ? 'rgba(30, 58, 138, 0.15)' : 'rgba(239, 246, 255, 1)'), 
                        }}
                        whileHover={{
                          backgroundColor: notification.read
                            ? (isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(243, 244, 246, 1)')
                            : (isDark ? 'rgba(30, 58, 138, 0.3)' : 'rgba(219, 234, 254, 1)'), 
                        }}
                        transition={{
                          duration: 0.2,
                          ease: "easeInOut",
                        }}
                        onClick={() => handleNotificationClick(notification)}
                        className="
                          group relative px-4 py-3 border-l-4 cursor-pointer
                          border-b border-gray-100 dark:border-slate-800
                        "
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-relaxed ${
                              notification.read 
                                ? 'text-gray-700 dark:text-gray-300' 
                                : 'text-gray-900 dark:text-white font-medium'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </button>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="absolute top-0 right-0 bottom-0 w-1 bg-blue-500"></div>
                        )}
                      </motion.li>
                    ))
                  )}
                </AnimatePresence>
              </ul>

              {/* Footer - TODO: Add "View All" link when you have a notifications page */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                  <button 
                    className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    onClick={() => {
                      navigate('/notifications');
                      setOpen(false);
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}