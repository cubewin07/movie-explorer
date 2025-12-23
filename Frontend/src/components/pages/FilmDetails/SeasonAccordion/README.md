# SeasonAccordion Module

## Overview

The SeasonAccordion component has been refactored from a monolithic file (231 lines) into a modular structure with separated concerns for better maintainability, reusability, and testability.

## New Structure

```
SeasonAccordion/
├── SeasonAccordion.jsx         (~60 lines)  - Main component orchestrating season UI
├── EpisodeCard.jsx             (~110 lines) - Reusable episode card component
├── EpisodeSkeleton.jsx         (~12 lines)  - Loading skeleton for episodes
├── episodeUtils.js             (~130 lines) - Utility functions for episode handling
├── index.js                    (~4 lines)   - Module exports
└── README.md                                - This file
```

**Total: ~316 lines (vs. 231 originally) = Better organized with extracted utilities**

## Component File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| SeasonAccordion.jsx | 60 | Main component (accordion header, state management) |
| EpisodeCard.jsx | 110 | Episode card with status indicators and interactions |
| EpisodeSkeleton.jsx | 12 | Loading skeleton with animation |
| episodeUtils.js | 130 | Helper functions for episode data & styling |
| index.js | 4 | Module exports |

## Components

### SeasonAccordion
Main component that orchestrates the season accordion UI.

**Props:**
- `tvId` (number) - TV series ID from TMDB
- `seasonNumber` (number) - Season number to fetch
- `season` (object) - Season data with `season_number` and `air_date`
- `open` (boolean) - Accordion open/closed state
- `onToggle` (function) - Callback when accordion is toggled

**Features:**
- Accordion header with season info
- Lazy loads episodes when opened
- Animated loading skeleton
- Grid layout for episodes (2 columns on medium+ screens)
- Episode modal integration

### EpisodeCard
Reusable episode card component displaying episode details.

**Props:**
- `episode` (object) - Episode data from TMDB
- `index` (number) - Episode index for staggered animation
- `isClickable` (boolean) - Whether card can be clicked
- `onEpisodeClick` (function) - Callback when episode is selected

**Features:**
- Dynamic styling based on episode status (missing, future, available)
- Status badges (Coming Soon, Airs Soon, Available)
- Star rating display
- Episode metadata (air date, runtime)
- Hover effects and animations
- Tooltip for unreleased episodes
- Play icon overlay on available episodes

**Episode Statuses:**
- **Missing**: No image available (amber styling)
- **Future**: Episode hasn't aired yet (indigo styling)
- **Available**: Episode released and viewable (slate styling)

### EpisodeSkeleton
Loading skeleton component with staggered animation.

**Props:**
- `index` (number) - Skeleton index for animation delay

## Utility Functions (episodeUtils.js)

### Date & Status Checks
- `isFutureDate(dateStr)` - Check if episode air date is in the future
- `isImageMissing(episode)` - Check if episode image is missing
- `getEpisodeStatus(episode)` - Get episode status type ('missing', 'future', 'available')

### Styling Helpers
- `getEpisodeCardStyles(episode)` - Get border, background, and shadow classes
- `getDateTimeTextClass(episode)` - Get text color classes for metadata
- `getEpisodeBadgeConfig(episode)` - Get badge icon, label, and styling

### Data Formatting
- `getEpisodeImageUrl(stillPath)` - Build TMDB image URL
- `formatEpisodeName(episode)` - Format episode display name with number
- `getEpisodeOverview(overview)` - Get overview or fallback message

## Usage

### Import Main Component
```javascript
import { SeasonAccordion } from '@/components/pages/FilmDetails/SeasonAccordion';

// Or direct import
import SeasonAccordion from '@/components/pages/FilmDetails/SeasonAccordion/SeasonAccordion';
```

### Import Utilities
```javascript
import { 
  isFutureDate,
  isImageMissing,
  getEpisodeStatus,
  getEpisodeCardStyles 
} from '@/components/pages/FilmDetails/SeasonAccordion';
```

### Basic Usage
```javascript
const [openSeason, setOpenSeason] = useState(null);

<SeasonAccordion
  tvId={123}
  seasonNumber={1}
  season={{ season_number: 1, air_date: '2020-01-15' }}
  open={openSeason === 1}
  onToggle={() => setOpenSeason(openSeason === 1 ? null : 1)}
/>
```

## Benefits of Refactoring

✅ **Separation of Concerns** - Each component has a single responsibility
✅ **Reusability** - EpisodeCard and utilities can be used elsewhere
✅ **Testability** - Smaller components easier to unit test
✅ **Maintainability** - Changes isolated to relevant files
✅ **Readability** - Main component is lean and clear (60 lines)
✅ **Styling Logic** - Centralized in episodeUtils for consistency
✅ **Scalability** - Easy to add new features (e.g., episode actions)

## Migration Guide

Update imports in parent component:

```javascript
// Old
import SeasonAccordion from '@/components/pages/FilmDetails/SeasonAccordion';

// New (both work, but prefer new for clarity)
import { SeasonAccordion } from '@/components/pages/FilmDetails/SeasonAccordion';
```

## Future Improvements

- [ ] Episode reactions/ratings
- [ ] Watch/unwatched tracking
- [ ] Episode search/filter within season
- [ ] Episode sharing functionality
- [ ] Streaming platform availability indicators
- [ ] Episode comments/notes
- [ ] Episode comparison views
