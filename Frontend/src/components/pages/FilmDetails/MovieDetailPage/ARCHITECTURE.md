# MovieDetailPage Refactoring - Architecture Diagram

## Module Organization

```
MovieDetailPage/
│
├── 📄 MovieDetailPage.jsx (280 lines)
│   ├── Imports all sections
│   ├── Fetches data via useMovieData
│   ├── Manages routing & state
│   └── Orchestrates component rendering
│
├── 📄 MovieInfoSection.jsx (140 lines)
│   ├── Backdrop image with gradient
│   ├── Movie poster
│   ├── Title, rating, metadata
│   ├── Genre pills
│   ├── Action buttons
│   └── [REUSABLE] Can be shared with TV Series
│
├── 📄 MovieCastCrewSection.jsx (200 lines)
│   ├── Cast grid display (10 items)
│   └── Crew by department (MOVIE-SPECIFIC)
│       ├── Directing
│       ├── Production
│       ├── Writing
│       └── Camera
│
├── 📄 MovieReviewsSection.jsx (8 lines)
│   └── Wrapper for Reviews component
│
├── 🪝 useMovieData.js (85 lines)
│   ├── Fetch movie details
│   ├── Fetch trailer & credits
│   ├── Manage authentication
│   ├── Handle watchlist operations
│   └── [REUSABLE] Can be used by other components
│
├── 📦 index.js (15 lines)
│   ├── Export MovieDetailPage
│   ├── Export MovieInfoSection
│   ├── Export MovieCastCrewSection
│   ├── Export MovieReviewsSection
│   └── Export useMovieData
│
└── 📖 README.md
    └── Complete module documentation
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     MovieDetailPage.jsx                      │
│                  (Main Orchestration Component)              │
└────────────┬──────────────────────────┬─────────────────────┘
             │                          │
             ▼                          ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  useMovieData()  │      │  useParams()     │
    │  (Data Hook)     │      │  (Router Hook)   │
    │                  │      │                  │
    │ Returns:         │      │ Gets: movieId    │
    │ • movie          │      └──────────────────┘
    │ • genres         │
    │ • cast           │
    │ • crew           │
    │ • trailerUrl     │
    │ • handlers       │
    └────────┬─────────┘
             │
      ┌──────┴───────────────────────────────┐
      │                                       │
      ▼                                       ▼
┌─────────────────────┐            ┌──────────────────────┐
│ MovieInfoSection    │            │ Overview Tab         │
│ (Hero Section)      │            │ • Story              │
│                     │            │ • Quick Stats        │
│ Props:              │            │ • Genres             │
│ • movie             │            └──────────────────────┘
│ • genres            │                      │
│ • trailerUrl        │                      └──► StatCard (4x)
│ • onAddToWatchlist  │
│ • isPending         │
│                     │
│ Displays:           │
│ • Backdrop          │
│ • Poster            │
│ • Title & Rating    │
│ • Buttons           │
└─────────────────────┘

      ▼
┌────────────────────────┐
│ Tabs Navigation        │
└────────┬───────────────┘
         │
    ┌────┴───┬────────┬────────┬────────┐
    │         │        │        │        │
    ▼         ▼        ▼        ▼        ▼
Overview   Cast    Crew    Reviews   Details
    │       │       │        │        │
    └─►StatCard   ┌─────────────────────────┐
              │   │ MovieCastCrewSection    │
              │   │                         │
              │   │ Props:                  │
              │   │ • cast (10 items)       │
              │   │ • crew (by department)  │
              │   │ • isLoadingCredits      │
              │   │ • isErrorCredits        │
              │   │                         │
              │   │ Movie-Specific:         │
              │   │ • Crew by department    │
              │   │ • Shows job titles      │
              │   └─────────────────────────┘
              │
              └──► MovieReviewsSection
                   (Reviews wrapper)
                   │
                   └──► Reviews Component
```

## State Management

```
┌────────────────────────────────────────┐
│       useMovieData Hook                │
│  (Centralized State Management)        │
├────────────────────────────────────────┤
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ API Data (from hooks)            │  │
│ │ • useMovieDetails(id)            │  │
│ │ • useMovieTrailer(id)            │  │
│ │ • useMovieCredits(id)            │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ Context Data (from providers)    │  │
│ │ • useAuthen() -> user, token     │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ Mutations (from hooks)           │  │
│ │ • useAddToWatchlist(token)       │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ Derived Data                     │  │
│ │ • genres (from movie)            │  │
│ │ • watchlistData (calculated)     │  │
│ │ • cast (sliced)                  │  │
│ │ • crew (sliced)                  │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ Local State                      │  │
│ │ • showLoginModal                 │  │
│ └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
         │
         │ Returns all data + handlers
         │
         ▼
   MovieDetailPage
      (uses it)
```

