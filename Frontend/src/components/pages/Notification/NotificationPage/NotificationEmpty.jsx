import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { getNotificationIcon, getNotificationBgColor } from './notificationTypeUtils';
import { NOTIFICATION_ANIMATION, LOADER_ANIMATION } from './notificationConstants';

/**
 * NotificationEmpty Component
 * Displays empty state based on filter and search conditions
 * @param {Object} props
 * @param {string} props.filter - Current active filter
 * @param {string} props.searchQuery - Current search query
 * @returns {JSX.Element}
 */
export const NotificationEmpty = ({ filter, searchQuery }) => {
  const hasSearch = searchQuery && searchQuery.trim().length > 0;

  // Determine icon and messages based on state
  let icon = <Bell className="w-10 h-10 text-gray-400 dark:text-gray-600" />;
  let title = 'No notifications yet';
  let subtitle = "We'll notify you when something happens";

  if (hasSearch) {
    icon = <Bell className="w-10 h-10 text-gray-400 dark:text-gray-600" />;
    title = 'No matching notifications';
    subtitle = 'Try a different search term';
  } else if (filter === 'unread') {
    icon = <CheckCheck className="w-10 h-10 text-gray-400 dark:text-gray-600" />;
    title = 'All caught up!';
    subtitle = "You've read all your notifications";
  } else if (filter === 'friendRequest') {
    icon = <Bell className="w-10 h-10 text-gray-400 dark:text-gray-600" />;
    title = 'No friend requests';
    subtitle = "You'll see new friend requests here";
  } else if (filter === 'chat') {
    icon = <Bell className="w-10 h-10 text-gray-400 dark:text-gray-600" />;
    title = 'No messages';
    subtitle = "You'll see new messages here";
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-6 py-16 text-center"
    >
      <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-base font-medium">{title}</p>
      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{subtitle}</p>
    </motion.div>
  );
};

export default NotificationEmpty;
