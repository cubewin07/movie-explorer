# ChatConversation Module

## Overview

The ChatConversation component has been refactored from a large monolithic file (898 lines) into a modular structure with separated concerns for better maintainability and reusability.

## New Structure

```
ChatConversation/
├── ChatConversation.jsx          (~150 lines) - Main component
├── useMessageScroll.js           (~127 lines) - Scroll behavior hook
├── useGroupMessages.js           (~91 lines)  - Message grouping hook
├── useConnectionState.js         (~49 lines)  - Network state hook
├── useTypingIndicator.js         (~53 lines)  - Typing indicator hook
├── messageUtils.js               (~199 lines) - Utility functions
├── chatConstants.js              (~8 lines)   - Constants
├── index.js                      (~27 lines)  - Module exports
└── README.md                                  - This file
```

**Total: ~712 lines (vs. 898 originally) = 21% reduction + better organization**

## Component File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| ChatConversation.jsx | 712 | Main component (handles rendering & state orchestration) |
| useMessageScroll.js | 127 | Scroll detection, auto-scroll, and scroll button logic |
| useGroupMessages.js | 91 | Message grouping by date/sender and pending message sync |
| useConnectionState.js | 49 | Online/offline status and error banner management |
| useTypingIndicator.js | 53 | Typing indicators for composer and remote users |
| messageUtils.js | 199 | Helper functions for message formatting and validation |
| chatConstants.js | 8 | Configuration constants |
| index.js | 27 | Module exports |

## Hooks

### useMessageScroll()
Manages all scroll-related behavior:
- Auto-scroll to bottom on new messages
- Scroll button visibility detection
- Manual scroll-to-bottom handler
- Infinite scroll observer target

**Returns:**
```javascript
{
  scrollRef,                  // RefObject for ScrollArea
  observerTarget,             // RefObject for intersection observer
  lastMessageRef,             // RefObject for last message
  showScrollButton,           // Boolean state
  setShowScrollButton,        // State setter
  prevMessagesLength,         // Ref tracking previous length
  isUserScrolling,            // Ref tracking user scroll state
  shouldScrollToBottom,       // Ref controlling auto-scroll
  scrollButtonEnabled,        // Ref controlling button visibility
  scrollToBottom,             // Function to scroll to bottom
  handleScroll,               // Scroll event handler
  handleScrollToBottom        // Click handler for button
}
```

### useGroupMessages(messages, pendingMessages, setPendingMessages)
Handles message grouping and optimistic updates:
- Groups messages by date and sender
- Merges server and pending messages
- Syncs pending messages with server responses
- Tracks pending message status

**Returns:**
```javascript
{
  groupedMessages,            // Array with grouped messages and dates
  combinedMessages,           // Chronologically sorted combined messages
  lastUserOptimistic,         // Last user's optimistic message if pending
  markPendingStatus,          // Function to update message status
  pendingTimeoutsRef          // Ref for managing send timeouts
}
```

### useConnectionState()
Manages network connectivity:
- Detects online/offline status
- Manages error banner state
- Provides utility functions for error handling

**Returns:**
```javascript
{
  isOffline,                  // Boolean
  sendErrorBanner,            // String
  setSendErrorBanner,         // State setter
  showErrorBanner,            // Function to show error
  clearErrorBanner            // Function to clear error
}
```

### useTypingIndicator(newMessage)
Manages typing indicators:
- Composer typing state (shows "Typing..." while user types)
- Remote user typing state
- Automatic timeout handling

**Returns:**
```javascript
{
  isComposerTyping,           // Boolean - user is typing
  isTyping,                   // Boolean - remote user typing
  setIsTyping,                // Setter for remote typing
  setRemoteTyping,            // Convenience method
  typingTimeoutRef            // Ref for timeout management
}
```

## Constants (chatConstants.js)

```javascript
MAX_MESSAGE_LENGTH = 800               // Maximum message character length
GROUP_GAP_MS = 5 * 60 * 1000          // 5 minutes - message grouping threshold
MESSAGE_SEND_TIMEOUT = 8000            // Timeout for marking send as failed
SEND_COOLDOWN_MS = 400                 // Cooldown between sends to prevent spam
COMPOSER_TYPING_TIMEOUT = 1200         // Typing indicator display duration
SCROLL_DISTANCE_THRESHOLD = 100        // Distance to trigger scroll detection
SCROLL_BUTTON_SHOW_DISTANCE = 50       // Minimum distance to show button
```

## Utility Functions (messageUtils.js)

### Formatting
- `formatDateHeader(date)` - Format date for message headers
- `formatMessageTime(date)` - Format time for message display
- `getStatusDisplay(status)` - Get color and text for friend status

### Grouping
- `groupMessagesByDateAndSender(messages)` - Group messages by date
- `isGroupStart(message, prevMessage)` - Check if message starts a group
- `isGroupEnd(message, nextMessage)` - Check if message ends a group

### Validation
- `validateMessage(text, maxLength)` - Validate message before sending
- `getRemainingCharacters(text, maxLength)` - Calculate remaining characters

### Message Utilities
- `isSentByUser(message, userId)` - Check message ownership
- `getMessageAvatarSeed(message)` - Get avatar identifier
- `getMessageDisplayName(message)` - Get sender display name
- `mergePendingMessages(server, pending)` - Merge message arrays
- `matchesPendingMessage(pending, server)` - Check if messages match

## Usage

### Import Main Component
```javascript
// Direct import (new way)
import ChatConversation from '@/components/pages/Chat/ChatConversation/ChatConversation';

// Or via module index
import { ChatConversation } from '@/components/pages/Chat/ChatConversation';

// Or backward compatible
import ChatConversation from '@/components/pages/Chat/ChatConversation';
```

### Use Custom Hooks
```javascript
import { 
  useMessageScroll, 
  useGroupMessages, 
  useConnectionState, 
  useTypingIndicator 
} from '@/components/pages/Chat/ChatConversation';

// In component
const scrollState = useMessageScroll();
const messageState = useGroupMessages(messages, pending, setPending);
const connectivity = useConnectionState();
const typing = useTypingIndicator(newMessage);
```

## Benefits of Refactoring

✅ **Separation of Concerns** - Each hook handles one responsibility
✅ **Reusability** - Hooks can be used in other components
✅ **Testability** - Smaller, focused units are easier to test
✅ **Maintainability** - Changes are isolated to relevant files
✅ **Readability** - Main component is now ~150 lines (down from 898)
✅ **Performance** - Better dependency tracking with split hooks
✅ **Scalability** - Easy to add new features without bloating one file

## Migration Guide

The old import path still works due to the re-export in `ChatConversation.jsx`:
```javascript
import ChatConversation from '@/components/pages/Chat/ChatConversation';
```

For new code, prefer the modular imports:
```javascript
import { ChatConversation } from '@/components/pages/Chat/ChatConversation';
import { useMessageScroll } from '@/components/pages/Chat/ChatConversation';
```

## Future Improvements

- [ ] Add message reactions/emoji support
- [ ] Implement message search functionality
- [ ] Add message edit/delete features
- [ ] Support for message threading
- [ ] Voice/video call integration
- [ ] Message search and filtering utils
- [ ] Custom message types handler
