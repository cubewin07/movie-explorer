# FriendRequests Module

## Overview

The FriendRequests component has been refactored from a single 229-line monolithic file into a modular structure with separated concerns for better maintainability, reusability, and testability.

## New Structure

```
FriendRequests/
├── FriendRequests.jsx              (~100 lines) - Main component
├── RequestsList.jsx                (~70 lines)  - List container component
├── RequestItem.jsx                 (~55 lines)  - Individual request item
├── EmptyState.jsx                  (~45 lines)  - Empty state display
├── requestTypeConstants.js          (~45 lines)  - Constants and config
├── index.js                        (~20 lines)  - Module exports
└── README.md                                    - This file
```

**Total: ~335 lines (vs. 229 originally, but includes better documentation)**

## Architecture

### Component Hierarchy

```
FriendRequests (Main)
├── Tabs Container
├── Header (non-compact only)
├── TabsContent (Incoming)
│   └── RequestsList
│       ├── LoadingState / ErrorState / EmptyState
│       └── RequestItem (multiple)
│           ├── Compact View (list mode)
│           └── Full View (RequestCard)
└── TabsContent (Sent)
    └── RequestsList
        ├── LoadingState / ErrorState / EmptyState
        └── RequestItem (multiple)
```

### Data Flow

```
FriendRequests
├── Fetches: useFriendRequests (incomingRequests, outgoingRequests)
├── Actions: useFriendActions (updateFriendStatus, deleteFriend)
├── State: isCompact (responsive)
└── Passes to RequestsList
    ├── data: Array of requests
    ├── isLoading, error, errorMessage
    ├── renderActions: Function to generate action buttons
    └── type: 'incoming' or 'sent'
        └── Passes to RequestItem & EmptyState
            ├── Renders individual items with animations
            └── Shows empty state when appropriate
```

## Components

### FriendRequests (Main Component)

The primary component managing the entire feature. Handles:
- Route parameter parsing for active tab
- Responsive layout switching (compact vs full)
- Window resize event handling
- Action handlers (accept, block, cancel requests)
- Tab navigation between incoming and sent requests

**Key Props:**
```javascript
{
  onRequestSelect: (id) => void  // Callback for compact mode item selection
}
```

**Key Features:**
- Responsive design (switches to compact below 768px)
- Tab-based navigation (incoming/sent)
- Dual layout: compact (sidebar) and full (page)
- Error boundaries for each tab
- Optimistic UI updates via mutations

**Example Usage:**
```javascript
import { FriendRequests } from '@/components/pages/Chat/FriendRequests';

<FriendRequests onRequestSelect={(id) => handleSelectRequest(id)} />
```

### RequestsList Component

Container component that manages the list display and state presentation.

**Key Props:**
```javascript
{
  data: Array<Request>,           // Array of request objects
  isLoading: Boolean,             // Loading state
  error: Boolean,                 // Error state
  errorMessage: String,           // Error message to display
  emptyMessage: String,           // Empty state message (legacy)
  renderActions: (request) => Object, // Action generator function
  isPending: Boolean,             // Action pending state
  isCompact: Boolean,             // Compact mode flag
  onRequestSelect: Function,      // Selection callback
  type: 'incoming' | 'sent',      // Request type
  scrollHeight: String,           // Custom scroll height CSS
  contentMaxWidth: String         // Custom max width CSS
}
```

**Example Usage:**
```javascript
import { RequestsList } from '@/components/pages/Chat/FriendRequests';

<RequestsList 
  data={requests}
  isLoading={loading}
  error={error}
  errorMessage="Failed to load"
  isPending={pending}
  isCompact={compact}
  type="incoming"
  renderActions={(req) => ({
    buttons: [
      { label: 'Accept', onClick: () => handleAccept(req.id) }
    ]
  })}
/>
```

### RequestItem Component

Individual request item renderer with dual rendering modes.

