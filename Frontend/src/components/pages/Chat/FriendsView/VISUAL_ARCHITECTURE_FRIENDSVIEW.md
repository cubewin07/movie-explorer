# FriendsView Module - Visual Architecture

## Component Tree Structure

```
App
└── ChatLayout
    └── FriendsList (Chat component)
        └── FriendsView (Main Container)
            ├── Tabs (UI Component)
            │   ├── TabsList
            │   │   ├── TabsTrigger "Friends"
            │   │   └── TabsTrigger "Add Friend"
            │   │
            │   ├── TabsContent (value="friends")
            │   │   └── FriendsList
            │   │       ├── Search Input
            │   │       ├── ScrollArea
            │   │       │   ├── LoadingState (conditional)
            │   │       │   ├── ErrorState (conditional)
            │   │       │   ├── FriendItem (mapped)
            │   │       │   │   ├── Avatar
            │   │       │   │   ├── User Info
            │   │       │   │   └── DropdownMenu (Actions)
            │   │       │   └── EmptyState (animated, conditional)
            │   │       └── ScrollArea End
            │   │
            │   └── TabsContent (value="add")
            │       └── AddFriendTab
            │           ├── Search Input
            │           ├── ScrollArea
            │           │   ├── LoadingState (conditional)
            │           │   ├── ErrorState (conditional)
            │           │   ├── UserSearchCard (mapped)
            │           │   └── EmptyState (animated, conditional)
            │           └── ScrollArea End
            │
            └── Tabs End
```

## Data & Props Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      FriendsView                                │
│                                                                  │
│  Props: onFriendSelect, compact                                │
│  Hooks: useWebsocket(), useFriendListActions()                 │
│  State: activeTab                                              │
└─────────────────────────────────────────────────────────────────┘
         │                                      │
         │                                      │
         ▼                                      ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│      FriendsList             │   │     AddFriendTab             │
│                              │   │                              │
│ Props:                       │   │ Props:                       │
│  ✓ friends                   │   │  ✓ compact                   │
│  ✓ isLoadingFriends          │   │                              │
│  ✓ error                     │   │ Hooks:                       │
│  ✓ compact                   │   │  ✓ useState(searchQuery)     │
│  ✓ onFriendSelect            │   │  ✓ useEffect(debounce)       │
│  ✓ onViewProfile             │   │  ✓ useUserSearch(query)      │
│  ✓ onMessage                 │   │  ✓ useNavigate()             │
│  ✓ onRemoveFriend            │   │                              │
│  ✓ onBlock                   │   │ API: useUserSearch()         │
│                              │   │                              │
│ Hooks:                       │   │ Rendering:                   │
│  ✓ useFriendSearch()         │   │  ✓ SearchInput               │
│  ✓ useState(search)          │   │  ✓ UserSearchCard[]          │
│                              │   │  ✓ EmptyState               │
│ Rendering:                   │   │  ✓ LoadingState             │
│  ✓ SearchInput               │   │  ✓ ErrorState               │
│  ✓ FriendItem[]              │   └──────────────────────────────┘
│  ✓ EmptyState               │
│  ✓ LoadingState             │
│  ✓ ErrorState               │
└──────────────────────────────┘
         │
         │ Filtered by: useFriendSearch()
         ▼
