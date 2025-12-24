# TvSeriesDetailPage Architecture

## Visual Component Structure

```
TvSeriesDetailPage/
│
├── TvSeriesDetailPage.jsx (Main Container - 95 lines)
│   │
│   ├── useSeriesData Hook (Data Management)
│   │   └── Returns: series, isLoading, isError, trailerUrl, cast, crew, etc.
│   │
│   └── Renders:
│       │
│       ├── Backdrop Image Section
│       │   └── Background with gradient overlay
│       │
│       ├── SeriesInfoSection.jsx (120 lines)
│       │   ├── Poster Image
│       │   ├── Title & Metadata
│       │   ├── Rating Display
│       │   ├── Genre Badges
│       │   ├── Overview Description
│       │   └── Action Buttons
│       │       ├── Watch Trailer
│       │       ├── Add to Watchlist
│       │       └── Share
│       │
│       └── Tabs Container
│           │
│           ├── Overview Tab
│           │   └── SeriesStatsSection.jsx (180 lines)
│           │       ├── Story Section
│           │       ├── Quick Stats Cards (4 columns)
│           │       │   ├── Rating
│           │       │   ├── Seasons Count
│           │       │   ├── Episodes Count
│           │       │   └── Status Badge
│           │       ├── Genres List
│           │       ├── Networks Section
│           │       └── Production Companies Section
│           │
│           ├── Episodes Tab
│           │   └── SeasonsSection.jsx (20 lines)
│           │       └── SeasonAccordion List
│           │
│           ├── Cast Tab
│           │   └── CastCrewSection.jsx (100 lines - Cast only)
│           │       ├── Cast Grid (5 columns)
│           │       ├── Loading State
│           │       └── Error State
│           │
│           ├── Crew Tab
│           │   └── CastCrewSection.jsx (100 lines - Crew only)
│           │       ├── Crew Grid (5 columns)
│           │       ├── Loading State
│           │       └── Error State
│           │
│           ├── Reviews Tab
│           │   └── SeriesReviewsSection.jsx (5 lines)
│           │       └── Reviews Component (Imported)
│           │
│           ├── Details Tab
│           │   └── DetailsSection.jsx (180 lines)
│           │       ├── Language & Country Cards
│           │       ├── Runtime & Air Dates Cards
│           │       ├── Popularity & Vote Count Cards
│           │       └── Creator Information
│           │
│           └── Similar Tab
│               └── Placeholder
```

## File Structure

```
src/components/pages/FilmDetails/
├── TvSeriesDetailPage.jsx (Re-export file)
│
└── TvSeriesDetailPage/
    ├── TvSeriesDetailPage.jsx (Main component)
    ├── SeriesInfoSection.jsx
    ├── SeriesStatsSection.jsx
    ├── CastCrewSection.jsx
    ├── SeasonsSection.jsx
    ├── SeriesReviewsSection.jsx
    ├── DetailsSection.jsx
    └── README.md (this file)

src/hooks/API/
├── useSeriesData.js (New hook)
└── data.js (Existing hooks)
```

## Component Breakdown

| Component | Lines | Purpose | Props |
|-----------|-------|---------|-------|
| **TvSeriesDetailPage** | 95 | Main orchestrator | Uses useSeriesData hook |
| **SeriesInfoSection** | 120 | Hero section + info | series, trailerUrl, onAddToWatchlist |
| **SeriesStatsSection** | 180 | Overview tab content | series |
| **CastCrewSection** | 100 | Cast & crew grids | cast, crew, isLoading, isError |
| **SeasonsSection** | 20 | Episodes accordion | seasons, openSeason, onToggleSeason |
| **SeriesReviewsSection** | 5 | Reviews wrapper | filmId |
| **DetailsSection** | 180 | Details tab content | series |

## Hook: useSeriesData

**Location:** `src/hooks/API/useSeriesData.js`

**Returns:**
```javascript
{
  series,                    // TV series data object
  isLoading,                 // Loading state
  isError,                   // Error state
  trailerUrl,               // Video URL
  isLoadingTrailer,         // Trailer loading state
  credits,                  // Cast & crew data
  isLoadingCredits,         // Credits loading state
  isErrorCredits,           // Credits error state
  cast,                     // Array of cast (max 10)
  crew,                     // Array of crew (max 5)
  genres,                   // Array of genre names
  watchlistData             // Formatted data for watchlist
}
```

## Data Flow

1. **TvSeriesDetailPage.jsx** fetches `id` from URL params
2. Calls **useSeriesData(id)** to get all series data
3. Manages state for:
   - `showLoginModal` - Authentication modal
   - `openSeason` - Currently expanded season
4. Passes data to section components via props
5. Handles watchlist mutations and login flow

## Key Features

✅ **Single Responsibility** - Each component has one clear purpose  
✅ **Reusable Sections** - Components can be used independently  
✅ **Centralized Data** - useSeriesData hook manages all API calls  
✅ **Clean Separation** - UI logic separated from data logic  
✅ **Responsive Design** - Grid layouts adapt to screen sizes  
✅ **Error Handling** - Graceful error states in each section  
✅ **Loading States** - Skeleton/loading states for better UX  

## Integration Notes

- **Authentication:** Uses AuthenProvider context for user data
- **Watchlist:** Integrates useAddToWatchlist hook for mutations
- **Reviews:** Uses existing Reviews component (no modifications)
- **Routes:** Re-exported from TvSeriesDetailPage.jsx for backward compatibility
- **Styling:** Uses Tailwind CSS with framer-motion for animations

## Future Enhancements

- Extract DetailsSection data display components
- Implement "Similar Shows" functionality
- Add season/episode filtering options
- Create episode detail modal
- Add share functionality
