/**
 * ChatConversation module exports
 * Provides the main ChatConversation component and all custom hooks/utilities
 */

// Main component
export { default as ChatConversation } from './ChatConversation';

// Custom hooks
export { useMessageScroll } from './useMessageScroll';
export { useGroupMessages } from './useGroupMessages';
export { useConnectionState } from './useConnectionState';
export { useTypingIndicator } from './useTypingIndicator';

// Constants
export {
    MAX_MESSAGE_LENGTH,
    GROUP_GAP_MS,
    MESSAGE_SEND_TIMEOUT,
    SEND_COOLDOWN_MS,
    COMPOSER_TYPING_TIMEOUT,
    SCROLL_DISTANCE_THRESHOLD,
    SCROLL_BUTTON_SHOW_DISTANCE
} from './chatConstants';

// Utils
export * from './messageUtils';
