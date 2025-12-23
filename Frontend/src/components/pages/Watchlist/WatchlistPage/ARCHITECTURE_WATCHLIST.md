# WatchlistPage Architecture

## Directory Structure

```
src/components/pages/Watchlist/
├── WatchlistPage/                          [Refactored Module]
│   ├── WatchlistPage.jsx                   (Main Component - 120 lines)
│   ├── WatchlistGrid.jsx                   (Grid Display - 45 lines)
│   ├── WatchlistEmptyState.jsx             (Empty State UI - 50 lines)
│   ├── WatchlistLoadingSkeleton.jsx        (Loading UI - 30 lines)
│   ├── useWatchlistDisplay.js              (Data Hook - 50 lines)
│   ├── index.js                            (Exports - 15 lines)
│   └── README.md                           (Documentation)
│
└── WatchlistPage.jsx                       [OLD - Can be removed after migration]
```

## Component Hierarchy

```
WatchlistPage (Container Component)
│
├─ [Not Authenticated]
│  └─ Login Prompt (Framer Motion)
│
├─ [Loading State]
│  └─ WatchlistLoadingSkeleton
│     └─ 12x Skeleton Cards
│
├─ [Error State]
│  └─ ErrorState (UI Component)
│
├─ [Empty State]
│  └─ WatchlistEmptyState
│     ├─ Icon Animation
│     ├─ Title & Description
│     └─ CTA Button
│
└─ [Success State]
   └─ WatchlistGrid
      ├─ Animated Container
      │  └─ Staggered Children
      │     └─ WatchlistCard (x N)
      │        ├─ Film Image
      │        ├─ Title & Info
      │        └─ Remove Button
      └─ AnimatePresence (Exit Animations)
```

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│          WatchlistPage (Main Container)             │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │    useWatchlistDisplay() [Custom Hook]       │  │
│  │                                              │  │
│  │  ├─ useWatchlist()                           │  │
│  │  │  └─ Fetches: watchlistData                │  │
│  │  │                                           │  │
│  │  ├─ useWatchlistFilmData(watchlistData)     │  │
│  │  │  └─ Fetches: films, isLoading, error    │  │
│  │  │                                           │  │
│  │  ├─ useMemo → isLoading (combined)          │  │
│  │  ├─ useMemo → error (combined)              │  │
│  │  └─ useMemo → isEmpty (derived)             │  │
│  │                                              │  │
│  │  Returns: {                                  │  │
│  │    films: Array<Object>,                    │  │
│  │    isLoading: Boolean,                      │  │
│  │    error: Object|null,                      │  │
│  │    isEmpty: Boolean                         │  │
│  │  }                                           │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │   useRemoveFromWatchList() [Mutation Hook]   │  │
│  │   └─ Mutation handler for film removal       │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │     State-Based Conditional Rendering        │  │
│  │                                              │  │
│  │  if (!user) → Login Prompt                  │  │
│  │  if (isLoading) → WatchlistLoadingSkeleton  │  │
│  │  if (error) → ErrorState                    │  │
│  │  if (isEmpty) → WatchlistEmptyState         │  │
│  │  else → WatchlistGrid                       │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## State Management

```
┌─ AuthenProvider Context
│  ├─ user: Object|null
│  └─ token: String
│
└─ WatchlistPage Internal State
   ├─ From useWatchlistDisplay()
   │  ├─ films: Array<Object>
   │  ├─ isLoading: Boolean
   │  ├─ error: Object|null
   │  └─ isEmpty: Boolean
   │
   ├─ From useRemoveFromWatchList()
   │  └─ removeFromWatchList: Function (mutation)
   │
   └─ Navigation
      └─ navigate: Function (from useNavigate)
```

## Import Dependencies

```
WatchlistPage.jsx
├─ React Hooks
│  ├─ useAuthen (AuthenProvider)
│  ├─ useNavigate (react-router-dom)
│  └─ useRemoveFromWatchList (custom hook)
│
├─ Components
│  ├─ WatchlistGrid.jsx
│  ├─ WatchlistEmptyState.jsx
│  ├─ WatchlistLoadingSkeleton.jsx
│  ├─ Button (ui)
│  ├─ ErrorState (ui)
│  └─ Film Icon (lucide-react)
│
├─ Hooks
│  └─ useWatchlistDisplay.js
│
└─ Libraries
   ├─ framer-motion (animations)
   └─ react-router-dom (navigation)

WatchlistGrid.jsx
├─ Components
│  └─ WatchlistCard (ui)
│
└─ Libraries
   └─ framer-motion (animations)

WatchlistEmptyState.jsx
├─ Icons
│  ├─ Film (lucide-react)
│  └─ Tv (lucide-react)
│
├─ Components
│  └─ Button (ui)
│
├─ Hooks
│  └─ useNavigate (react-router-dom)
│
└─ Libraries
   └─ framer-motion (animations)

WatchlistLoadingSkeleton.jsx
├─ Components
│  ├─ LoadingState (ui)
│  └─ SkeletonCard (ui)
│
└─ No external dependencies

useWatchlistDisplay.js
├─ React Hooks
│  └─ useMemo
│
└─ Custom Hooks
   ├─ useWatchlist
   └─ useWatchlistFilmData
```

