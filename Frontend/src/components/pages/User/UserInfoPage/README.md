# UserInfoPage Module Architecture

## 📁 Module Structure

```
User/UserInfoPage/
├── UserInfoPage.jsx                    (~130 lines) - Main component
├── UserProfileSection.jsx              (~100 lines) - Profile & stats display
├── UserWatchlistSection.jsx            (~130 lines) - Watchlist display with states
├── FriendshipStatusButton.jsx          (~90 lines)  - Friendship action button
├── useFriendshipState.js               (~50 lines)  - State determination hook
├── useFriendshipActions.js             (~70 lines)  - Action handlers hook
├── index.js                            (~11 lines)  - Module exports
└── README.md                                        - This file
```

**Total Refactored: ~581 lines (from original 510 lines)**
**Better organized into logical, reusable units**

## 🎯 Component Breakdown

| File | Lines | Responsibility |
|------|-------|-----------------|
| UserInfoPage.jsx | 130 | Orchestration, data fetching, error states, layout |
| UserProfileSection.jsx | 100 | Profile header, avatar, stats display, back button |
| UserWatchlistSection.jsx | 130 | Watchlist grid, loading/error/empty states |
| FriendshipStatusButton.jsx | 90 | Conditional friendship button rendering |
| useFriendshipState.js | 50 | Determine current friendship relationship |
| useFriendshipActions.js | 70 | Handle friend request/accept/block/cancel |

## 📊 Functionality Overview

### Main Component (`UserInfoPage.jsx`)
- Page routing and data fetching via `useParams` and `useNavigate`
- User info retrieval with error handling
- Watchlist film data loading
- State management for session-based friendship changes
- Loading/error UI states
- Orchestrates all sub-components

### User Profile Section (`UserProfileSection.jsx`)
- User avatar and basic info display
- Email display with icon
- Watchlist statistics (total items, movies, series count)
- Back navigation button
- Integrates FriendshipStatusButton

### User Watchlist Section (`UserWatchlistSection.jsx`)
- Grid display of watchlist films with `WatchlistCard`
- Loading state with animated spinner
- Error state with retry button
- Empty state with friendly message
- Responsive grid layout (1-4 columns)
- Staggered animation on item display

### Friendship Status Button (`FriendshipStatusButton.jsx`)
- 5 distinct states:
  1. **Incoming Request** - Accept/Block buttons
  2. **Outgoing Pending** - Pending badge + Cancel button
  3. **Friends** - Friends badge (green)
  4. **Request Sent (Session)** - Request Sent badge (blue)
  5. **No Relationship** - Send Friend Request button (blue)
- Framer Motion animations
- Loading state indicators

## 🪝 Custom Hooks

### `useFriendshipState(userInfo, isRequestSent, isAccepted)`
**Purpose:** Determines the current friendship state

**Returns:**
```javascript
{
  type: 'none' | 'incoming' | 'outgoing' | 'friend' | 'sent',
  hasIncoming: boolean,
  hasOutgoing: boolean,
  isFriend: boolean,
  isRequestSentSession: boolean,
  isAcceptedSession: boolean
}
```

**Logic:**
- Queries incoming/outgoing friend requests via `useFriendRequests()`
- Checks user status from API
- Tracks session-based state changes
- Returns memoized state for performance

### `useFriendshipActions(userInfo, setIsRequestSent, setIsAccepted)`
**Purpose:** Provides friendship action handlers

**Returns:**
```javascript
{
  handleSendFriendRequest: Function,
  handleAcceptRequest: Function,
  handleBlockRequest: Function,
  handleCancelRequest: Function,
  isLoading: {
    send: boolean,
    update: boolean,
    delete: boolean
  }
}
```

**Actions:**
- `handleSendFriendRequest()` - Send friend request via email
- `handleAcceptRequest()` - Accept incoming request
- `handleBlockRequest()` - Block user
- `handleCancelRequest()` - Cancel outgoing request
- Uses `useFriendActions()` from hooks
- Toast notifications for user feedback
- Callback state updates for session tracking

## 🔄 Data Flow

```
UserInfoPage (Orchestrator)
    ├── useUserInfo() → userInfo
    ├── useWatchlistFilmData(userInfo.watchlist) → films
    ├── useFriendshipState(userInfo) → friendshipState
    └── useFriendshipActions(userInfo) → friendshipActions
        │
        ├── UserProfileSection
        │   ├── User avatar, name, email
        │   ├── Statistics display
        │   └── FriendshipStatusButton
        │       ├── Renders based on friendshipState
        │       └── Calls friendshipActions handlers
        │
        └── UserWatchlistSection
            ├── Watchlist grid with films
            └── Loading/Error/Empty states
```

