import { useEffect, useState, useRef } from "react";
import { Bell, X, UserPlus, MessageCircle, Check, Trash2, CheckCheck } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthen } from '@/context/AuthenProvider';
import { Client } from "@stomp/stompjs";
import { Button } from "@/components/ui/button";
import { useNotificationActions } from "@/hooks/notification/useNotificationActions";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { useWebsocket } from "@/context/Websocket/WebsocketProvider";

function NotificationItem({
  notification,
  isDark,
  getNotificationIcon,
  getTimeAgo,
  handleNotificationClick,
  handleDeleteNotification
}) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-120, 0], [0, 1]);

  const onPanEnd = (e, info) => {
    if (info.offset.x < -80) {
      // auto delete animation
      animate(x, -200, { duration: 0.2 });
      setTimeout(() => handleDeleteNotification(e, notification.id), 150);
    } else {
      animate(x, 0, { type: "spring", bounce: 0.3 });
    }
  };

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
        backgroundColor: notification.read
          ? (isDark ? "rgba(15,23,42,0)" : "rgba(255,255,255,1)")
          : (isDark ? "rgba(59,130,246,0.1)" : "rgba(239,246,255,1)")
      }}
      whileHover={{
        backgroundColor: notification.read
          ? (isDark ? "rgba(51,65,85,0.4)" : "rgba(249,250,251,1)")
          : (isDark ? "rgba(59,130,246,0.2)" : "rgba(219,234,254,1)")
      }}
      transition={{ duration: 0.2 }}
      style={{ opacity }}
      className="relative"
    >
      {/* Red delete background */}
      {/* <div className="absolute inset-0 flex justify-end items-center pr-4 pointer-events-none">
        <div className="bg-red-600 text-white rounded-full p-2 pointer-events-none">
          <Trash2 className="w-4 h-4" />
        </div>
      </div> */}

      {/* Draggable container */}
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -120, right: 0 }}
        dragDirectionLock
        onPanEnd={onPanEnd}
        onClick={() => handleNotificationClick(notification)}
        className="
          group relative px-4 py-3 border-l-4 cursor-pointer 
          border-b border-gray-100 dark:border-slate-800 
          flex gap-3 items-start
        "
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-relaxed ${
            notification.read
              ? "text-gray-700 dark:text-gray-300"
              : "text-gray-900 dark:text-white font-medium"
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

        {/* Delete button (hover delete) */}
        <button
          onClick={(e) => handleDeleteNotification(e, notification.id)}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 
                     rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 
                     transition-all mt-2"
        >
          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
        </button>
      </motion.div>

      {/* Unread blue bar */}
      {!notification.read && (
        <div className="absolute top-0 right-0 bottom-0 w-1 bg-blue-500" />
      )}
    </motion.li>
  );
}


export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useThemeToggle();
  const { user, token } = useAuthen();
  const { notifications, setNotifications } = useWebsocket();
  const { markAsRead, markAllAsRead, deleteNotification } = useNotificationActions();
  const navigate = useNavigate();

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
  const grouped = groupNotificationsByDate(notifications);

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
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 180,
                  damping: 18,
                  duration: 0.25,
                },
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.98,
                transition: { duration: 0.15 }
              }}
              className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900
                        border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl 
                        z-50 flex flex-col max-h-[480px]"
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
              {Object.entries(grouped).map(([section, items]) => {
                if (items.length === 0) return (null);

                return (
                  <div key={section}>
                    {/* Section Header */}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800/50">
                      {section}
                    </div>

                    {/* Items */}
                    <AnimatePresence mode="popLayout">
                      {items.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          isDark={isDark}
                          getNotificationIcon={getNotificationIcon}
                          getTimeAgo={getTimeAgo}
                          handleNotificationClick={handleNotificationClick}
                          handleDeleteNotification={handleDeleteNotification}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Footer - TODO: Add "View All" link when you have a notifications page */}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function groupNotificationsByDate(notifications) {
  const groups = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Older: []
  };

  const now = new Date();
  
  notifications.forEach((n) => {
    const date = new Date(n.createdAt);
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) groups.Today.push(n);
    else if (diffDays === 1) groups.Yesterday.push(n);
    else if (diffDays < 7) groups["This Week"].push(n);
    else groups.Older.push(n);
  });

  return groups;
}