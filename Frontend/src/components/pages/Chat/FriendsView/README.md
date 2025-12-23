# FriendsView Module

## Overview
The FriendsView module is a comprehensive friend management system for the Movie Explorer application. It allows users to view their friends list, search for friends, and add new friends.

## Components

### FriendsView.jsx
Main container component that manages the friends interface with two tabs:
- **Friends Tab**: Displays the user's friends list with search functionality
- **Add Friend Tab**: Allows users to search for and add new friends

**Props:**
- `onFriendSelect` (function): Callback when a friend is selected
- `compact` (boolean): Compact view mode for smaller screens (default: false)

### FriendsList.jsx
Displays a searchable list of the user's friends with action options.

**Props:**
- `friends` (array): Array of friend objects
- `isLoadingFriends` (boolean): Loading state
- `error` (string|null): Error message if any
- `compact` (boolean): Compact view mode
- `onFriendSelect` (function): Friend selection callback
- `onViewProfile` (function): View profile callback
- `onMessage` (function): Message friend callback
- `onRemoveFriend` (function): Remove friend callback
- `onBlock` (function): Block friend callback

### AddFriendTab.jsx
Search interface for finding and adding new friends to the user's friends list.

**Props:**
- `compact` (boolean): Compact view mode

## Hooks

### useFriendSearch.js
Custom hook for filtering friends by username or email.

```javascript
const filteredFriends = useFriendSearch(friends, searchTerm);
```

**Parameters:**
- `friends` (array): Array of friend objects
- `searchTerm` (string): Search query string

**Returns:**
- `filteredFriends` (array): Filtered friend array

### useFriendListActions.js
Custom hook for managing friend list actions (message, view profile, remove, block).

```javascript
const { onMessage, onViewProfile, onRemoveFriend, onBlock } = useFriendListActions();
```

**Returns:**
- `onMessage` (function): Handle message action
- `onViewProfile` (function): Navigate to friend's profile
- `onRemoveFriend` (function): Remove friend from list
- `onBlock` (function): Block friend

## File Structure

```
src/components/pages/Chat/FriendsView/
├── FriendsView.jsx          # Main component
├── FriendsList.jsx          # Friends list display
├── AddFriendTab.jsx         # Add friends search
├── index.js                 # Barrel export
└── README.md                # This file
```

```
src/hooks/friend/
├── useFriendSearch.js       # Search hook
├── useFriendListActions.js  # Actions hook
└── ... (other existing friend hooks)
```

## Usage

### Basic Example
```javascript
import { FriendsView } from '@/components/pages/Chat/FriendsView';

function ChatSidebar() {
  const handleFriendSelect = (friendId) => {
    // Handle friend selection
  };

  return (
    <FriendsView 
      onFriendSelect={handleFriendSelect}
      compact={false}
    />
  );
}
```

### Using Hooks Independently
```javascript
import { useFriendSearch } from '@/hooks/friend/useFriendSearch';
import { useFriendListActions } from '@/hooks/friend/useFriendListActions';

function CustomFriendsComponent() {
  const filteredFriends = useFriendSearch(allFriends, searchTerm);
  const actions = useFriendListActions();

  return (
    // Your custom component
  );
}
```

## Dependencies
- React 18+
- Framer Motion (for animations)
- Lucide React (for icons)
- Tailwind CSS (for styling)
- React Router (for navigation)
- Sonner (for toast notifications)

## State Management
- WebSocket context for real-time friend updates
- React hooks for local component state
- React Query for API mutations

## Features
- Real-time friend status updates
- Search friends by username or email
- Block/unblock friends
- Remove friends from list
- View friend profiles
- Message friends (UI prepared, logic pending)
- Responsive design with compact mode
- Animated empty states
- Error handling and loading states
