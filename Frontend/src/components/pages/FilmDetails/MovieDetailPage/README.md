# MovieDetailPage Module

## Overview

The MovieDetailPage has been refactored from a large monolithic file (667 lines) into a modular structure with separated concerns for better maintainability, reusability, and scalability.

## New Structure

```
MovieDetailPage/
├── MovieDetailPage.jsx           (~280 lines) - Main orchestration component
├── MovieInfoSection.jsx          (~140 lines) - Hero section (backdrop, poster, info)
├── MovieCastCrewSection.jsx      (~200 lines) - Cast and crew section (movie-specific)
├── MovieReviewsSection.jsx       (~8 lines)   - Reviews wrapper component
├── useMovieData.js               (~85 lines)  - Data fetching and state management hook
├── index.js                      (~15 lines)  - Module exports
└── README.md                                  - This file
```

**Total: ~728 lines (vs. 667 originally) = Well-organized, modular structure**

## Component Details

### MovieDetailPage.jsx (~280 lines)
Main component that orchestrates data fetching and section rendering.

**Responsibilities:**
- Route parameter handling
- Data fetching via `useMovieData` hook
- Conditional rendering (loading, error states)
- Tab-based navigation
- Modal management for login

**Key Features:**
- Clean orchestration without business logic
- Responsive layout with Tailwind CSS
- Framer Motion animations
- Accessible tab navigation

### MovieInfoSection.jsx (~140 lines)
Displays the hero section with backdrop, poster, and key movie information.

**Props:**
```javascript
{
    movie,                      // Movie object with all details
    genres,                     // Array of genre names
    trailerUrl,                 // YouTube trailer URL
    isLoadingTrailer,           // Loading state for trailer
    isPending,                  // Watchlist mutation pending state
    onAddToWatchlist           // Callback for watchlist button
}
```

**Features:**
- Responsive backdrop image with gradient overlay
- Movie poster with smooth animations
- Rating, runtime, language info
- Genre pills with staggered animations
- Action buttons (Watch Trailer, Add to Watchlist, Share)
- Motion animations for smooth transitions

**Reusability:**
This component is designed to be reusable with TvSeriesDetailPage as the structure is identical.

### MovieCastCrewSection.jsx (~200 lines)
Displays cast and crew information with a **movie-specific crew organization**.

**Props:**
```javascript
{
    isLoadingCredits,           // Loading state
    isErrorCredits,             // Error state
    cast,                       // Array of cast members (first 10)
    crew,                       // Array of crew members
    onCastChange,               // Optional callback
    onCrewChange                // Optional callback
}
```

**Key Differences from TvSeriesDetailPage:**
- **Crew organization by department**: Directing, Production, Writing, Camera
- Shows top 4 departments (movies have different crew structure than TV)
- Maximum 8 crew members per department
- Department-based grouping for better organization

**Cast Section:**
- Grid layout (2-5 columns responsive)
- Profile images with fallback avatars
- Actor name and character display
- Hover animations

**Crew Section (Movie-Specific):**
- Organized by department instead of flat list
- Shows job title for each crew member
- Department cards with consistent styling
- Better highlights key crew roles for films

### MovieReviewsSection.jsx (~8 lines)
Simple wrapper for the Reviews component.

**Props:**
```javascript
{
    filmId      // Film ID to fetch reviews for
}
```

**Purpose:**
- Provides a clean separation between detail page and reviews
- Makes it easy to swap review implementations
- Can be extended with movie-specific review features

### useMovieData.js (~85 lines)
Custom hook managing all data fetching and state for the movie detail page.

**Responsibilities:**
- Fetch movie details, trailer, and credits
- Manage authentication context
- Handle watchlist operations
- Calculate derived data (genres, watchlist data)
- Manage login modal state

**Returns:**
```javascript
{
    // Movie data
    movie,                      // Movie object
    genres,                     // Genre array
    watchlistData,              // Formatted watchlist object
    isLoading,                  // Loading state
    isError,                    // Error state

    // Trailer
    trailerUrl,                 // YouTube URL
    isLoadingTrailer,           // Loading state

    // Credits
    cast,                       // Cast array (sliced to 10)
    crew,                       // Crew array (sliced to 5)
    isLoadingCredits,           // Loading state
    isErrorCredits,             // Error state

    // Watchlist & Auth
    user,                       // Current user object
    addToWatchlist,             // Handler function
    loginSuccess,               // Handler function
    isPending,                  // Mutation pending state
    showLoginModal,             // Modal visibility state
    setShowLoginModal           // Modal state setter
}
```

**Benefits:**
- Centralized data logic
- Easy to test
- Reusable with other components
- Clear separation of concerns

