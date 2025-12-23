# Friend Hooks Documentation

## Overview
Custom React hooks for friend management functionality in the Movie Explorer application.

## Hooks

### useFriendSearch.js
**Purpose:** Filter and search through friends list by username or email

**Location:** `src/hooks/friend/useFriendSearch.js`

**Usage:**
```javascript
import { useFriendSearch } from '@/hooks/friend/useFriendSearch';

function MyComponent() {
  const filteredFriends = useFriendSearch(friends, searchTerm);
  
  return (
    // Render filtered friends
  );
}
```

**Parameters:**
- `friends` (array, default: []): Array of friend objects with structure:
  ```javascript
  {
    user: {
      id: string,
      username: string,
      email: string,
      // ...other fields
    },
    status: string,
  }
  ```
- `searchTerm` (string, default: ''): Search query to filter by username or email

**Returns:**
- Array of filtered friend objects

**Features:**
- Memoized for performance optimization
- Case-insensitive search
- Searches both username and email fields
- Returns empty array if no friends or empty search term

---

### useFriendListActions.js
**Purpose:** Manage friend list actions (message, view profile, remove, block)

**Location:** `src/hooks/friend/useFriendListActions.js`

**Usage:**
```javascript
import { useFriendListActions } from '@/hooks/friend/useFriendListActions';

function MyComponent() {
  const { 
    onMessage, 
    onViewProfile, 
    onRemoveFriend, 
    onBlock 
  } = useFriendListActions();
  
  return (
    <button onClick={() => onViewProfile(friend)}>
      View Profile
    </button>
  );
}
```

**Returns:**
```javascript
{
  onMessage: (friend) => void,           // Send message (pending implementation)
  onViewProfile: (friend) => void,       // Navigate to friend's profile page
  onRemoveFriend: (friend) => void,      // Delete friend from list
  onBlock: (friend) => void,             // Block friend (status: BLOCKED)
}
```

**Action Details:**

#### onMessage(friend)
- **Status:** Pending - awaiting chat UI and logic completion
- **Purpose:** Handle message sending to friend
- **Callback:** None currently

#### onViewProfile(friend)
- **Purpose:** Navigate to friend's user profile page
- **Route:** `/user/{friend.id}`
- **Dependencies:** React Router's useNavigate

#### onRemoveFriend(friend)
- **Purpose:** Delete a friend from the friends list
- **API:** Uses `useFriendActions` mutation `deleteFriend`
- **Payload:** `friend.id`

#### onBlock(friend)
- **Purpose:** Block a friend (updates friendship status to BLOCKED)
- **API:** Uses `useFriendActions` mutation `updateFriendStatus`
- **Payload:** `{ id: friend.id, status: 'BLOCKED' }`

**Features:**
- All handlers wrapped with useCallback for optimization
- Integrated with existing friend management hooks
- Automatic navigation and mutations handled
- Event propagation prevented where needed

---

## Integration with Existing Hooks

### Dependencies
- `useFriendActions`: Provides `deleteFriend` and `updateFriendStatus` mutations
- `useNavigate`: React Router hook for navigation
- `useWebsocket`: Provides real-time friend data updates

### Used By
- `FriendsList` component
- `FriendsView` component
- Custom friend management components

---

## Performance Considerations

### useFriendSearch
- **Memoization:** Uses `useMemo` to prevent unnecessary recalculations
- **Optimization:** Only recalculates when `friends` or `searchTerm` changes
- **Complexity:** O(n) search where n = number of friends

### useFriendListActions
- **Memoization:** Uses `useCallback` for all returned functions
- **Dependencies:** Properly tracked to prevent stale closure issues
- **Performance:** No unnecessary renders caused by action function changes

---

## Testing Recommendations

### useFriendSearch
```javascript
describe('useFriendSearch', () => {
  it('filters friends by username', () => {
    // Test case
  });
  
  it('filters friends by email', () => {
    // Test case
  });
  
  it('performs case-insensitive search', () => {
    // Test case
  });
});
```

### useFriendListActions
```javascript
describe('useFriendListActions', () => {
  it('navigates to friend profile', () => {
    // Test case
  });
  
  it('calls delete mutation on remove', () => {
    // Test case
  });
  
  it('calls update status mutation on block', () => {
    // Test case
  });
});
```

---

## Migration Notes

These hooks were extracted from the original `FriendsView.jsx` (150+ lines) to improve:
- **Reusability:** Use hooks independently in other components
- **Maintainability:** Separate concerns and logic
- **Testability:** Easier to unit test individual hooks
- **Performance:** Optimized with memoization
