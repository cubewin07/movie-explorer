/**
 * FriendRequests Module Exports
 * Main component with modular sub-components and utilities
 */

export { default as FriendRequests } from './FriendRequests';
export { default } from './FriendRequests';

// Sub-components (for advanced usage)
export { default as RequestItem } from './RequestItem';
export { default as RequestsList } from './RequestsList';
export { default as EmptyState } from './EmptyState';

// Constants
export {
  REQUEST_TYPES,
  REQUEST_STATUS,
  REQUEST_TYPE_CONFIG,
  REQUEST_MESSAGES
} from './requestTypeConstants';