## 🎨 Styling Features

- **Tailwind CSS** - All styling via utility classes
- **Dark Mode Support** - Complete dark:* variants
- **Framer Motion** - Smooth animations and transitions
- **Responsive Design** - Mobile → Desktop layout shifts
- **Color Coding** - Status-based colors (green, blue, yellow, red)

## 📱 Responsive Breakpoints

- **sm** - Flex direction change for profile header
- **lg** - Watchlist grid 3 columns
- **xl** - Watchlist grid 4 columns
- **Mobile** - 1 column watchlist

## ✨ Key Features

✅ **Modular Design** - Each component has single responsibility
✅ **Reusable Hooks** - Friendship state/actions can be used elsewhere
✅ **Error Handling** - Graceful error states with retry
✅ **Loading States** - Animated loaders for async operations
✅ **Session State** - Tracks friendship changes within session
✅ **Toast Notifications** - User feedback for actions
✅ **Animations** - Smooth transitions and motion effects
✅ **Dark Mode** - Full dark theme support
✅ **Accessibility** - Semantic HTML and clear interactions

## 🔌 Dependencies

### External Packages
- `react-router-dom` - Routing
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `framer-motion` - Animations

### Internal Hooks
- `useUserInfo()` - Fetch user data
- `useWatchlistFilmData()` - Fetch watchlist films
- `useFriendActions()` - API friend actions
- `useFriendRequests()` - Fetch friend requests

### Internal Components
- `WatchlistCard` - UI component for film display

## 📖 Usage Examples

### Import Main Component
```javascript
// Direct import
import UserInfoPage from '@/components/pages/User/UserInfoPage/UserInfoPage';

// Via index (recommended)
import { UserInfoPage } from '@/components/pages/User/UserInfoPage';
```

### Import Sub-Components
```javascript
import { 
  UserProfileSection, 
  UserWatchlistSection,
  FriendshipStatusButton 
} from '@/components/pages/User/UserInfoPage';
```

### Use Custom Hooks
```javascript
import { 
  useFriendshipState, 
  useFriendshipActions 
} from '@/components/pages/User/UserInfoPage';

const MyComponent = () => {
  const friendshipState = useFriendshipState(userInfo);
  const actions = useFriendshipActions(userInfo, setRequestSent, setAccepted);
  
  return (
    <FriendshipStatusButton 
      friendshipState={friendshipState}
      onSendRequest={actions.handleSendFriendRequest}
      // ... other handlers
    />
  );
};
```

## 🚀 Benefits of Refactoring

| Aspect | Before | After |
|--------|--------|-------|
| File Size | 510 lines | 6 files, max 130 lines each |
| Testability | Hard - monolithic | Easy - isolated units |
| Reusability | Limited | Hooks/components shareable |
| Maintainability | Complex | Clear separation of concerns |
| Performance | Single hook updates | Optimized re-renders |
| Readability | Dense logic | Clear purpose per file |

## 🔄 Migration Path

The old import path still works via router update:
```javascript
// Old: import UserInfoPage from '@/components/pages/User/UserInfoPage';
// New: import UserInfoPage from '@/components/pages/User/UserInfoPage/UserInfoPage';
```

Both paths are compatible. New code should prefer:
```javascript
import { UserInfoPage } from '@/components/pages/User/UserInfoPage';
```

## 📝 Future Enhancements

- [ ] Add friend removal capability
- [ ] Add user blocking functionality
- [ ] Message user from profile button
- [ ] View mutual friends
- [ ] Follow/Unfollow user
- [ ] User activity timeline
- [ ] Share watchlist functionality
- [ ] Custom friendship request messages
- [ ] User rating/review system
- [ ] Export watchlist feature

## 🧪 Testing Recommendations

- **Unit Tests**: Test hooks with mocked API responses
- **Component Tests**: Test each section with different states
- **Integration Tests**: Test full user flow
- **Accessibility Tests**: Ensure ARIA labels, keyboard nav
- **Performance Tests**: Verify memoization works correctly

## 📚 Related Files

- [Routers.jsx](../../../routes/Routers.jsx) - Route definition
- [useUserInfo.js](../../../../hooks/API/useUserInfo.js) - User data hook
- [useWatchlistFilmData.js](../../../../hooks/watchList/useWatchListFilmData.js) - Watchlist data
- [useFriendActions.js](../../../../hooks/friend/useFriendActions.js) - Friend API actions
- [useFriendRequests.js](../../../../hooks/friend/useFriendRequests.js) - Friend requests query
