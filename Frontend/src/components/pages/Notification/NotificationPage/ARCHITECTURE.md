# NotificationPage Architecture

## Overview

This document provides detailed architectural guidance for the refactored NotificationPage module. It covers design decisions, data flow patterns, state management, and integration points.

## Module Structure

```
src/components/pages/Notification/
├── NotificationPage/
│   ├── NotificationPage.jsx          (140 lines)
│   ├── NotificationItem.jsx          (130 lines)
│   ├── NotificationEmpty.jsx         (80 lines)
│   ├── notificationTypeUtils.js      (75 lines)
│   ├── useNotificationActions.js     (40 lines)
│   ├── notificationConstants.js      (15 lines)
│   ├── index.js                      (30 lines)
│   └── README.md
│
└── (Previous structure maintained at parent level)
    └── NotificationPage.jsx (old file - to be removed)
```

## Architectural Decisions

### 1. Component Hierarchy

```
NotificationPage (Main Container)
│
├── Header Section
│   └── Stats & Action Buttons
│
├── Search & Filter Bar
│   ├── Search Input
│   └── Filter Buttons
│
└── Notifications List
    ├── NotificationEmpty (conditional)
    │
    └── NotificationItem[] (repeated)
        ├── Notification Icon
        ├── Content
        ├── Metadata
        └── Delete Button
```

### 2. State Management Strategy

**Local Component State** (in NotificationPage):
- `timetick` - Triggers re-render for "time ago" updates
- `filter` - Active filter selection
- `searchQuery` - Search input value
- `selectedIds` - Multi-select checkbox state
- `isSelectionMode` - Toggle between normal/selection modes

**Context/Query State** (via hooks):
- Notifications data (via `useNotification()`)
- User authentication (via `useAuthen()`)
- Mutations (via `useNotificationActions()`)

**Why this split?**
- UI state (filter, search, selection) is local to this component
- Server state (notifications, user) comes from providers/queries
- Mutations are abstracted in a custom hook for reusability

### 3. Data Flow Patterns

#### Reading Notifications
```
useNotification() hook
    ↓
Returns { data, isLoading, error }
    ↓
NotificationPage receives notifications array
    ↓
Filter applied (filter state)
    ↓
Search applied (searchQuery state)
    ↓
Render NotificationItem[] or NotificationEmpty
```

#### Single Notification Action
```
NotificationItem (user clicks)
    ↓
Calls onClick/onDeleteClick handler from NotificationPage
    ↓
Handler calls useNotificationActions() mutation
    ↓
Mutation updates server state
    ↓
Cache/UI updates via query invalidation
```

#### Bulk Operations
```
Select notifications (selection mode)
    ↓
User clicks "Delete Selected" or "Mark All Read"
    ↓
Collect selectedIds or compute from filter
    ↓
Call useNotificationActions mutation with batch
    ↓
Optimistic update + server confirmation
```

### 4. Separation of Concerns

| Module | Responsibility | Dependencies |
|--------|---|---|
| NotificationPage.jsx | Orchestration, filtering, search, selection | useNotification, useNotificationActions, useAuthen |
| NotificationItem.jsx | Single item render & interactions | notificationTypeUtils |
| NotificationEmpty.jsx | Empty state UI | notificationTypeUtils |
| notificationTypeUtils.js | Type-based styling/icons | notificationConstants |
| useNotificationActions.js | Action mutations | API hooks |
| notificationConstants.js | Constants/config | (none) |

### 5. Filter Logic

```javascript
const filteredNotifications = notifications.filter(n => {
  const matchesFilter = 
    filter === 'all' ? true :
    filter === 'unread' ? !n.read :
    filter === n.type;  // 'friendRequest' or 'chat'
  
  const matchesSearch = n.message
    .toLowerCase()
    .includes(searchQuery.toLowerCase());
  
  return matchesFilter && matchesSearch;
});
```

**Filter Precedence:**
1. Primary filter (all/unread/type)
2. Secondary filter (search query)
3. Selection mode (overrides delete behavior)

### 6. Selection Mode Behavior

```
Normal Mode:
├── Click notification → Mark as read & navigate
├── Hover → Show delete button
└── Select button → Enter selection mode

Selection Mode:
├── Click notification → Toggle checkbox
├── Checkboxes visible → Select multiple
├── Delete Selected → Delete all selected
├── Mark All Read → Still available
└── Cancel → Exit selection mode, clear selections
```

### 7. Time Display Strategy

```javascript
// timetick effect - updates every 60 seconds
useEffect(() => {
  const interval = setInterval(() => {
    setTimeTick(prev => prev + 1);
  }, 60000);
  return () => clearInterval(interval);
}, []);

// getTimeAgo function uses current time comparison
const getTimeAgo = (timestamp) => {
  // Returns: "Just now", "5m ago", "2h ago", "3d ago", etc.
}
```

