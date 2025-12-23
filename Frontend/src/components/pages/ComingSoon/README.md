# ComingSoon Module

## Overview

The ComingSoon component has been refactored from a large monolithic file (381 lines) into a modular structure with separated concerns for better maintainability, reusability, and testability.

## New Structure

```
ComingSoon/
├── ComingSoon.jsx                  (~225 lines) - Main page component
├── UpcomingFeatureCard.jsx         (~49 lines)  - Reusable feature card component
├── useUpcomingMovies.js            (~28 lines)  - Movies data & genre hook
├── useUpcomingTVSeries.js          (~32 lines)  - TV series data & genre hook
├── upcomingFeaturesConfig.js       (~20 lines)  - Feature data array
├── index.js                        (~10 lines)  - Module exports
└── README.md                                    - This file
```

**Total: ~364 lines (vs. 381 originally) = Better organization + improved reusability**

## Component File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| ComingSoon.jsx | 225 | Main page component (renders sections & manages state) |
| UpcomingFeatureCard.jsx | 49 | Reusable feature card with animation variants |
| useUpcomingMovies.js | 28 | Fetch upcoming movies, genre mapping, filtering |
| useUpcomingTVSeries.js | 32 | Fetch upcoming TV series, genre mapping, filtering |
| upcomingFeaturesConfig.js | 20 | Feature data with icon, title, description, ETA |
| index.js | 10 | Module exports |

## Hooks

### useUpcomingMovies()
Manages upcoming movies data and genre mapping:
- Fetches upcoming movies from TMDB API
- Maps genre IDs to genre names
- Filters movies to show only future releases
- Memoizes expensive calculations

**Returns:**
```javascript
{
  upcomingMovies,        // Array of filtered movie objects
  isLoadingMovies,       // Boolean loading state
  moviesError,           // Error object if request fails
  movieGenreMap          // Object mapping genre IDs to names
}
```

### useUpcomingTVSeries()
Manages upcoming TV series data and genre mapping:
- Fetches upcoming TV series from TMDB API
- Maps genre IDs to genre names
- Filters TV shows to show only future releases
- Memoizes expensive calculations

**Returns:**
```javascript
{
  upcomingTVShows,       // Array of filtered TV series objects
  isLoadingUpcomingTV,   // Boolean loading state
  tvError,               // Error object if request fails
  tvGenreMap             // Object mapping genre IDs to names
}
```

## Components

### ComingSoon (Main Component)
Page-level component that orchestrates:
- Hero section with animated icon
- Upcoming Movies section (grid layout)
- Upcoming TV Shows section (grid layout)
- New Features section with feature cards
- Call-to-action section
- Loading states with skeleton cards
- Error states with ErrorState component

**Features:**
- Responsive grid layout (1-3 columns)
- Framer Motion animations throughout
- Modal integration via FilmModalContext
- Dark mode support

### UpcomingFeatureCard
Reusable card component for displaying upcoming features:
- Animated icon container
- Title and description
- Feature ETA badge
- Hover animations (scale, shadow, background change)
- Dark mode aware hover states

**Props:**
```javascript
{
  feature: {           // Feature object
    icon: JSX,         // React icon element
    title: string,     // Feature name
    description: string, // Feature description
    eta: string        // "Coming [Month] [Year]"
  },
  index: number        // Array index for staggered animation
}
```

## Configuration

### upcomingFeaturesConfig
Array of upcoming platform features:
```javascript
[
  {
    icon: <Users className="w-7 h-7" />,
    title: 'Social Watchlists',
    description: 'Share your watchlist with friends and discover what others are watching.',
    eta: 'Coming July 2025',
  },
  // ... more features
]
```

## Usage

### Import Main Component
```javascript
// Direct import
import ComingSoon from '@/components/pages/ComingSoon/ComingSoon';

// Via module index
import { ComingSoon } from '@/components/pages/ComingSoon';

// Backward compatible
import ComingSoon from '@/components/pages/ComingSoon';
```

