# Profile Module - Visual Architecture

## Directory Structure

```
src/
├── components/
│   └── pages/
│       ├── Profile/                          # NEW: Profile Module
│       │   ├── Profile.jsx                   # Main component (~125 lines)
│       │   ├── ProfileHeader.jsx             # User info display (~50 lines)
│       │   ├── ProfileStats.jsx              # Stats & activity (~80 lines)
│       │   ├── ProfileEditDialog.jsx         # Edit modal (~130 lines)
│       │   ├── index.js                      # Module exports
│       │   └── README.md                     # Module documentation
│       ├── Profile.jsx                       # DEPRECATED: Old file (will be removed)
│       └── ... other pages
│
└── hooks/
    └── profile/                              # NEW: Profile Hooks
        ├── useProfileStats.js                # Stats calculation (~35 lines)
        ├── useProfileEdit.js                 # Edit state management (~65 lines)
        └── index.js                          # Hook exports
```

## Component Hierarchy Tree

```
Layout (from router)
  └── Profile
      ├── ProfileHeader
      │   └── Camera Button (Avatar Edit)
      │
      ├── ProfileStats
      │   ├── Stat Card (Watchlist)
      │   ├── Stat Card (Reviews)
      │   ├── Stat Card (Favorites)
      │   └── Recent Activity List
      │       └── Activity Items (with icons)
      │
      └── ProfileEditDialog (Modal)
          ├── Avatar Upload
          ├── Username Input
          ├── Email Input
          ├── Bio Input
          └── Action Buttons (Cancel/Save)
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        AuthenProvider                           │
│                    (Global Auth Context)                        │
│                          ↓                                       │
│                      authUser: {                                │
│                        username, email, bio,                    │
│                        avatar, watchlist,                       │
│                        reviews, favorites, recent               │
│                      }                                          │
└──────────────────────────┬──────────────────────────────────────┘
                          │
                          ↓
            ┌─────────────────────────────┐
            │   Profile Component         │
            │  (Main Container)           │
            │                             │
            │ State:                      │
            │ - user (local state)        │
            │ - editState (from hook)     │
            └──────────────┬──────────────┘
                          │
         ┌────────────────┼────────────────┐
         ↓                ↓                ↓
    ┌─────────────┐  ┌──────────────┐  ┌────────────────┐
    │Profile      │  │ProfileStats  │  │ProfileEditDialog
    │Header       │  │              │  │                │
    │             │  │- Stats Cards │  │- Form Fields   │
    │- Avatar     │  │- Activity    │  │- Avatar Upload │
    │- User Info  │  │  List        │  │- Save/Cancel   │
    │- Edit Btn   │  │              │  │                │
    └──────┬──────┘  └──────────────┘  └────────────────┘
           │
           └─→ Calls onEdit()
               → Opens ProfileEditDialog
               → useProfileEdit hook manages state
```

## Hook Integration

```
┌────────────────────────────────────────────────┐
│        Profile Component                       │
│                                                │
│  const stats = useProfileStats(authUser)      │
│       ↓                                        │
│  {watchlist, reviews, favorites}              │
│                                                │
│  const editState = useProfileEdit(user)       │
│       ↓                                        │
│  {editOpen, editData, avatarPreview, ...}     │
└────────────────────────────────────────────────┘
```

## State Management Flow

```
Initial State (from authUser)
    ↓
Profile initializes user state
    ↓
User views profile (ProfileHeader + ProfileStats)
    ↓
User clicks "Edit" button
    ↓
useProfileEdit opens dialog (editOpen = true)
    ↓
User modifies form fields (editData updates)
    ↓
User clicks "Save"
    ↓
handleSaveProfile updates Profile state
    ↓
Dialog closes, Profile re-renders with new data
```

## Props Flow

```
Profile
├── → ProfileHeader
│   ├── user: { username, email, bio, avatar }
│   ├── avatarPreview: string
│   └── onEdit: (user) => void
│
├── → ProfileStats
│   ├── stats: { watchlist, reviews, favorites }
│   └── recent: Array
│
└── → ProfileEditDialog
    ├── isOpen: boolean
    ├── editData: { username, email, bio, avatar }
    ├── avatarPreview: string
    ├── onClose: () => void
    ├── onEditDataChange: (data) => void
    ├── onAvatarChange: (e) => void
    └── onSave: () => void
```

## Module Export Structure

```
Profile Module (index.js)
├── export Profile (main)
├── export ProfileHeader
├── export ProfileStats
└── export ProfileEditDialog

Profile Hooks (hooks/profile/index.js)
├── export useProfileStats
└── export useProfileEdit

Can be imported as:
import { Profile } from '@/components/pages/Profile'
import { useProfileStats, useProfileEdit } from '@/hooks/profile'
```

## File Size Optimization

```
Before Refactoring:
└── Profile.jsx (276 lines)

After Refactoring:
├── Profile.jsx (125 lines) ↓ 55% reduction
├── ProfileHeader.jsx (50 lines)
├── ProfileStats.jsx (80 lines)
├── ProfileEditDialog.jsx (130 lines)
├── useProfileStats.js (35 lines)
├── useProfileEdit.js (65 lines)
└── Supporting files (8 lines)

Better Code Organization:
✓ Single responsibility per component
✓ Reusable hooks
✓ Easier to test and maintain
```

## Feature Breakdown

### Profile Display Features
- Avatar with fallback gradient
- Username & email display
- Bio display
- Edit button

### Stats Features
- Watchlist count
- Reviews count
- Favorites count
- Visual icons per stat
- Gradient background cards

### Recent Activity Features
- Activity list display
- Type-specific icons (watched, reviewed, favorited)
- Status badges
- Timestamp display
- Animated list items

### Edit Features
- Avatar upload with preview
- Username field
- Email field
- Bio field
- Modal dialog with backdrop
- Form validation (via UI components)
- Save/Cancel buttons
- Auto-reset on close

## Performance Optimizations

1. **useProfileStats** - Uses `useMemo` to memoize calculations
2. **Component Splitting** - Reduces unnecessary re-renders
3. **Isolated State** - Edit state doesn't affect display state
4. **File Organization** - Better bundling and code splitting

## Import Examples

### Old Way (Deprecated but still works)
```javascript
import Profile from '@/components/pages/Profile.jsx';
```

### New Way (Recommended)
```javascript
// Component
import { Profile } from '@/components/pages/Profile';

// Or specific components
import { ProfileHeader, ProfileStats } from '@/components/pages/Profile';

// Hooks
import { useProfileStats, useProfileEdit } from '@/hooks/profile';
```
