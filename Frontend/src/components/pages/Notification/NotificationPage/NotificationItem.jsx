import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { getNotificationIcon, getNotificationColor, getTimeAgo, getNotificationTypeLabel, isUnread } from './notificationTypeUtils';
import { NOTIFICATION_ANIMATION, NOTIFICATION_TRANSITION_DELAY } from './notificationConstants';

/**
 * NotificationItem Component
 * Individual notification list item with interactions
 * @param {Object} props
 * @param {Object} props.notification - Notification data
 * @param {boolean} props.isSelected - Whether notification is selected
 * @param {boolean} props.isSelectionMode - Whether in selection mode
 * @param {Function} props.onNotificationClick - Click handler
 * @param {Function} props.onDeleteClick - Delete button click handler
 * @param {Function} props.onSelectToggle - Selection toggle handler
 * @param {number} props.index - Index for stagger animation
 * @returns {JSX.Element}
 */
export const NotificationItem = ({
  notification,
  isSelected,
  isSelectionMode,
  onNotificationClick,
  onDeleteClick,
  onSelectToggle,
  index = 0,
}) => {
  const isNotificationUnread = isUnread(notification);
  const borderColor = getNotificationColor(notification.type);

  const handleClick = () => {
    if (isSelectionMode) {
      onSelectToggle(notification.id);
    } else {
      onNotificationClick(notification);
    }
  };

  return (
    <motion.li
      initial={NOTIFICATION_ANIMATION.initial}
      animate={NOTIFICATION_ANIMATION.animate}
      exit={NOTIFICATION_ANIMATION.exit}
      transition={{ delay: index * (NOTIFICATION_TRANSITION_DELAY / 1000) }}
      onClick={handleClick}
      className={`
        group relative px-6 py-4 border-l-4 cursor-pointer transition-all duration-200
        ${
          isSelectionMode && isSelected
            ? 'bg-gradient-to-r from-blue-500/20 to-blue-400/10 dark:from-blue-500/30 dark:to-blue-400/20 border-l-blue-600 dark:border-l-blue-400 shadow-md ring-2 ring-blue-500 dark:ring-blue-400'
            : isSelectionMode
              ? 'bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 border-l-gray-400 dark:border-l-gray-500 hover:border-l-blue-400 dark:hover:border-l-blue-500'
              : isNotificationUnread
                ? 'bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-100/70 dark:hover:bg-blue-950/30'
                : 'bg-transparent dark:bg-transparent hover:bg-gray-50/80 dark:hover:bg-slate-800/50'
        }
        ${!isSelectionMode ? borderColor : ''}
        border-b border-gray-100 dark:border-slate-800/50 last:border-b-0
      `}
    >
      <div className="flex gap-4">
        {/* Icon/Checkbox */}
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isNotificationUnread
                ? 'bg-blue-100/80 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40'
                : 'bg-gray-100/50 dark:bg-slate-800/50 group-hover:bg-gray-100 dark:group-hover:bg-slate-800'
            }`}
          >
            {getNotificationIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-base leading-relaxed transition-colors ${
              isNotificationUnread
                ? 'text-gray-900 dark:text-white font-semibold'
                : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
            }`}
          >
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-sm transition-colors ${
                isNotificationUnread
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-500'
              }`}
            >
              {getTimeAgo(notification.createdAt)}
            </span>
            {isNotificationUnread && (
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            )}
            <span
              className={`text-xs transition-colors ${
                isNotificationUnread
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-500'
              }`}
            >
              • {getNotificationTypeLabel(notification.type)}
            </span>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(notification.id);
          }}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
        >
          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
        </button>
      </div>
    </motion.li>
  );
};

export default NotificationItem;
