import { useEffect, useState, useMemo, useCallback } from 'react';
import { Bell, CheckCheck, Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthen } from '@/context/AuthenProvider';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/hooks/notification/useNotification';
import { useNotificationActionsHook } from './useNotificationActions';
import { NotificationItem } from './NotificationItem';
import { NotificationEmpty } from './NotificationEmpty';
import { matchesFilter, matchesSearch, isUnread } from './notificationTypeUtils';
import {
  LOADER_ANIMATION,
  FILTER_TYPES,
  TIME_UPDATE_INTERVAL,
} from './notificationConstants';

/**
 * NotificationsPage Component
 * Main component orchestrating notification display, filtering, and interactions
 */
export const NotificationPage = () => {
  const [timetick, setTimeTick] = useState(0);
  const [filter, setFilter] = useState(FILTER_TYPES.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const { data, isLoading, error } = useNotification();
  const { user, token } = useAuthen();
  const {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotificationsByIds,
  } = useNotificationActionsHook();
  const navigate = useNavigate();

  const notifications = data || [];

  // Update time display every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick((prev) => prev + 1);
    }, TIME_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(
      (n) => matchesFilter(n, filter) && matchesSearch(n, searchQuery)
    );
  }, [notifications, filter, searchQuery]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => isUnread(n)).length;
  }, [notifications]);

  // Handlers
  const handleNotificationClick = useCallback(
    (notification) => {
      markAsRead.mutate(notification.id, token, () => {
        if (notification.type === 'friendRequest') {
          navigate(`/user/${notification.relatedId}`);
        } else if (notification.type === 'chat') {
          navigate(`/friend/chat/${notification.relatedId}`);
        }
      });
    },
    [markAsRead, navigate, token]
  );

  const handleDeleteNotification = useCallback(
    (notificationId) => {
      deleteNotification.mutate(notificationId, token);
    },
    [deleteNotification, token]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate(token);
  }, [markAllAsRead, token]);

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setIsSelectionMode(true);
    setSelectedIds(filteredNotifications.map((n) => n.id));
  }, [filteredNotifications]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    deleteNotificationsByIds.mutate(selectedIds, token, () => {
      setSelectedIds([]);
      setIsSelectionMode(false);
    });
  }, [selectedIds, deleteNotificationsByIds, token]);

  const handleDeleteAll = useCallback(() => {
    let idsToDelete = [];

    if (selectedIds.length > 0) {
      idsToDelete = selectedIds;
    } else if (filter === FILTER_TYPES.ALL) {
      idsToDelete = notifications.map((n) => n.id);
    } else if (filter === FILTER_TYPES.UNREAD) {
      idsToDelete = notifications.filter((n) => isUnread(n)).map((n) => n.id);
    } else {
      idsToDelete = filteredNotifications.map((n) => n.id);
    }

    if (idsToDelete.length === 0) return;
    deleteNotificationsByIds.mutate(idsToDelete, token, () => {
      setSelectedIds([]);
    });
  }, [selectedIds, filter, notifications, filteredNotifications, deleteNotificationsByIds, token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center min-h-screen"
        >
          <motion.div
            initial={LOADER_ANIMATION.initial}
            animate={LOADER_ANIMATION.animate}
            transition={LOADER_ANIMATION.transition}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <div className="relative w-full h-full">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-1 rounded-full border-2 border-transparent border-b-blue-300"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 dark:text-gray-400 font-medium"
            >
              Loading notifications...
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-1 mt-3"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center min-h-screen"
        >
          <motion.div
            initial={LOADER_ANIMATION.initial}
            animate={LOADER_ANIMATION.animate}
            transition={LOADER_ANIMATION.transition}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 relative"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-red-300 dark:border-red-700/50"
              />
              <motion.div
                initial={{ rotate: -45 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Bell className="w-8 h-8 text-red-500 dark:text-red-400" />
              </motion.div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-red-500 dark:text-red-400 font-medium text-lg"
            >
              Failed to load notifications
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 dark:text-gray-400 text-sm mt-2"
            >
              Please try again later
            </motion.p>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Notifications
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                      : 'All caught up!'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                  {!isSelectionMode ? (
                    <>
                      <Button
                        onClick={handleDeleteAll}
                        variant="destructive"
                        className="flex items-center gap-2"
                        disabled={filteredNotifications.length === 0}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete all
                      </Button>
                      <Button
                        onClick={() => {
                          setIsSelectionMode(true);
                          setSelectedIds([]);
                        }}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        Select
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleDeleteSelected}
                        variant="outline"
                        className="flex items-center gap-2 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedIds.length === 0}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete selected
                      </Button>
                      <Button
                        onClick={() => {
                          setIsSelectionMode(false);
                          setSelectedIds([]);
                        }}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
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
                  {[
                    { value: FILTER_TYPES.ALL, label: 'All' },
                    {
                      value: FILTER_TYPES.UNREAD,
                      label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}`,
                    },
                    { value: FILTER_TYPES.FRIEND_REQUEST, label: 'Friend Requests' },
                    { value: FILTER_TYPES.CHAT, label: 'Messages' },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        filter === f.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.length === 0 ? (
                  <NotificationEmpty filter={filter} searchQuery={searchQuery} />
                ) : (
                  <ul>
                    {filteredNotifications.map((notification, index) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        isSelected={selectedIds.includes(notification.id)}
                        isSelectionMode={isSelectionMode}
                        onNotificationClick={handleNotificationClick}
                        onDeleteClick={handleDeleteNotification}
                        onSelectToggle={handleToggleSelect}
                        index={index}
                      />
                    ))}
                  </ul>
                )}
              </AnimatePresence>
            </div>

            {/* Info */}
            {filteredNotifications.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredNotifications.length} notification
                  {filteredNotifications.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPage;
