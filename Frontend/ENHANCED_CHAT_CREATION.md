# Enhanced Chat Creation Implementation

## Problem Summary
Current implementation has critical issues:
1. Invalid React Query mutation options syntax
2. Non-standard API payload format
3. WebSocket dependency checked but not properly handled
4. `onMessage` callback not implemented
5. No loading/error states for user feedback

---

## Enhanced Solution

### Step 1: Fix `useCreateChat` Hook

**File:** `src/hooks/chat/useCreateChat.js`

```javascript
import instance from "@/lib/instance";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to create a new private chat with one or more users
 * @param {string} token - User authentication token (for cache key)
 * @returns {Object} - React Query mutation with createChat function
 */
const useCreateChat = (token) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (userIds) => {
            // Normalize input: accept single ID or array of IDs
            const normalizedIds = Array.isArray(userIds) ? userIds : [userIds];
            
            // Use standard REST format
            const response = await instance.post('/chats/private', {
                userIds: normalizedIds
            });
            
            return response.data;
        },
        onSuccess: (data) => {
            // Invalidate user info to refresh chat list
            queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
            
            // Optional: Invalidate chats list if it exists
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        },
        onError: (error) => {
            console.error("Failed to create chat:", error);
            // Error handling done by component (toast notifications)
        }
    });
}

export default useCreateChat;
```

**Key Changes:**
- ✅ Clear parameter naming: `userIds` instead of generic `participants`
- ✅ Standard REST payload: `{ userIds: [123, 456] }`
- ✅ Input normalization at hook level (single ID or array)
- ✅ Proper mutation signature (no options in mutate call)

---

### Step 2: Enhance ChatProvider

**File:** `src/context/ChatProvider.jsx`

Replace the `createChat` function with:

```javascript
// Function to create a new chat
const createChat = useCallback(async (userIds) => {
    // 1. Input validation
    if (!userIds || (Array.isArray(userIds) && userIds.length === 0)) {
        console.warn("createChat: No user IDs provided");
        return null;
    }

    // 2. WebSocket connection check with proper feedback
    if (!stompClientRef.current?.connected) {
        toast.error(
            "Connection lost. Please check your internet connection.",
            {
                description: "WebSocket is not connected"
            }
        );
        return null;
    }

    // 3. Check for existing chat to prevent duplicates
    const normalizedIds = Array.isArray(userIds) ? userIds : [userIds];
    const existingChat = chats.find(chat => {
        const chatParticipants = new Set(
            chat.participants?.map(p => p.id) || []
        );
        // For 1-on-1 chats, check if same participants
        if (normalizedIds.length === 1) {
            return chatParticipants.has(normalizedIds[0]) && 
                   chatParticipants.size === 2; // 2 = user + other
        }
        // For group chats, check exact match
        return normalizedIds.every(id => chatParticipants.has(id)) &&
               chatParticipants.size === normalizedIds.length + 1;
    });

    if (existingChat) {
        console.log("Chat already exists, switching to existing chat");
        setActiveChat(existingChat.id);
        return existingChat;
    }

    // 4. Create the chat with proper error handling
    return new Promise((resolve, reject) => {
        createChatMutation(normalizedIds, {
            onSuccess: (data) => {
                try {
                    // Invalidate user info to refresh
                    queryClient.invalidateQueries({ 
                        queryKey: ['userInfo', token] 
                    });

                    // Initialize chat data
                    const newChat = {
                        ...data,
                        latestMessage: null
                    };

                    // Add to local state
                    setChats((prevChats) => [newChat, ...prevChats]);

                    // Subscribe to chat messages
                    subscribeToChat(stompClientRef.current, data.id);

                    // Set as active chat
                    setActiveChat(data.id);

                    // Mark as new (visual indicator)
                    setNewChatIds((prev) => new Set(prev).add(data.id));

                    // Show success feedback
                    toast.success("Chat created successfully", {
                        duration: 2000
                    });

                    resolve(newChat);
                } catch (error) {
                    console.error("Error processing chat creation response:", error);
                    reject(error);
                }
            },
            onError: (error) => {
                console.error("Failed to create chat:", error);
                
                // User-friendly error messages
                const errorMessage = 
                    error.response?.data?.message || 
                    error.message || 
                    "Failed to create chat";

                toast.error("Failed to create chat", {
                    description: errorMessage
                });

                reject(error);
            }
        });
    });
}, [chats, token, createChatMutation, queryClient, stompClientRef]);
```

**Key Improvements:**
- ✅ Input validation
- ✅ Proper WebSocket check with user feedback (toast)
- ✅ Duplicate chat prevention
- ✅ Promise-based return (can be awaited)
- ✅ Better error messages
- ✅ Try-catch for response processing
- ✅ Success feedback to user

**Dependencies:** Add `useCallback` import at top:
```javascript
import { useCallback } from 'react';
import { toast } from 'sonner'; // Add if not already imported
```