**Benefits:**
- Doesn't update every second (saves performance)
- Still shows accurate relative time
- "Just now" stays fresh within 1 minute
- Date format for older notifications

### 8. Animation Strategy

```javascript
// Container animations (page-level)
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  
// List item animations (staggered)
<motion.li
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ delay: index * 0.03 }}
>

// Selection mode animations (ring + gradient)
ring-2 ring-blue-500
from-blue-500/20 to-blue-400/10
```

**Used Libraries:**
- framer-motion - List animations (AnimatePresence)
- Tailwind CSS - Transitions & state-based styling

### 9. Error Handling Patterns

```javascript
// Query Error
{error && <motion.div>Error state UI</motion.div>}

// Mutation Error
markAsRead.mutate(data, {
  onError: (error) => {
    // Handle error - could show toast
    console.error('Failed to mark as read');
  }
});

// Offline Detection (via useConnectionState hook)
if (isOffline) {
  // Show offline banner
  // Queue operations for retry
}
```

### 10. Action Handlers Pattern

```javascript
// Single notification action
const handleNotificationClick = (notification) => {
  markAsRead.mutate(
    { id: notification.id, token },
    {
      onSuccess: () => {
        notification.read = true;
        navigateBasedOnType(notification);
      }
    }
  );
};

// Bulk operation with compute
const handleDeleteAll = () => {
  const idsToDelete = 
    selectedIds.length > 0 
      ? selectedIds
      : computeIdsFromFilter(filter, notifications);
  
  deleteNotificationsByIds.mutate(
    { ids: idsToDelete, token },
    { onSuccess: () => clearSelection() }
  );
};
```

## Integration Points

### 1. API Integration
- **useNotification()** - Fetch notifications
- **useNotificationActions()** - Mutations for actions
- Both from `src/hooks/notification/`

### 2. Context Usage
- **AuthenProvider** - Get user ID & token
- **ChatProvider** (future) - Navigate to chats
- **WebsocketProvider** (future) - Real-time updates

### 3. Routing
- **useNavigate()** - Navigate to user profile or chat
- Routes: `/user/:userId`, `/friend/chat/:chatId` (future)

### 4. UI Components
- **Button** - From `@/components/ui/button`
- **Icons** - From lucide-react (Bell, UserPlus, MessageCircle, Trash2, etc.)
- **Motion** - From framer-motion

## State Mutations & Side Effects

### useEffect Hooks

```javascript
// Time ticker - updates relative time display
useEffect(() => {
  const interval = setInterval(() => setTimeTick(prev => prev + 1), 60000);
  return () => clearInterval(interval);
}, []);
```

### Query Mutations

```javascript
// All mutations use useNotificationActions hook
const {
  markAsRead,              // { mutate, isPending, error }
  markAllAsRead,          // { mutate, isPending, error }
  deleteNotification,     // { mutate, isPending, error }
  deleteNotificationsByIds // { mutate, isPending, error }
} = useNotificationActions();
```

## Performance Optimizations

### 1. Memoization Strategy
```javascript
// NotificationItem - wrapped in React.memo
const NotificationItem = React.memo(({ notification, ... }) => {
  // Only re-renders if props change
});
```

### 2. Computed Values
```javascript
// Filter & search computed together
const filteredNotifications = useMemo(() => {
  return notifications.filter(n => {
    // ... filter + search logic
  });
}, [notifications, filter, searchQuery]);

// Unread count computed
const unreadCount = useMemo(() => {
  return notifications.filter(n => !n.read).length;
}, [notifications]);
```

### 3. Event Handler Optimization
```javascript
// Use useCallback to prevent recreation
const handleNotificationClick = useCallback((notification) => {
  // ...
}, [markAsRead, navigate, token]);
```

### 4. List Rendering
- Time complexity: O(n) for filtering + search
- Space complexity: O(n) for filtered array
- For large lists (100+), consider virtualization

## Styling Architecture

### Tailwind CSS Patterns

**Notification Item States:**
```css
/* Unread state */
bg-blue-50/60 dark:bg-blue-950/20
text-gray-900 dark:text-white font-semibold
border-l-blue-500

/* Read state */
bg-transparent dark:bg-transparent
text-gray-600 dark:text-gray-400

/* Selected state */
bg-gradient-to-r from-blue-500/20 to-blue-400/10
ring-2 ring-blue-500 dark:ring-blue-400

/* Selection mode (non-selected) */
bg-gray-100 dark:bg-slate-700/50
border-l-gray-400 dark:border-l-gray-500
```

