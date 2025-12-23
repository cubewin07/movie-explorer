# FriendsView Module - Architecture Documentation

## Table of Contents
1. [Visual Architecture](#visual-architecture)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Hook Architecture](#hook-architecture)
5. [File Structure](#file-structure)
6. [Integration Points](#integration-points)
7. [State Management](#state-management)

---

## Visual Architecture

### High-Level Component Hierarchy

```
FriendsView (Main Container)
├── Tabs Container
│   ├── Friends Tab
│   │   └── FriendsList
│   │       ├── Search Input
│   │       ├── ScrollArea
│   │       │   ├── FriendItem (x n)
│   │       │   └── Empty State (animated)
│   │       └── Loading/Error States
│   │
│   └── Add Friend Tab
│       └── AddFriendTab
│           ├── Search Input
│           ├── ScrollArea
│           │   ├── UserSearchCard (x n)
│           │   └── Empty State (animated)
│           └── Loading/Error States
```

### Props Flow Diagram

```
FriendsView
  │
  ├─→ FriendsList
  │   ├─→ friends (from WebSocket)
  │   ├─→ isLoadingFriends
  │   ├─→ error
  │   ├─→ compact
  │   └─→ Callbacks (onViewProfile, onRemoveFriend, onBlock)
  │
  └─→ AddFriendTab
      └─→ compact
```

---

## Component Architecture

### FriendsView.jsx

**Responsibility:** Main orchestrator component

```
┌─────────────────────────────────────┐
│        FriendsView                  │
├─────────────────────────────────────┤
│ Props:                              │
│  - onFriendSelect (func)            │
│  - compact (bool)                   │
├─────────────────────────────────────┤
│ Hooks Used:                         │
│  - useWebsocket() - friend data     │
│  - useFriendListActions() - actions │
├─────────────────────────────────────┤
│ State:                              │
│  - activeTab (friends|add)          │
├─────────────────────────────────────┤
│ Children:                           │
│  - Tabs (UI Component)              │
│  - FriendsList                      │
│  - AddFriendTab                     │
└─────────────────────────────────────┘
```

**Lifecycle:**
1. Initialize with active tab = 'friends'
2. Fetch friends from WebSocket context
3. Setup action handlers via useFriendListActions
4. Pass data and handlers to child components
5. Handle tab switching

---

### FriendsList.jsx

**Responsibility:** Display and search friends list

```
┌──────────────────────────────────────┐
│      FriendsList                     │
├──────────────────────────────────────┤
│ Props:                               │
│  - friends (array)                   │
│  - isLoadingFriends (bool)           │
│  - error (string|null)               │
│  - compact (bool)                    │
│  - onFriendSelect (func)             │
│  - onViewProfile (func)              │
│  - onMessage (func)                  │
│  - onRemoveFriend (func)             │
│  - onBlock (func)                    │
├──────────────────────────────────────┤
│ Hooks Used:                          │
│  - useFriendSearch() - filtering     │
│  - useState() - search input         │
├──────────────────────────────────────┤
│ Rendering States:                    │
│  ✓ Loading State (Loader)            │
│  ✓ Error State (ErrorState)          │
│  ✓ Data State (FriendItem list)      │
│  ✓ Empty State (Animated icon+text)  │
└──────────────────────────────────────┘
```

**Search Mechanism:**
```
User Input → useState(search)
   ↓
useFriendSearch(friends, search)
   ↓
Filtered Friends Array
   ↓
Map to FriendItem Components
```

---

### AddFriendTab.jsx

**Responsibility:** Search and add new friends

```
┌──────────────────────────────────────┐
│      AddFriendTab                    │
├──────────────────────────────────────┤
│ Props:                               │
│  - compact (bool)                    │
├──────────────────────────────────────┤
│ Hooks Used:                          │
│  - useState() - search query         │
│  - useEffect() - debounce            │
│  - useUserSearch() - API call        │
│  - useNavigate() - profile nav       │
├──────────────────────────────────────┤
│ States:                              │
│  - searchQuery (immediate input)     │
│  - debouncedQuery (500ms delay)      │
├──────────────────────────────────────┤
│ Rendering States:                    │
│  ✓ Empty/Idle State (animated)       │
│  ✓ Loading State (Loader)            │
│  ✓ Results State (UserSearchCard)    │
│  ✓ No Results State                  │
└──────────────────────────────────────┘
```

**Search Flow:**
```
User Types → searchQuery (immediate)
   ↓
useEffect (500ms debounce)
   ↓
debouncedQuery → useUserSearch API
   ↓
Results → UserSearchCard Components
```

---

## Data Flow

### Friends Data Flow

```
WebSocket Context
       ↓
useWebsocket() Hook
       ↓
FriendsView Component
       ├─→ friends (friend list)
       ├─→ isLoadingFriends (boolean)
       └─→ error (error message)
           ↓
        FriendsList Component
           ↓
    useFriendSearch Hook (filtering)
           ↓
    FriendItem Components (rendering)
```

### Action Flow

```
FriendsView
   ↓
useFriendListActions Hook
   ├─→ onMessage (pending)
   ├─→ onViewProfile (navigate to profile)
   ├─→ onRemoveFriend (delete mutation)
   └─→ onBlock (update status mutation)
           ↓
    FriendsList (passes to children)
           ↓
    FriendItem (executes on user interaction)
           ↓
    API Mutations / Navigation
```

---

## Hook Architecture

### useFriendSearch.js

```
Input:
  ├─ friends: Friend[]
  └─ searchTerm: string
       ↓
Processing:
  ├─ useMemo (performance optimization)
  ├─ Case-insensitive comparison
  ├─ Search by username OR email
  └─ Return filtered array
       ↓
Output:
  └─ filteredFriends: Friend[]
```

**Memoization Dependencies:**
- `friends`: Array of friend objects
- `searchTerm`: Search query string

**Complexity:** O(n*m) where n=friends count, m=search term length

---

### useFriendListActions.js

```
Hooks Used:
  ├─ useNavigate() [React Router]
  └─ useFriendActions() [Custom Hook]
       ├─ deleteFriend mutation
       └─ updateFriendStatus mutation
           ↓
Returns 4 Memoized Callbacks:

1. onMessage(friend)
   └─ TODO: Pending chat UI implementation
   
2. onViewProfile(friend)
   └─ navigate(`/user/${friend.id}`)
   
3. onRemoveFriend(friend)
   └─ deleteFriend.mutate(friend.id)
   
4. onBlock(friend)
   └─ updateFriendStatus.mutate({
        id: friend.id, 
        status: 'BLOCKED'
      })
```

**useCallback Dependencies Tracking:**
```
onMessage → [] (no dependencies - placeholder)
onViewProfile → [navigate]
onRemoveFriend → [deleteFriend]
onBlock → [updateFriendStatus]
```

---

## File Structure

```
src/
├── components/
│   └── pages/
│       └── Chat/
│           ├── FriendsView/                    ← NEW FOLDER
│           │   ├── FriendsView.jsx            (Main container)
│           │   ├── FriendsList.jsx            (Friends display)
│           │   ├── AddFriendTab.jsx           (Add friends search)
│           │   ├── index.js                   (Barrel export)
│           │   └── README.md                  (Component docs)
│           │
│           ├── FriendsView.jsx                ← OLD FILE (DELETE AFTER MIGRATION)
│           ├── AddFriendTab.jsx               ← OLD FILE (MOVE TO FriendsView/)
│           ├── FriendItem.jsx                 (Unchanged - used by FriendsList)
│           ├── UserSearchCard.jsx             (Used by AddFriendTab)
│           ├── FriendsList.jsx                (Unchanged - imports updated)
│           └── ... (other chat components)
│
└── hooks/
    └── friend/
        ├── useFriendSearch.js                 ← NEW HOOK
        ├── useFriendListActions.js            ← NEW HOOK
        ├── README.md                          (Hooks docs)
        ├── useFriends.js                      (Existing)
        ├── useFriendActions.js                (Existing)
        ├── useFriendRequests.js               (Existing)
        ├── useFriendStatus.js                 (Existing)
        └── ... (other friend hooks)
```

---

## Integration Points

### 1. WebSocket Integration
**File:** `src/context/Websocket/WebsocketProvider.jsx`

```
useWebsocket() provides:
  ├─ friends: Friend[] (real-time updates)
  ├─ isLoadingFriends: boolean
  └─ error: Error message
```

### 2. API Integration
**Files:**
- `src/hooks/friend/useFriendActions.js` - Mutations
- `src/hooks/friend/useUserSearch.js` - User search
- `src/lib/axiosInstance.js` - HTTP client

```
FriendListActions Flow:
  ├─ deleteFriend → DELETE /api/friends/{id}
  └─ updateFriendStatus → PUT /api/friends/{id}
```

### 3. Routing Integration
**File:** `src/components/routes/Routers.jsx`

```javascript
// Updated import
import { FriendsView } from '../pages/Chat/FriendsView';

// Route definition
{
  path: '/friends',
  element: <FriendsView />
}
```

### 4. UI Components Used
- `@/components/ui/tabs` - Tabs container
- `@/components/ui/input` - Search input
- `@/components/ui/scroll-area` - Scrollable area
- `@/components/ui/avatar` - User avatars
- `@/components/ui/badge` - Status badge
- `@/components/ui/button` - Action buttons
- `lucide-react` - Icons
- `framer-motion` - Animations

---

## State Management

### Component-Level State

**FriendsView:**
```javascript
activeTab: 'friends' | 'add'  // Tab selection state
```

**FriendsList:**
```javascript
search: string  // Friend search input
```

**AddFriendTab:**
```javascript
searchQuery: string         // Immediate search input
debouncedQuery: string      // Debounced query (500ms)
```

### Global State (Context)

**WebSocket Context:**
```javascript
{
  friends: Friend[],
  isLoadingFriends: boolean,
  error: Error | null,
  ...otherWebsocketData
}
```

### Server State (React Query)

**useFriendActions:**
```javascript
deleteFriend.mutate(id)        // DELETE mutation
updateFriendStatus.mutate({})  // PUT mutation
```

**useUserSearch:**
```javascript
{
  data: SearchResults,
  isLoading: boolean,
  error: Error | null
}
```

---

## Performance Optimizations

### 1. Memoization
```javascript
// useFriendSearch
useMemo(() => {
  // Expensive search operation
}, [friends, searchTerm])

// useFriendListActions
useCallback((friend) => {
  navigate(`/user/${friend.id}`);
}, [navigate])
```

### 2. Debouncing
```javascript
// AddFriendTab - 500ms debounce on search
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(searchQuery);
  }, 500);
  return () => clearTimeout(timer);
}, [searchQuery])
```

### 3. Lazy Rendering
- ScrollArea component for virtualization
- Conditional rendering of states
- No unnecessary re-renders

---

## Error Handling

### Error States
```javascript
ErrorState Component shows:
  ├─ "Failed to load friends" (FriendsList)
  └─ "Failed to search users" (AddFriendTab)
```

### Loading States
```javascript
LoadingState Component shows:
  ├─ Spinner animation
  └─ Loading indicator
```

### Empty States
```javascript
Animated Empty States:
  ├─ "No friends yet" (FriendsList)
  ├─ "No friends found" (FriendsList + search)
  └─ "Start typing to search" (AddFriendTab)
```

---

## Migration Checklist

- [x] Create FriendsView folder structure
- [x] Extract useFriendSearch hook
- [x] Extract useFriendListActions hook
- [x] Create FriendsList component
- [x] Refactor FriendsView main component
- [x] Move AddFriendTab to new folder
- [x] Update imports in Routers.jsx
- [x] Update imports in FriendsList.jsx (Chat component)
- [x] Create comprehensive documentation
- [ ] Delete old FriendsView.jsx file (after testing)
- [ ] Delete old AddFriendTab.jsx file (after migration)
- [ ] Test all functionality in browser

---

## Key Design Decisions

1. **Separation of Concerns:** Extracted hooks for reusability and testability
2. **Folder Structure:** Organized FriendsView components in dedicated folder
3. **Barrel Exports:** Index.js for clean imports
4. **Custom Hooks:** Extracted search and action logic for independence
5. **Memoization:** Performance optimized with useMemo and useCallback
6. **Debouncing:** User search debounced to reduce API calls

---

## Future Improvements

1. **Message Feature:** Complete onMessage implementation in useFriendListActions
2. **Infinite Scroll:** Implement pagination for large friend lists
3. **Real-time Updates:** Leverage WebSocket for live friend status
4. **Caching:** Implement query caching for friend searches
5. **Unit Tests:** Add comprehensive test coverage
6. **Accessibility:** Improve keyboard navigation and ARIA labels