## Component Hierarchy

```
MovieDetailPage
│
├── (Conditional) Loading State
│   └── FancyLoader
│
├── (Conditional) Error State
│   └── ErrorState
│
├── Hero Section
│   └── MovieInfoSection
│       ├── Motion backdrop
│       ├── Motion poster
│       └── Action buttons
│
├── Tabs Container
│   │
│   ├── Overview Tab
│   │   ├── Story card
│   │   ├── StatCard (x4)
│   │   └── Genres
│   │
│   ├── Cast Tab
│   │   └── MovieCastCrewSection
│   │       └── Cast list (grid)
│   │
│   ├── Crew Tab
│   │   └── MovieCastCrewSection
│   │       └── Crew by Department
│   │           ├── Department 1
│   │           │   └── Crew members
│   │           ├── Department 2
│   │           │   └── Crew members
│   │           └── ...
│   │
│   ├── Reviews Tab
│   │   └── MovieReviewsSection
│   │       └── Reviews component
│   │
│   ├── Details Tab
│   │   ├── Financial cards (Budget, Revenue)
│   │   ├── Info cards (Language, Release)
│   │   ├── Profit Analysis
│   │   └── Production Companies
│   │
│   └── Similar Tab
│       └── Coming soon placeholder
│
└── Login Modal (conditional)
    └── LoginNotificationModal
```

## Movie vs TV Series Crew Display

### Movie (Department-Based)
```
DIRECTING
├── John Smith (Director)
├── Jane Doe (Director)
└── ...

PRODUCTION
├── Producer 1
├── Producer 2
└── ...

WRITING
├── Writer 1
├── Writer 2
└── ...

CAMERA
├── Director of Photography
├── Cinematographer
└── ...
```

### TV Series (Flat List)
```
CREW
├── Person 1 (Job)
├── Person 2 (Job)
├── Person 3 (Job)
├── Person 4 (Job)
└── Person 5 (Job)
```

## File Size Comparison

```
Before Refactoring:
┌──────────────────────────────┐
│  MovieDetailPage.jsx         │
│  ███████████████████████ 667 │
└──────────────────────────────┘

After Refactoring:
┌──────────────────────────────────────┐
│  MovieDetailPage.jsx    ███ 280       │
│  MovieInfoSection.jsx   ██ 140        │
│  MovieCastCrewSection.jsx ███ 200     │
│  useMovieData.js        █ 85          │
│  MovieReviewsSection.jsx  8           │
│  index.js               █ 15          │
│  Total Components: 728 lines (better organized)
└──────────────────────────────────────┘
```

## Reusability Matrix

```
Component               │ Movie │ TV Series │ Other Pages │
─────────────────────────┼───────┼───────────┼─────────────┤
MovieInfoSection        │  ✅   │    ✅     │     ✅      │
MovieCastCrewSection    │  ✅   │    ❌     │     ✅      │
MovieReviewsSection     │  ✅   │    ✅     │     ✅      │
useMovieData           │  ✅   │    ❌     │     ✅      │
─────────────────────────┴───────┴───────────┴─────────────┘

Legend:
✅ = Can be reused
❌ = Media-type specific (but similar patterns available)
```

## Import Resolution

```
Node Module Resolution:
─────────────────────────────────────────────

import from '../pages/FilmDetails/MovieDetailPage'
        │
        ├─► src/components/pages/FilmDetails/MovieDetailPage/
        │   └─► index.js (barrel export)
        │       └─► exports MovieDetailPage.jsx
        │
        └─► RESOLVED ✓

Also works:
─────────────────────────────────────────────

import { MovieInfoSection } from '@/components/pages/FilmDetails/MovieDetailPage'
        │
        ├─► Resolves to index.js
        │   └─► exports MovieInfoSection from MovieInfoSection.jsx
        │
        └─► RESOLVED ✓

import useMovieData from '@/components/pages/FilmDetails/MovieDetailPage/useMovieData'
        │
        ├─► Resolves directly to useMovieData.js
        │
        └─► RESOLVED ✓
```

## Next Steps for Enhancement

```
Current Structure
        │
        ├─► Add More Departments to Crew View
        │   └─► Filter by department type
        │
        ├─► Add Crew Member Details Modal
        │   └─► Show filmography, bio, etc.
        │
        ├─► Add Similar Movies Section
        │   └─► Recommendations based on genre/rating
        │
        ├─► Add User Reviews Section
        │   └─► User-submitted ratings
        │
        └─► Add Movie Comparison Tool
            └─► Compare with other movies
```
