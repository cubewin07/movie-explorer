import { Bell, UserPlus, MessageCircle } from 'lucide-react';
import { NOTIFICATION_COLORS, NOTIFICATION_TYPES } from './notificationConstants';

/**
 * Get notification icon based on type
 * @param {string} type - Notification type
 * @returns {JSX.Element} Icon component
 */
export const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.FRIEND_REQUEST:
      return <UserPlus className="w-5 h-5 text-blue-400" />;
    case NOTIFICATION_TYPES.CHAT:
      return <MessageCircle className="w-5 h-5 text-green-400" />;
    default:
      return <Bell className="w-5 h-5 text-gray-400" />;
  }
};

/**
 * Get border color class based on notification type
 * @param {string} type - Notification type
 * @returns {string} Tailwind CSS class
 */
export const getNotificationColor = (type) => {
  return NOTIFICATION_COLORS[type]?.border || NOTIFICATION_COLORS.other.border;
};

/**
 * Get background color class based on notification type
 * @param {string} type - Notification type
 * @returns {string} Tailwind CSS class
 */
export const getNotificationBgColor = (type) => {
  return NOTIFICATION_COLORS[type]?.bg || NOTIFICATION_COLORS.other.bg;
};

/**
 * Get display label for notification type
 * @param {string} type - Notification type
 * @returns {string} Display label
 */
export const getNotificationTypeLabel = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.FRIEND_REQUEST:
      return 'Friend Request';
    case NOTIFICATION_TYPES.CHAT:
      return 'Message';
    default:
      return 'Notification';
  }
};

/**
 * Calculate time ago string from timestamp
 * @param {string|Date} timestamp - Notification creation time
 * @returns {string} Formatted time ago string
 */
export const getTimeAgo = (timestamp) => {
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

/**
 * Check if notification is unread
 * @param {Object} notification - Notification object
 * @returns {boolean} True if unread
 */
export const isUnread = (notification) => {
  return !notification.read || notification.readAt == null;
};

/**
 * Check if notification matches filter
 * @param {Object} notification - Notification object
 * @param {string} filter - Filter type
 * @returns {boolean} True if matches filter
 */
export const matchesFilter = (notification, filter) => {
  if (filter === 'all') return true;
  if (filter === 'unread') return isUnread(notification);
  return notification.type === filter;
};

/**
 * Check if notification matches search query
 * @param {Object} notification - Notification object
 * @param {string} query - Search query
 * @returns {boolean} True if matches query
 */
export const matchesSearch = (notification, query) => {
  if (!query) return true;
  return notification.message.toLowerCase().includes(query.toLowerCase());
};