---

### Step 3: Implement `onMessage` Callback

**File:** `src/hooks/friend/useFriendListActions.js`

```javascript
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useFriendActions } from './useFriendActions';
import { useChat } from '@/context/ChatProvider';
import { toast } from 'sonner';

/**
 * Hook for managing friend list actions (message, view profile, remove, block)
 * @returns {Object} - Contains action handlers
 */
export const useFriendListActions = () => {
  const navigate = useNavigate();
  const { deleteFriend, updateFriendStatus } = useFriendActions();
  const { createChat } = useChat();

  const onMessage = useCallback(async (friend) => {
    try {
      if (!friend?.id) {
        toast.error("Invalid friend data");
        return;
      }

      // Create or get existing chat with this friend
      const chat = await createChat(friend.id);
      
      if (chat) {
        console.log("Chat created/opened:", chat.id);
        // Chat Provider already sets activeChat, so UI will navigate
        // No additional action needed
      }
    } catch (error) {
      console.error("Error opening chat with friend:", error);
      toast.error("Could not open chat", {
        description: "Please try again"
      });
    }
  }, [createChat]);

  const onViewProfile = useCallback((friend) => {
    navigate(`/user/${friend.id}`);
  }, [navigate]);

  const onRemoveFriend = useCallback((friend) => {
    deleteFriend.mutate(friend.id);
  }, [deleteFriend]);

  const onBlock = useCallback((friend) => {
    updateFriendStatus.mutate({ id: friend.id, status: 'BLOCKED' });
  }, [updateFriendStatus]);

  return {
    onMessage,
    onViewProfile,
    onRemoveFriend,
    onBlock,
  };
};
```

**Key Improvements:**
- ✅ Actually implements the callback
- ✅ Handles async createChat with await
- ✅ Validation and error handling
- ✅ User feedback via toast
- ✅ Proper error catching

---

### Step 4: Update Backend Expectation

Your backend `/chats/private` endpoint should accept:

```json
{
  "userIds": [123, 456]
}
```

**Not:**
```json
{
  "user1Id": 123,
  "user2Id": 456
}
```

If your backend currently expects the old format, you'll need to update either:
1. The backend endpoint to accept standard format, OR
2. Keep using the old format but make frontend match it

---

## Usage Flow - After Enhancement

### Before (Broken ❌)
```
User clicks "Message" on friend
    ↓
onMessage callback is empty
    ↓
Nothing happens
    ↓
User confused 😞
```

### After (Fixed ✅)
```
User clicks "Message" on friend
    ↓
onMessage calls createChat(friendId)
    ↓
Check WebSocket connected
    ↓
Check if chat already exists
    ↓
If new: POST /chats/private { userIds: [friendId] }
    ↓
Server returns chat object
    ↓
Subscribe to chat messages via WebSocket
    ↓
Set as active chat
    ↓
UI auto-navigates to chat view
    ↓
User sees conversation 😊
```

---

## Error Handling Flow

```javascript
// Scenario 1: WebSocket disconnected
User clicks message
    ↓
createChat checks stompClientRef
    ↓
❌ Not connected
    ↓
Toast error: "Connection lost. Please check your internet connection."
    ↓
Return null

// Scenario 2: Chat already exists
User clicks message with existing chat partner
    ↓
createChat finds matching chat in state
    ↓
setActiveChat(existingChat.id)
    ↓
UI switches to existing chat (no API call)
    ↓
Return existing chat

// Scenario 3: API error (user blocked, etc.)
API returns 403 or 4xx error
    ↓
onError callback triggered
    ↓
Parse error.response.data.message from server
    ↓
Toast error with specific message
    ↓
Reject promise
    ↓
onMessage catches and shows additional error
```

---

## Testing Checklist

- [ ] Click "Message" on friend → chat created
- [ ] Click "Message" on same friend again → switches to existing chat (no duplicate)
- [ ] Disconnect WebSocket → see error toast
- [ ] Try to create chat with blocked user → see server error message
- [ ] Chat appears at top of list after creation
- [ ] New chat has visual indicator (newChatIds)
- [ ] Messages from new chat appear in real-time
- [ ] Try message before WebSocket connects → see error
- [ ] Network error during creation → see error with retry option

---

## Migration Path

If you want to implement incrementally:

1. **First**: Fix `useCreateChat.js` (Step 1) - safe, backward compatible check needed
2. **Second**: Implement `onMessage` callback (Step 3) - enables feature
3. **Third**: Enhance ChatProvider (Step 2) - adds robustness
4. **Finally**: Update backend if needed (Step 4) - coordinate with backend dev

---

## Optional: Add Toast Notifications

If using `sonner` library (appears in code), import at top of ChatProvider:
```javascript
import { toast } from 'sonner';
```

If not using `sonner`, replace with your notification system:
```javascript
// Alternative: use context-based notifications
// showNotification(message, type)
```