### Import Custom Hooks
```javascript
import { useUpcomingMovies, useUpcomingTVSeries } from '@/components/pages/ComingSoon';

// In component
const { upcomingMovies, isLoadingMovies, movieGenreMap } = useUpcomingMovies();
const { upcomingTVShows, isLoadingUpcomingTV, tvGenreMap } = useUpcomingTVSeries();
```

### Import Feature Card Component
```javascript
import { UpcomingFeatureCard } from '@/components/pages/ComingSoon';

// In component
<UpcomingFeatureCard feature={featureData} index={0} />
```

### Import Configuration
```javascript
import { upcomingFeaturesConfig } from '@/components/pages/ComingSoon';

// Use in component
upcomingFeaturesConfig.map((feature, idx) => (
  <UpcomingFeatureCard key={idx} feature={feature} index={idx} />
))
```

## Animation Variants

### Container Variants
```javascript
{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}
```

### Item Variants
```javascript
{
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}
```

### Feature Card Variants
- **Hidden**: opacity 0, y 40
- **Visible**: Staggered animation with spring bounce
- **Hover**: Scale 1.04, y -8, glow shadow, color change (light/dark mode aware)

### Feature Icon Variants
- **Initial**: Scale 1, rotate 0
- **Hover**: Scale 1.15, rotate 10 degrees with spring effect

## Dependencies

### External Libraries
- `react` - Core React library
- `framer-motion` - Animation library
- `lucide-react` - Icon library
- `react-router-dom` - Routing

### Internal Dependencies
- `@/components/ui/button` - Button component
- `@/components/ui/badge` - Badge component
- `@/components/ui/skeletonCard` - Loading skeleton
- `@/components/ui/ErrorState` - Error display
- `@/context/FilmModalProvider` - Modal state management
- `@/hooks/API/data` - usePaginatedFetch hook
- `@/hooks/API/genres` - useMovieGenres, useTvSeriesGenres hooks

## Key Features

✅ **Modular Architecture** - Clear separation of concerns
✅ **Reusable Hooks** - Data fetching logic extracted for reuse
✅ **Reusable Components** - Feature card can be used elsewhere
✅ **Configuration File** - Feature data separated from logic
✅ **Performance** - useMemo for expensive calculations
✅ **Animations** - Smooth, performant Framer Motion animations
✅ **Responsive** - Mobile-first responsive grid
✅ **Dark Mode** - Full dark mode support with tailwind
✅ **Accessibility** - Semantic HTML, proper ARIA attributes
✅ **Error Handling** - Error states and loading fallbacks

## Migration Guide

The ComingSoon component maintains backward compatibility:

**Old import (still works):**
```javascript
import ComingSoon from '@/components/pages/ComingSoon';
```

**New recommended imports:**
```javascript
// Component only
import { ComingSoon } from '@/components/pages/ComingSoon';

// Specific hook
import { useUpcomingMovies } from '@/components/pages/ComingSoon';

// Multiple exports
import { 
  ComingSoon, 
  UpcomingFeatureCard, 
  useUpcomingMovies,
  useUpcomingTVSeries,
  upcomingFeaturesConfig 
} from '@/components/pages/ComingSoon';
```

## Future Improvements

- [ ] Add pagination for movie/TV show lists
- [ ] Implement sorting/filtering options
- [ ] Add wishlist feature
- [ ] Integrate with notification system
- [ ] Add share functionality for features
- [ ] Support for localized ETA dates
- [ ] Custom hook for feature data fetching
- [ ] Analytics tracking for CTAs

## Testing Recommendations

- Test hooks independently with mock API responses
- Test UpcomingFeatureCard with various feature data
- Test ComingSoon page with different loading/error states
- Test responsive grid layout at different breakpoints
- Test dark mode toggle
- Test modal integration with movie clicks