**Dark Mode Support:**
- Base classes + `dark:` variants throughout
- Consistent color palette (blue, green, gray, red)
- Accessible contrast ratios maintained

## Testing Strategy

### Unit Tests

**notificationTypeUtils.js:**
```javascript
describe('getNotificationIcon', () => {
  test('returns UserPlus icon for friendRequest type');
  test('returns MessageCircle icon for chat type');
  test('returns Bell icon for other types');
});

describe('getNotificationColor', () => {
  test('returns blue classes for friendRequest');
  test('returns green classes for chat');
  test('returns gray classes for other');
});
```

**notificationConstants.js:**
```javascript
test('constants are exported correctly');
test('filter types match expected values');
test('animation variants are properly defined');
```

### Component Tests

**NotificationItem.jsx:**
```javascript
describe('NotificationItem', () => {
  test('renders notification data correctly');
  test('shows unread indicator when not read');
  test('shows delete button on hover');
  test('calls handlers on interaction');
  test('applies selected styling when selected');
});
```

**NotificationEmpty.jsx:**
```javascript
describe('NotificationEmpty', () => {
  test('shows "All caught up" for unread filter');
  test('shows "No matching notifications" for search');
  test('shows appropriate icon based on filter');
});
```

**NotificationPage.jsx:**
```javascript
describe('NotificationPage', () => {
  test('applies all filters correctly');
  test('searches notifications correctly');
  test('toggles selection mode');
  test('bulk operations work correctly');
  test('time display updates');
  test('error and loading states render');
});
```

## Error Handling & Edge Cases

### Edge Cases Handled

1. **Empty States:**
   - No notifications at all
   - No matching search results
   - All unread notifications read
   - Filter with no results

2. **Timing Issues:**
   - Multiple rapid selections
   - Outdated cache after delete
   - Notifications loading during search

3. **User Actions:**
   - Deleting while in selection mode
   - Filtering while search active
   - Clicking stale item

4. **Network:**
   - Failed mutations show error UI
   - Offline detection via connectivity hook
   - Timeout handling for slow connections

## Future Enhancements

### Phase 2 - Rich Features
- [ ] Notification reactions/emojis
- [ ] Snooze notifications until later
- [ ] Mute sender/thread
- [ ] Archive vs delete
- [ ] Notification pinning

### Phase 3 - Advanced
- [ ] Notification preview on hover
- [ ] Action buttons in notification (Accept/Decline)
- [ ] Rich content (images, formatted text)
- [ ] Thread grouping
- [ ] Smart sort (by relevance, date, type)

### Phase 4 - Real-time
- [ ] WebSocket integration for live updates
- [ ] Sound/desktop notifications
- [ ] Typing indicators in chat notifications
- [ ] Read receipts across devices
- [ ] Notification sync across tabs

## Configuration & Constants Location

All magic numbers and configuration values are in `notificationConstants.js`:

```javascript
// Time intervals
TIME_UPDATE_INTERVAL = 60000
MESSAGE_SEND_TIMEOUT = 8000

// UI Limits
MAX_ITEMS_PER_PAGE = 50
NOTIFICATION_TRANSITION_DELAY = 30

// Animation config
NOTIFICATION_ANIMATION = { ... }
LOADER_ANIMATION = { ... }

// Color schemes
NOTIFICATION_COLORS = { ... }
```

This ensures easy adjustment without code changes.

## Module Exports (index.js)

```javascript
// Main component
export { default as NotificationPage } from './NotificationPage';

// Sub-components
export { default as NotificationItem } from './NotificationItem';
export { default as NotificationEmpty } from './NotificationEmpty';

// Hooks
export { useNotificationActions } from './useNotificationActions';

// Utilities
export * from './notificationTypeUtils';
export * from './notificationConstants';
```

This structure allows:
```javascript
// Option 1: Specific imports
import { NotificationPage, NotificationItem } from '@/components/pages/Notification/NotificationPage';

// Option 2: Namespace import
import * as Notifications from '@/components/pages/Notification/NotificationPage';

// Option 3: Direct path
import NotificationPage from '@/components/pages/Notification/NotificationPage/NotificationPage';
```

## Summary

This architecture achieves:
- **Modularity**: Each file has a single responsibility
- **Reusability**: Components and hooks can be used elsewhere
- **Maintainability**: Changes are isolated and easy to track
- **Scalability**: Easy to add features without bloating main component
- **Performance**: Optimized rendering and state management
- **Testing**: Small, focused units are testable
- **Documentation**: Clear data flow and patterns

The refactored structure reduces the main component from 529 to ~140 lines while improving code organization and reusability.