## Responsive Layout

```
Mobile (xs)     Tablet (sm)     Desktop (md)    Large (lg)      XL (xl)         2XL+
─────────       ───────────     ────────────    ──────────      ──────          ────
│ Card │        │ C │ C │       │ C │ C │ C │   │ C │ C │ C │ C │   │ C │ C │ C │ C │ C │
│      │        │   │   │       │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
└──────┘        └───┴───┘       └───┴───┴───┘   └───┴───┴───┴───┘   └───┴───┴───┴───┴───┘
  1 col          2 cols          3 cols          4 cols          5 cols          6 cols
```

## Animation Flow

```
Page Load
  ├─ WatchlistPage: Fade in + Slide up (0.4s)
  │  └─ Title: Fade in (0.4s)
  │
  ├─ WatchlistLoadingSkeleton
  │  └─ Skeleton Cards: Shimmer animation (looping)
  │
  ├─ WatchlistEmptyState
  │  ├─ Container: Fade in + Slide up (0.5s)
  │  ├─ Icon: Scale in (0.2s delay, spring physics)
  │  ├─ Title: Fade in (0.3s delay)
  │  ├─ Description: Fade in (0.4s delay)
  │  └─ Button: Fade in + Slide up (0.5s delay)
  │
  └─ WatchlistGrid
     ├─ Container: Animate on visible state
     ├─ Children: Staggered animation
     │  └─ Each Card: 0.1s delay between items
     └─ On Removal:
        └─ AnimatePresence: Exit animation (card slides out)
```

## Component Responsibility Matrix

| Component | Responsible For |
|-----------|-----------------|
| WatchlistPage.jsx | Orchestration, auth check, error handling, state distribution |
| WatchlistGrid.jsx | Grid layout, card rendering, animation orchestration |
| WatchlistEmptyState.jsx | Empty state UI, visual feedback, discovery navigation |
| WatchlistLoadingSkeleton.jsx | Loading state UI, skeleton card layout |
| useWatchlistDisplay.js | Data fetching, state combination, memoization |

## Performance Optimizations

```
useMemo Hooks
├─ isLoading: Computed from two boolean values
├─ error: Computed from two error objects
├─ isEmpty: Computed from loading state and films array
└─ Benefits: Prevents unnecessary re-renders in child components

AnimatePresence
├─ Exit animations on card removal
├─ Smooth transitions without jarring removals
└─ Better perceived performance

PropTypes Validation
├─ Runtime type checking (dev only)
└─ Catches prop mismatches early
```

## Error Handling Strategy

```
WatchlistPage Error Flow

error Object
  ├─ Check code === 'NETWORK_ERROR'
  │  └─ Display: "Connection Problem"
  │
  ├─ Check response.status === 401
  │  └─ Display: "Authentication Required"
  │
  ├─ Check response.status >= 500
  │  └─ Display: "Server Error"
  │
  └─ Default
     └─ Display: "Something Went Wrong"

ErrorState Component
├─ title: String
├─ message: String
├─ subtitle: String
├─ onRetry: Function (reload page)
└─ showHomeButton: Boolean
```

## Browser Support

- Modern browsers with ES6+ support
- Framer Motion animations (graceful degradation)
- Tailwind CSS responsive utilities
- React 18+ with Hooks API

## Loading States Sequence

```
1. Initial Load
   ├─ isWatchlistLoading: true
   ├─ isFilmsLoading: true
   └─ Display: WatchlistLoadingSkeleton (12 cards)

2. Watchlist Loaded
   ├─ isWatchlistLoading: false
   ├─ isFilmsLoading: true
   └─ Display: WatchlistLoadingSkeleton (still loading films)

3. Films Loaded
   ├─ isWatchlistLoading: false
   ├─ isFilmsLoading: false
   ├─ isLoading: false (combined)
   └─ Display: Content or Empty State

4. Error During Loading
   ├─ watchlistError || filmsError
   └─ Display: ErrorState
```