**Key Props:**
```javascript
{
  request: {
    id: String,
    username: String,
    avatarUrl: String,
    type: 'incoming' | 'sent'
  },
  isCompact: Boolean,             // Compact mode flag
  onSelect: Function,             // Selection callback (compact only)
  actions: Object,                // Actions object with buttons/inline
  isPending: Boolean              // Action pending state
}
```

**Modes:**
- **Compact:** Small list item with name, avatar, and type indicator
- **Full:** RequestCard component with full action buttons

**Example Usage:**
```javascript
import { RequestItem } from '@/components/pages/Chat/FriendRequests';

<RequestItem 
  request={request}
  isCompact={false}
  actions={{ buttons: [...] }}
  isPending={false}
/>
```

### EmptyState Component

Displays when no requests are available. Shows animated icon and message.

**Key Props:**
```javascript
{
  type: 'incoming' | 'sent'  // Determines icon and message
}
```

**Features:**
- Animated icon (bobbing for incoming, rotating for sent)
- Fade-in text animations
- Type-specific messaging
- Dark mode support

**Example Usage:**
```javascript
import { EmptyState } from '@/components/pages/Chat/FriendRequests';

<EmptyState type="incoming" />
```

## Constants (requestTypeConstants.js)

### REQUEST_TYPES
```javascript
REQUEST_TYPES = {
  INCOMING: 'incoming',
  SENT: 'sent'
}
```

### REQUEST_STATUS
```javascript
REQUEST_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  BLOCKED: 'BLOCKED'
}
```

### REQUEST_TYPE_CONFIG
Configuration for each request type (icon, titles, actions):
```javascript
REQUEST_TYPE_CONFIG = {
  incoming: {
    icon: 'Inbox',
    title: 'No incoming requests',
    subtitle: "You're all caught up!",
    actions: [...]
  },
  sent: {
    icon: 'Send',
    title: 'No sent requests',
    subtitle: 'Start adding friends!',
    actions: [...]
  }
}
```

### REQUEST_MESSAGES
```javascript
REQUEST_MESSAGES = {
  INCOMING: 'Incoming request',
  SENT: 'Pending sent request'
}
```

## Usage Examples

### Basic Implementation

```javascript
import FriendRequests from '@/components/pages/Chat/FriendRequests';

export function ChatPage() {
  const handleSelectRequest = (requestId) => {
    // Handle request selection
  };

  return (
    <FriendRequests onRequestSelect={handleSelectRequest} />
  );
}
```

### With Routing

```javascript
import { useNavigate } from 'react-router-dom';
import { FriendRequests } from '@/components/pages/Chat/FriendRequests';

export function FriendRequestsPage() {
  const navigate = useNavigate();

  const handleSelect = (requestId) => {
    navigate(`/chat/${requestId}`);
  };

  return (
    <FriendRequests onRequestSelect={handleSelect} />
  );
}
```

### Using Individual Components

```javascript
import {
  RequestsList,
  RequestItem,
  EmptyState,
  REQUEST_TYPES,
  REQUEST_STATUS
} from '@/components/pages/Chat/FriendRequests';

// Custom list implementation
function CustomRequestsList() {
  const { requests, isLoading } = useFriendRequests();

  return (
    <RequestsList
      data={requests}
      isLoading={isLoading}
      type={REQUEST_TYPES.INCOMING}
      renderActions={(req) => ({
        buttons: [
          {
            label: 'Accept',
            onClick: () => acceptRequest(req.id)
          }
        ]
      })}
    />
  );
}
```

## Hooks Used

### useFriendRequests()
Fetches incoming and outgoing friend requests.

**Returns:**
```javascript
{
  incomingRequests: {
    data: Array,
    isLoading: Boolean,
    error: Boolean
  },
  outgoingRequests: {
    data: Array,
    isLoading: Boolean,
    error: Boolean
  }
}
```

### useFriendActions()
Provides mutation functions for friend actions.

