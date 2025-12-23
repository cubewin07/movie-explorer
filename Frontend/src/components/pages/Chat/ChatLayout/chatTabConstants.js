/**
 * Chat Tab Configuration Constants
 * Centralized configuration for chat, friends, and requests tabs
 */

export const CHAT_TABS = {
  CHATS: 'chats',
  FRIENDS: 'friends',
  REQUESTS: 'requests',
};

export const TAB_CONFIG = [
  { id: 'chats', label: 'Chats' },
  { id: 'friends', label: 'Friends' },
  { id: 'requests', label: 'Requests' },
];

export const TAB_PATHS = {
  chats: '/friend/chat',
  friends: '/friend/friends',
  requests: '/friend/requests',
};

export const PATH_TO_TAB_MAP = {
  '/friend/chat': CHAT_TABS.CHATS,
  '/friend/friends': CHAT_TABS.FRIENDS,
  '/friend/requests': CHAT_TABS.REQUESTS,
};
