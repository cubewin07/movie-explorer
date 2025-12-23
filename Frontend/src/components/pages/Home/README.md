# Home Module

## Overview

The Home component has been refactored from a large monolithic file (274 lines) into a modular structure with separated concerns for better maintainability and reusability.

## New Structure

```
Home/
├── Home.jsx                    (~70 lines)  - Main component
├── FeaturedHeroSection.jsx     (~110 lines) - Featured hero banner
├── HomeLoadingSkeleton.jsx     (~50 lines)  - Loading state UI
├── useHomePageData.js          (~75 lines)  - Data fetching hook
├── useCarouselItems.js         (~35 lines)  - Carousel data hook
├── Section.jsx                 (existing)   - Section component
├── HomeMovieCard.jsx           (existing)   - Movie card component
├── index.js                    (~15 lines)  - Module exports
└── README.md                                - This file
```

**Total: ~350 lines (organized modularly) = Better organization with separation of concerns**

## Component File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| Home.jsx | 70 | Main page component (orchestration & rendering) |
| FeaturedHeroSection.jsx | 110 | Featured hero banner with watchlist action |
| HomeLoadingSkeleton.jsx | 50 | Loading skeleton UI with placeholders |
| useHomePageData.js | 75 | Data fetching for content and genres |
| useCarouselItems.js | 35 | Transforms trending data to carousel items |
| Section.jsx | existing | Reusable section component |
| HomeMovieCard.jsx | existing | Movie card component |
| index.js | 15 | Module exports |

## Hooks

### useHomePageData()
Manages all data fetching and loading states for the home page:
- Fetches featured content, releases, ratings, TV shows, trending, and genres
- Combines multiple loading states into a single `isLoading` flag
- Creates genre map for easy lookup by ID

**Returns:**
```javascript
{
  featuredContent,      // Featured movie/show object
  newReleases,          // Array of new release items
  topRatedMovies,       // Array of top rated movies
  popularTVShows,       // Array of popular TV shows
  trendingData,         // Raw trending API data
  MovieGenres,          // Genre metadata
  genreMap,             // Object mapping genre IDs to names
  isAnyLoading,         // Combined loading state
  isLoading             // Alias for isAnyLoading
}
```

### useCarouselItems(trendingData, genreMap)
Transforms raw API data into structured carousel item format:
- Takes first 8 trending movies
- Maps TMDB poster paths to CDN URLs
- Resolves genre IDs to genre names using genreMap
- Memoizes result for performance

**Returns:**
```javascript
Array<{
  title,       // Movie title
  id,          // TMDB ID
  subtitle,    // Movie tagline
  image,       // Full image URL
  description, // Movie overview
  rating,      // Vote average (1 decimal)
  year,        // Release year
  extra        // Array of genre names
}>
```

## Components

### Home
Main page orchestrator component. Manages:
- Context integration for film modal
- Data fetching via custom hooks
- Loading state rendering
- Section layout and organization

**Key Features:**
- Clean, minimal render logic (~70 lines)
- Delegates complex logic to hooks
- Focuses on composition and layout

### FeaturedHeroSection
Prominent banner at top of home page. Features:
- Large backdrop image with gradient overlay
- Movie title, description, and metadata
- "Watch Now" and "Add to Watchlist" action buttons
- Login prompt modal for unauthenticated users
- Framer Motion animations

**Props:**
```javascript
{
  featuredContent  // Featured movie object or null
}
```

### HomeLoadingSkeleton
Loading UI skeleton matching home page layout:
- Featured hero skeleton
- Trending carousel skeleton
- Three content section skeletons
- Animated shimmer effects

## Usage

### Direct Import
```javascript
import Home from '@/components/pages/Home';
```

### Module Import
```javascript
import { 
  Home, 
  FeaturedHeroSection, 
  useHomePageData 
} from '@/components/pages/Home';
```

### Using Custom Hooks
```javascript
import { useHomePageData, useCarouselItems } from '@/components/pages/Home';

const homeData = useHomePageData();
const carousel = useCarouselItems(homeData.trendingData, homeData.genreMap);
```

## Data Flow

```
Home (main component)
  ├── useHomePageData hook
  │   ├── useFeaturedContent
  │   ├── useNewReleases
  │   ├── useTopRatedMovies
  │   ├── usePopularTVShows
  │   ├── usePaginatedFetch (trending)
  │   └── useMovieGenres
  │
  ├── useCarouselItems hook
  │   └── Transforms trendingData + genreMap
  │
  ├── FeaturedHeroSection (render)
  │   └── Handles watchlist action
  │
  ├── TrendingCarousel (render)
  │   └── Displays carousel items
  │
  └── Section components (×3)
      └── Display releases, ratings, TV shows
```

## Benefits of Refactoring

✅ **Separation of Concerns** - Data fetching, UI components, and transformations are isolated
✅ **Reusability** - Hooks can be used in other components
✅ **Readability** - Main component is cleaner and easier to understand
✅ **Testability** - Each piece can be tested independently
✅ **Maintainability** - Changes are localized to relevant files
✅ **Performance** - Memoization prevents unnecessary recalculations
✅ **Scalability** - Easy to add new hooks or components

## State Management

- **Context API**: Used for film modal state via `FilmModalProvider`
- **Custom Hooks**: Data fetching via TMDB API hooks
- **Local State**: Login modal state in `FeaturedHeroSection`

## API Integration

All data comes from TMDB API via:
- `useFeaturedContent()` - Random featured movie
- `useNewReleases()` - Recently released movies
- `useTopRatedMovies()` - Movies sorted by rating
- `usePopularTVShows()` - Popular TV series
- `usePaginatedFetch()` - Generic paginated endpoint
- `useMovieGenres()` - Available genres with metadata

## Future Improvements

- [ ] Add section filtering by genre
- [ ] Implement personalized recommendations
- [ ] Add "Continue Watching" section
- [ ] Support for custom featured content selection
- [ ] Add sharing functionality for carousel items
- [ ] Implement A/B testing for section layouts
- [ ] Add section collapse/expand functionality