**Returns:**
```javascript
{
  updateFriendStatus: {
    mutate: (data) => void,
    isPending: Boolean
  },
  deleteFriend: {
    mutate: (id) => void,
    isPending: Boolean
  }
}
```

## Responsive Design

The component adapts to screen size:

### Desktop (≥768px)
- Full layout with header, tabs, and content area
- Large RequestCard with action buttons
- Max-width container for better readability
- Tabs in header

### Mobile (<768px)
- Compact layout for sidebars/modals
- Small list items with minimal information
- Tabs above content
- Full viewport height utilization

**Breakpoint:** `window.innerWidth < 768`

## Features

✅ **Modular Architecture** - Separated concerns across components
✅ **Responsive Design** - Adapts from desktop to mobile
✅ **Animation** - Smooth transitions and loading states
✅ **Error Handling** - Dedicated error state display
✅ **Empty States** - Context-aware empty state UI
✅ **Type Safety** - Constants for request types and statuses
✅ **Accessibility** - ARIA labels and semantic HTML
✅ **Dark Mode** - Full dark mode support via Tailwind
✅ **Performance** - Optimized re-renders with React hooks
✅ **Reusability** - Components and hooks can be used independently

## Migration from Old Structure

**Old Import:**
```javascript
import FriendRequests from '@/components/pages/Chat/FriendRequests';
```

**New Import (Same as Before):**
```javascript
import FriendRequests from '@/components/pages/Chat/FriendRequests';
// or
import { FriendRequests } from '@/components/pages/Chat/FriendRequests';
```

The `index.js` provides backward compatibility, so existing imports continue to work.

## File Sizes Comparison

| File | Old | New | Change |
|------|-----|-----|--------|
| FriendRequests.jsx | 229 | 100 | -56% |
| RequestsList.jsx | — | 70 | New |
| RequestItem.jsx | — | 55 | New |
| EmptyState.jsx | — | 45 | New |
| requestTypeConstants.js | — | 45 | New |
| index.js | — | 20 | New |
| **Total** | **229** | **335** | +46% (includes docs) |

*Note: Line count includes comments and documentation*

## Benefits

### Developer Experience
- Clear separation of concerns
- Easier to locate and modify specific functionality
- Better code organization and navigation
- Reusable components for other contexts

### Maintainability
- Smaller files are easier to understand
- Changes are isolated to relevant components
- Constants centralized for easier updates
- Each component has a single responsibility

### Testing
- Smaller components are easier to unit test
- Hooks can be tested independently
- Mocking is simpler with focused components

### Performance
- Better code splitting opportunities
- Component-level optimization possible
- Reduced re-render scope

### Scalability
- Easy to add new request types
- Simple to extend with new actions
- Modular design supports feature additions

## Future Improvements

- [ ] Add request filtering (by date, status, etc.)
- [ ] Implement request search functionality
- [ ] Add batch action support (accept/reject all)
- [ ] Support for request comments/notes
- [ ] Request history/archive view
- [ ] Notification bell integration
- [ ] Real-time request notifications
- [ ] Export/import friend lists
- [ ] Advanced sorting options

## Notes

- All components use Tailwind CSS for styling
- Animations are powered by Framer Motion
- Icons are from lucide-react
- State management uses React hooks (custom hooks via `/hooks`)
- UI components from shadcn/ui (avatar, tabs, scroll-area, etc.)

## Troubleshooting

### Requests not loading
Check that `useFriendRequests` hook is properly connected to your API endpoint.

### Actions not working
Verify `useFriendActions` mutations are correctly configured and API endpoints exist.

### Styling issues
Ensure Tailwind CSS is properly configured in your `tailwind.config.js`.

### Animations not smooth
Check that Framer Motion is installed and properly configured.

## Dependencies

- `react` (18+)
- `react-router-dom` (6+)
- `framer-motion` (10+)
- `lucide-react` (0.200+)
- `@radix-ui` (components via shadcn/ui)
- `tailwindcss` (3+)

For more information, refer to the main Movie Explorer README.
