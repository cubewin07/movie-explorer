# TvSeriesDetailPage Component

Refactored TV series detail page with modular section components and centralized data management.

## Overview

The TvSeriesDetailPage has been refactored from a monolithic 799-line component into a clean, modular architecture with dedicated section components and a custom hook for data management.

**Original:** 799 lines in single file  
**Refactored:** 
- Main component: 95 lines
- 6 specialized section components: ~720 lines total
- Custom data hook: 30 lines

## Quick Start

### Basic Usage

The component is still imported the same way:

```javascript
import TvSeriesDetailPage from '@/components/pages/FilmDetails/TvSeriesDetailPage';

// Used in routes
<Route path="/series/:id" element={<TvSeriesDetailPage />} />
```

### Data Hook

Use the custom hook for TV series data:

```javascript
import { useSeriesData } from '@/hooks/API/useSeriesData';

function MyComponent({ seriesId }) {
  const {
    series,
    isLoading,
    cast,
    crew,
    trailerUrl
  } = useSeriesData(seriesId);

  // ... component logic
}
```

## Component Breakdown

### TvSeriesDetailPage.jsx
**Purpose:** Main orchestrator component  
**Responsibilities:**
- Fetch series data via useSeriesData hook
- Manage modal and accordion states
- Handle watchlist mutations
- Render section components and tabs

### SeriesInfoSection.jsx
**Purpose:** Hero section with series information  
**Displays:**
- Poster image
- Title, air dates, season/episode counts
- Rating and genres
- Overview description
- Action buttons (Watch Trailer, Add to Watchlist, Share)

**Props:**
```javascript
{
  series,              // Series data object
  trailerUrl,         // Video URL
  isLoadingTrailer,   // Loading state
  onAddToWatchlist,   // Click handler
  onWatchlistPending  // Button disabled state
}
```

### SeriesStatsSection.jsx
**Purpose:** Overview tab content with statistics  
**Displays:**
- Story section with overview
- Quick stats cards (Rating, Seasons, Episodes, Status)
- Genres list
- Networks and production companies

**Props:**
```javascript
{ series }  // Series data object
```

### CastCrewSection.jsx
**Purpose:** Cast and crew grid display  
**Displays:**
- Cast or crew grid (5 columns)
- Profile images or default avatars
- Names and character/job titles
- Loading and error states

**Props:**
```javascript
{
  cast,                // Array of cast members
  crew,                // Array of crew members
  isLoadingCredits,    // Loading state
  isErrorCredits       // Error state
}
```

**Usage in Tabs:**
```javascript
// Cast tab
<CastCrewSection cast={cast} crew={[]} {...} />

// Crew tab
<CastCrewSection cast={[]} crew={crew} {...} />
```

### SeasonsSection.jsx
**Purpose:** Season list with accordion expansion  
**Displays:**
- Expandable season accordions
- Episodes within each season

**Props:**
```javascript
{
  seasons,          // Array of season objects
  tvId,            // TV series ID
  openSeason,      // Currently open season number
  onToggleSeason   // Toggle handler function
}
```

### SeriesReviewsSection.jsx
**Purpose:** Wrapper for reviews component  
**Displays:**
- Reviews for the series (using existing Reviews component)
- No modifications to review functionality

**Props:**
```javascript
{ filmId }  // Series ID number
```

### DetailsSection.jsx
**Purpose:** Details tab with series metadata  
**Displays:**
- Language and country information
- Runtime and air dates
- Popularity and vote count
- Creator information

**Props:**
```javascript
{ series }  // Series data object
```

## useSeriesData Hook

**Location:** `in the same folder`

Custom hook that aggregates data from multiple API endpoints and provides formatted data for the page.

**Returns:**
```javascript
{
  // Core series data
  series,                // TV series object
  isLoading,            // Data loading state
  isError,              // Error occurred

  // Trailer data
  trailerUrl,           // Video URL for trailer
  isLoadingTrailer,     // Trailer loading state

  // Credits data
  credits,              // Raw credits object
  isLoadingCredits,     // Credits loading state
  isErrorCredits,       // Credits error occurred

  // Processed data
  cast,                 // First 10 cast members
  crew,                 // First 5 crew members
  genres,               // Genre names array
  watchlistData         // Formatted watchlist object
}
```

## Styling

All components use:
- **Tailwind CSS** for responsive design
- **Framer Motion** for smooth animations
- **Dark mode support** via `dark:` classes
- **Gradient backgrounds** for visual appeal

## State Management

### Component State
```javascript
const [showLoginModal, setShowLoginModal] = useState(false);
const [openSeason, setOpenSeason] = useState(null);
```

### Context
- `AuthenProvider` - User authentication status
- Watchlist mutation via `useAddToWatchlist` hook

## Key Features

✅ **Modular Architecture** - Each section is independent  
✅ **Reusable Components** - Sections can be used elsewhere  
✅ **Centralized Data Fetching** - Single source of truth via hook  
✅ **Type Safety Ready** - Props clearly documented  
✅ **Responsive Design** - Works on all screen sizes  
✅ **Dark Mode Support** - Full theme compatibility  
✅ **Error Handling** - Graceful error states  
✅ **Loading States** - Skeleton loaders and spinners  

## Testing Considerations

- Mock useSeriesData hook for unit tests
- Test each section component independently
- Mock API endpoints in integration tests
- Test modal and accordion state management
- Verify watchlist mutations work correctly

## Performance

- Lazy loading of images
- Memoization can be added if needed
- Framer Motion animations are GPU-accelerated
- No unnecessary re-renders due to prop isolation

## Future Improvements

- [ ] Extract card components for reusability
- [ ] Add pagination for large cast/crew lists
- [ ] Implement "Similar Shows" feature
- [ ] Add season/episode filtering
- [ ] Create episode detail modal
- [ ] Add share functionality
- [ ] TypeScript migration

## Migration Guide

### From Old Component
The old monolithic TvSeriesDetailPage.jsx has been replaced with:
1. **Main component** - Same functionality, cleaner code
2. **Section components** - New, reusable components
3. **Data hook** - Replaces inline data fetching

**No breaking changes** - The component is imported the same way and maintains backward compatibility through the re-export at `TvSeriesDetailPage.jsx`.

## Debugging

### Check if data is loading
```javascript
const { isLoading, isError, series } = useSeriesData(id);

if (isLoading) console.log('Fetching series data...');
if (isError) console.log('Error loading series');
if (series) console.log('Series loaded:', series);
```

### Console logs in development
Each section component can be enhanced with logging:
```javascript
useEffect(() => {
  console.log('SeriesInfoSection mounted with props:', { series, trailerUrl });
}, [series, trailerUrl]);
```

## Support

For questions about the refactored structure, refer to [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed diagrams and component relationships.