┌──────────────────────────────┐
│      FriendItem              │
│                              │
│ Props:                       │
│  ✓ friend                    │
│  ✓ compact                   │
│  ✓ onFriendSelect            │
│  ✓ onViewProfile             │
│  ✓ onMessage                 │
│  ✓ onRemoveFriend            │
│  ✓ onBlock                   │
│  ✓ showActions               │
│                              │
│ Children:                    │
│  ✓ Avatar                    │
│  ✓ Username                  │
│  ✓ DropdownMenu              │
│  ✓ ActionButtons             │
└──────────────────────────────┘
```

## Data Flow Diagram

```
WebSocket Context
       │
       ├── friends: Friend[]
       ├── isLoadingFriends: boolean
       └── error: Error | null
              │
              ▼
       useWebsocket() Hook
              │
              ▼
       FriendsView
              │
              ├─────────────────────────────────┐
              │                                 │
              ▼                                 ▼
         FriendsList                     AddFriendTab
              │                                 │
              ├─→ useFriendSearch              ├─→ searchQuery (input)
              │   (username + email)           │
              │                                ├─→ useEffect (500ms debounce)
              ▼                                │
         filteredFriends[]                     ▼
              │                            debouncedQuery
              │                                │
              └─→ map(friend)                  └─→ useUserSearch (API)
                  │                                │
                  ▼                                ▼
              FriendItem[]                    searchResults[]
                  │                                │
                  └─→ Avatar                       └─→ map(user)
                  ├─→ UserInfo                         │
                  └─→ Actions                         ▼
                      ├─→ onViewProfile         UserSearchCard
                      ├─→ onMessage
                      ├─→ onRemoveFriend        Actions:
                      └─→ onBlock               └─→ View Profile
                                                └─→ Send Request
```

## Hook Dependencies Diagram

```
useFriendSearch
├── Dependencies: [friends, searchTerm]
├── Memoization: useMemo
└── Returns: filteredFriends[]

useFriendListActions
├── Dependencies:
│   ├── useNavigate()
│   │   └── onViewProfile(friend)
│   │       └── navigate("/user/{id}")
│   │
│   ├── useFriendActions()
│   │   ├── deleteFriend mutation
│   │   │   └── onRemoveFriend(friend)
│   │   │       └── deleteFriend.mutate(id)
│   │   │
│   │   └── updateFriendStatus mutation
│   │       └── onBlock(friend)
│   │           └── updateFriendStatus.mutate()
│   │
│   └── (empty)
│       └── onMessage(friend)
│           └── TODO: pending implementation
│
└── Returns:
    ├── onMessage: (friend) => void
    ├── onViewProfile: (friend) => void
    ├── onRemoveFriend: (friend) => void
    └── onBlock: (friend) => void
```

## State Management Architecture

```
┌──────────────────────────────────────────────────────┐
│              State Layers                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Global State (WebSocket Context)                   │
│  ├─ friends: Friend[]                               │
│  ├─ isLoadingFriends: boolean                       │
│  └─ error: Error | null                             │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Component State                                    │
│  ├─ FriendsView                                     │
│  │  └─ activeTab: 'friends' | 'add'                │
│  │                                                  │
│  ├─ FriendsList                                    │
│  │  └─ search: string                              │
│  │                                                  │
│  └─ AddFriendTab                                   │
│     ├─ searchQuery: string                         │
│     └─ debouncedQuery: string                      │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Server State (React Query)                         │
│  ├─ deleteFriend mutation (isLoading, error)        │
│  ├─ updateFriendStatus mutation (isLoading, error)  │
│  └─ useUserSearch query (isLoading, error, data)    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## File Organization Diagram

```
src/
│
├── components/pages/Chat/FriendsView/
│   ├── FriendsView.jsx                (Main container)
│   │   └── Orchestrates Friends & Add tabs
│   │   └── Imports: FriendsList, AddFriendTab
│   │   └── Hooks: useWebsocket, useFriendListActions
│   │
│   ├── FriendsList.jsx                (Friends display)
│   │   └── Search & displays friends
│   │   └── Imports: FriendItem
│   │   └── Hooks: useFriendSearch
│   │
│   ├── AddFriendTab.jsx               (Add friends search)
│   │   └── Search & discover users
│   │   └── Imports: UserSearchCard
│   │   └── Hooks: useUserSearch, useNavigate
│   │
│   ├── index.js                       (Barrel exports)
│   │   └── export { FriendsView }
│   │   └── export { FriendsList }
│   │   └── export { AddFriendTab }
│   │
│   ├── README.md                      (Component documentation)
│   │   └── Component details & usage
│   │
│   ├── FriendItem.jsx                 (Not moved - existing)
│   ├── UserSearchCard.jsx             (Not moved - existing)
│   └── FriendsList.jsx                (Chat component - existing)
│
└── hooks/friend/
    ├── useFriendSearch.js             (NEW - Filter friends)
    │   └── const filteredFriends = useFriendSearch(friends, term)
    │   └── Memoized filtering by username & email
    │
    ├── useFriendListActions.js        (NEW - Action handlers)
    │   └── const { onViewProfile, onRemoveFriend, onBlock } = ...
    │   └── useCallback wrapped functions
    │
    ├── README.md                      (Hooks documentation)
    │   └── Hook details & usage
    │
    ├── useFriends.js                  (Existing)
    ├── useFriendActions.js            (Existing)
    ├── useUserSearch.js               (Existing)
    └── ... (other friend hooks)

Root: ARCHITECTURE_FRIENDSVIEW.md    (Architecture docs)
```

