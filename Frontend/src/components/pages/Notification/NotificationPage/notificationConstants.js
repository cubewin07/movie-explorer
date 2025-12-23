// Filter types
export const FILTER_TYPES = {
  ALL: 'all',
  UNREAD: 'unread',
  FRIEND_REQUEST: 'friendRequest',
  CHAT: 'chat',
};

// Notification types
export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friendRequest',
  CHAT: 'chat',
  OTHER: 'other',
};

// Animation variants
export const NOTIFICATION_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20 },
};

export const LOADER_ANIMATION = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

// UI Configuration
export const MAX_ITEMS_PER_PAGE = 50;
export const TIME_UPDATE_INTERVAL = 60000; // 1 minute
export const NOTIFICATION_TRANSITION_DELAY = 30; // ms between items

// Colors by type
export const NOTIFICATION_COLORS = {
  friendRequest: {
    icon: 'text-blue-400',
    bg: 'bg-blue-100/80 dark:bg-blue-900/30',
    border: 'border-l-blue-500',
  },
  chat: {
    icon: 'text-green-400',
    bg: 'bg-green-100/80 dark:bg-green-900/30',
    border: 'border-l-green-500',
  },
  other: {
    icon: 'text-gray-400',
    bg: 'bg-gray-100/50 dark:bg-slate-800/50',
    border: 'border-l-gray-500',
  },
};