## Usage

### Import Main Component

```javascript
// Option 1: Direct import
import MovieDetailPage from '@/components/pages/FilmDetails/MovieDetailPage/MovieDetailPage';

// Option 2: Via barrel export
import { MovieDetailPage } from '@/components/pages/FilmDetails/MovieDetailPage';

// Option 3: Default export
import MovieDetailPage from '@/components/pages/FilmDetails/MovieDetailPage';
```

### Use Individual Components

```javascript
import {
    MovieInfoSection,
    MovieCastCrewSection,
    MovieReviewsSection,
    useMovieData
} from '@/components/pages/FilmDetails/MovieDetailPage';

// In component
const movieData = useMovieData(movieId);

return (
    <>
        <MovieInfoSection {...movieData} />
        <MovieCastCrewSection cast={movieData.cast} crew={movieData.crew} />
        <MovieReviewsSection filmId={movieId} />
    </>
);
```

## Routing Integration

Update your router to use the new component path:

```javascript
// Old path
import MovieDetailPage from '@/components/pages/FilmDetails/MovieDetailPage.jsx';

// New path (both work if using barrel export)
import MovieDetailPage from '@/components/pages/FilmDetails/MovieDetailPage';
```

## Comparison with TvSeriesDetailPage

| Aspect | Movies | TV Series |
|--------|--------|-----------|
| **Info Section** | Shared structure | Shared structure |
| **Crew Display** | By department | Flat list |
| **Episodes** | N/A | Accordion view |
| **Seasons** | N/A | Season accordion |
| **Details** | Budget, Revenue, ROI | Created by, Status |
| **Cast Limit** | First 10 | First 10 |
| **Crew Limit** | Variable by dept | First 5 |

## File Size Comparison

| Component | Lines | Purpose |
|-----------|-------|---------|
| MovieDetailPage.jsx | 280 | Main orchestration |
| MovieInfoSection.jsx | 140 | Hero section (shared) |
| MovieCastCrewSection.jsx | 200 | Cast & crew (movie-specific) |
| MovieReviewsSection.jsx | 8 | Reviews wrapper |
| useMovieData.js | 85 | Data management |
| index.js | 15 | Exports |
| **Total** | **728** | Modular, maintainable |

## Benefits of Refactoring

✅ **Separation of Concerns** - Each component has single responsibility  
✅ **Reusability** - Components can be used in other pages  
✅ **Movie-Specific Features** - Crew organized by department (unique to movies)  
✅ **Maintainability** - Changes isolated to relevant files  
✅ **Readability** - Main component is ~280 lines (down from 667)  
✅ **Testability** - Smaller units are easier to test  
✅ **Performance** - Better dependency tracking  
✅ **Scalability** - Easy to add features without bloating files  

## Key Distinctions from TV Series

### Crew Section
**Movies:** Organized by department (Directing, Production, Writing, Camera)  
**TV:** Simple list of crew members

```javascript
// Movie crew - by department
<div key="Directing">
  <h3>Directing</h3>
  {directors.map(...)}
</div>

// TV crew - flat list
{crew.map(person => ...)}
```

### Details Tab
**Movies:** Budget, Revenue, ROI calculation, Production Companies  
**TV:** Original language, Country, Status, Created by, Type

### Cast/Crew Limits
**Movies:** Cast 10, Crew varies by department  
**TV:** Cast 10, Crew 5

## Future Enhancements

- [ ] Add similar movies section
- [ ] Implement rating/favorite functionality
- [ ] Add movie recommendations
- [ ] Integrate watchlist sync
- [ ] Add user reviews
- [ ] Support for different quality/version information
- [ ] Box office analytics dashboard
- [ ] Social sharing features
- [ ] Movie comparison tool

## Migration Notes

The old `MovieDetailPage.jsx` file can be safely deleted once routing is updated. All functionality has been preserved and improved with better organization.

### Backward Compatibility
The barrel export (`index.js`) ensures both old and new import paths work:

```javascript
// These all work:
import MovieDetailPage from '@/components/pages/FilmDetails/MovieDetailPage';
import MovieDetailPage from '@/components/pages/FilmDetails/MovieDetailPage/MovieDetailPage';
import { MovieDetailPage } from '@/components/pages/FilmDetails/MovieDetailPage';
```

## Related Components

- **TvSeriesDetailPage** - Similar structure for TV series with series-specific features
- **MovieInfoSection** - Reusable across both movie and TV detail pages
- **Reviews** - Shared reviews component
- **AuthenProvider** - Authentication state management
- **useWatchList** - Watchlist operations hook