## Component Responsibility Matrix

```
┌──────────────────────┬───────────────────────────────────────┐
│   Component          │  Responsibilities                     │
├──────────────────────┼───────────────────────────────────────┤
│ FriendsView          │ ✓ Tab orchestration                   │
│                      │ ✓ Setup action handlers               │
│                      │ ✓ Pass data to children               │
│                      │ ✓ Style container                     │
├──────────────────────┼───────────────────────────────────────┤
│ FriendsList          │ ✓ Search implementation               │
│                      │ ✓ Filter friends list                 │
│                      │ ✓ Render friend items                 │
│                      │ ✓ Handle loading/error states         │
│                      │ ✓ Animated empty state                │
├──────────────────────┼───────────────────────────────────────┤
│ AddFriendTab         │ ✓ User search interface               │
│                      │ ✓ Debounce search input               │
│                      │ ✓ Display search results              │
│                      │ ✓ Handle loading/error states         │
│                      │ ✓ Animated empty state                │
├──────────────────────┼───────────────────────────────────────┤
│ useFriendSearch      │ ✓ Filter by username/email            │
│                      │ ✓ Memoize results                     │
│                      │ ✓ Case-insensitive search             │
├──────────────────────┼───────────────────────────────────────┤
│ useFriendListActions │ ✓ Create action handlers              │
│                      │ ✓ Integrate mutations                 │
│                      │ ✓ Handle navigation                   │
│                      │ ✓ Memoize callbacks                   │
└──────────────────────┴───────────────────────────────────────┘
```

## Integration Points

```
FriendsView Module
├── ← WebSocket Context
│   └── Real-time friend updates
│
├── ← React Router
│   └── Navigation to friend profiles
│
├── ← React Query / API Hooks
│   ├── useUserSearch
│   ├── useFriendActions (deleteFriend)
│   └── useFriendActions (updateFriendStatus)
│
├── → UI Components Library
│   ├── Tabs
│   ├── Input
│   ├── ScrollArea
│   ├── Avatar
│   ├── Badge
│   └── DropdownMenu
│
├── → Icons Library (Lucide)
│   ├── Search
│   ├── UserPlus
│   ├── Users
│   └── More...
│
└── → Animation Library (Framer Motion)
    ├── EmptyState animations
    └── Transitions
```

## Mutation/Query Flow

```
FriendsList
└── onRemoveFriend(friend)
    └── deleteFriend.mutate(friend.id)
        ├── API Call: DELETE /api/friends/{id}
        ├── State: isLoading, isSuccess, isError
        └── WebSocket: Friend list updates in real-time

FriendsList
└── onBlock(friend)
    └── updateFriendStatus.mutate({ id, status: 'BLOCKED' })
        ├── API Call: PUT /api/friends/{id}
        ├── State: isLoading, isSuccess, isError
        └── WebSocket: Friend status updates in real-time

AddFriendTab
└── useUserSearch(debouncedQuery)
    └── API Call: GET /api/users/search?q={query}
        ├── State: isLoading, isSuccess, isError
        └── Response: { content: [], totalPages: 0, ... }
```
