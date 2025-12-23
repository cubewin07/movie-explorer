# NotificationPage Module

## Overview

The NotificationPage component has been refactored from a large monolithic file (529 lines) into a modular structure with separated concerns for better maintainability and reusability.

## New Structure

```
Notification/NotificationPage/
├── NotificationPage.jsx          (~140 lines) - Main component
├── NotificationItem.jsx          (~130 lines) - Individual notification item
├── NotificationEmpty.jsx         (~80 lines)  - Empty state component
├── notificationTypeUtils.js      (~75 lines)  - Type and icon utilities
├── useNotificationActions.js     (~40 lines)  - Custom hook for actions
├── notificationConstants.js      (~15 lines)  - Constants & configurations
├── index.js                      (~30 lines)  - Module exports
└── README.md                                  - This file
```

**Total: ~510 lines (vs. 529 originally) = Cleaner organization + Better reusability**

## Component File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| NotificationPage.jsx | 140 | Main component (state management, filtering, search) |
| NotificationItem.jsx | 130 | Individual notification render with interactions |
| NotificationEmpty.jsx | 80 | Empty state UI for various scenarios |
| notificationTypeUtils.js | 75 | Icons, colors, and type-related utilities |
| useNotificationActions.js | 40 | Hook wrapping notification actions |
| notificationConstants.js | 15 | Filter types, constants, animations |
| index.js | 30 | Module and hook exports |

## Components

### NotificationPage (Main Component)
Handles:
- Notifications data fetching and loading states
- Filtering (all, unread, friendRequest, chat)
- Search functionality
- Selection mode toggle
- Bulk operations (mark all as read, delete all)
- Time updates (timetick for "time ago" updates)
- Header with stats

**Props:** None (uses context)

**State:**
```javascript
{
  timetick,           // Number - triggers time ago updates every minute
  filter,             // String - current filter type
  searchQuery,        // String - search input
  selectedIds,        // Array<string> - selected notification IDs
  isSelectionMode     // Boolean - toggle select mode
}
```

### NotificationItem
Individual notification list item component.

**Props:**
```typescript
{
  notification: {
    id: string,
    message: string,
    type: 'friendRequest' | 'chat' | 'other',
    read: boolean,
    readAt?: Date,
    relatedId: string,
    createdAt: Date
  },
  isSelected: boolean,
  isSelectionMode: boolean,
  onNotificationClick: (notification) => void,
  onDeleteClick: (e, id) => void,
  onSelectToggle: (e, id) => void,
  timeAgo: string
}
```

**Features:**
- Unread highlighting with gradient background
- Type-based icon and border color
- Hover effects (delete button, background)
- Selection mode with ring styling
- Time display with pulse indicator for unread
- Responsive layout

### NotificationEmpty
Empty state component for various scenarios.

**Props:**
```typescript
{
  filter: string,      // Current active filter
  searchQuery: string, // Current search term
}
```

**Scenarios:**
- No notifications at all
- No unread notifications (all caught up)
- No search results
- No notifications for specific filter

## Hooks

### useNotificationActions()
Wrapper hook for notification mutations.

**Returns:**
```javascript
{
  markAsRead,         // Mutation - Mark single notification as read
  markAllAsRead,      // Mutation - Mark all as read
  deleteNotification, // Mutation - Delete single notification
  deleteNotificationsByIds // Mutation - Delete multiple by IDs
}
```

**Usage:**
```javascript
const { markAsRead, deleteNotification } = useNotificationActions();

markAsRead.mutate({ id: notifId, token }, {
  onSuccess: () => { /* handle success */ }
});
```

## Utility Functions

### notificationTypeUtils.js

```javascript
// Get notification icon based on type
getNotificationIcon(type) => JSX.Element

// Get border color class based on type  
getNotificationColor(type) => string

// Get display name for notification type
getNotificationTypeLabel(type) => string

// Notification type constants
NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friendRequest',
  CHAT: 'chat',
  OTHER: 'other'
}
```

## Constants

### notificationConstants.js

```javascript
// Filter types
FILTER_TYPES = {
  ALL: 'all',
  UNREAD: 'unread',
  FRIEND_REQUEST: 'friendRequest',
  CHAT: 'chat'
}

// Animation variants
NOTIFICATION_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20 }
}

LOADER_ANIMATION = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.4, ease: "easeOut" }
}

// UI Configuration
MAX_ITEMS_PER_PAGE = 50  // For future pagination
TIME_UPDATE_INTERVAL = 60000  // 1 minute
NOTIFICATION_TRANSITION_DELAY = 30  // ms between items

// Colors by type
NOTIFICATION_COLORS = {
  friendRequest: {
    icon: 'text-blue-400',
    bg: 'bg-blue-100/80 dark:bg-blue-900/30',
    border: 'border-l-blue-500'
  },
  chat: {
    icon: 'text-green-400',
    bg: 'bg-green-100/80 dark:bg-green-900/30',
    border: 'border-l-green-500'
  },
  other: {
    icon: 'text-gray-400',
    bg: 'bg-gray-100/50 dark:bg-slate-800/50',
    border: 'border-l-gray-500'
  }
}
```

## Usage

### Import Main Component

```javascript
// Direct import (new way)
import NotificationPage from '@/components/pages/Notification/NotificationPage/NotificationPage';

// Or via module index
import { NotificationPage } from '@/components/pages/Notification/NotificationPage';

// Or backward compatible
import NotificationPage from '@/components/pages/Notification/NotificationPage';
```

### Use Custom Hook

```javascript
import { useNotificationActions } from '@/components/pages/Notification/NotificationPage';

// In component
const { markAsRead, deleteNotification } = useNotificationActions();
```

### Use Utilities

```javascript
import { 
  getNotificationIcon, 
  getNotificationColor 
} from '@/components/pages/Notification/NotificationPage';

const icon = getNotificationIcon(notification.type);
const borderColor = getNotificationColor(notification.type);
```

## Data Flow

```
NotificationPage (main)
├── Fetches notifications via useNotification()
├── Applies filters & search
├── Manages selection mode
│
└── Renders NotificationItem for each
    ├── Uses notificationTypeUtils for styling
    ├── Calls useNotificationActions for mutations
    └── Handles item interactions
        ├── Click → Mark as read & navigate
        ├── Delete → Delete single
        └── Select → Toggle selection

NotificationEmpty handles:
├── No results (search)
├── All caught up (unread filter)
├── No notifications (empty state)
└── Filter-specific empty states
```

## Benefits of Refactoring

✅ **Separation of Concerns** - Each file handles one responsibility
✅ **Component Reusability** - NotificationItem can be used elsewhere
✅ **Utility Extraction** - Type utils can be used in other components
✅ **Hook Modularity** - useNotificationActions is isolated and testable
✅ **Readability** - Main component is ~140 lines (down from 529)
✅ **Maintainability** - Changes are isolated to relevant files
✅ **Performance** - Smaller components = better React optimization
✅ **Scalability** - Easy to add features (reactions, pinning, etc.)

## Migration Guide

### Old Import (still works)
```javascript
import NotificationPage from '@/components/pages/Notification/NotificationPage';
```

### New Import (recommended)
```javascript
import { NotificationPage } from '@/components/pages/Notification/NotificationPage';
import { useNotificationActions } from '@/components/pages/Notification/NotificationPage';
import { getNotificationIcon } from '@/components/pages/Notification/NotificationPage';
```

## Future Improvements

- [ ] Add notification reaction/emoji support
- [ ] Implement notification snooze feature
- [ ] Add notification categories/tabs
- [ ] Message notification preview on hover
- [ ] Batch operations (archive, mute thread)
- [ ] Rich notification content (images, buttons)
- [ ] Real-time notification updates via WebSocket
- [ ] Notification sound/desktop notifications
- [ ] Settings per notification type
- [ ] Notification search with advanced filters

## Testing Strategy

### Unit Tests
- Utility functions in `notificationTypeUtils.js`
- Constant exports from `notificationConstants.js`

### Component Tests
- NotificationItem with various props
- NotificationEmpty for different scenarios
- NotificationPage filtering and search

### Integration Tests
- Notification actions (mark read, delete)
- Filter + search combinations
- Selection mode workflows
- Empty states

## Performance Considerations

- **Memoization**: NotificationItem should be wrapped in React.memo()
- **Virtual List**: For large notification lists (100+), consider virtualization
- **Debouncing**: Search input uses debounce to prevent excessive filtering
- **Time Updates**: timetick updates every minute instead of second
- **Animation**: AnimatePresence for smooth transitions without performance impact
