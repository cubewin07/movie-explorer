# Follow-up Plan: Recommendation UX Polish

## Context

The Similar Titles source has already been switched to TMDB through `useTmdbRecommendations`, and movie/TV detail hooks are already using it.

The current hook query key is acceptable as-is:

```js
queryKey: ['tmdbRecommendations', normalizedFilmId, type]
```

No query key change is necessary. It is readable, source-specific, and avoids collision with the existing backend `useSimilarRecommendations` cache.

The bigger UX concern is expectation management: when a user adds a film to their watchlist, the Similar tab for the current film will not change because it now comes from TMDB's title-to-title recommendation endpoint. That endpoint is based on TMDB's catalog data, not the user's personal watchlist. If the UI does not explain this, users may expect recommendations to refresh after adding a film and feel like the app ignored their action.

## Current status

Already done:

- `src/hooks/API/recommendations.js` imports `axiosInstance` from `@/lib/axiosInstance`.
- `useTmdbRecommendations` calls:
  - `/movie/{filmId}/recommendations`
  - `/tv/{filmId}/recommendations`
- It passes `{ language: 'en-US' }`.
- It returns `data.results` as `similarItems`.
- `src/components/pages/FilmDetails/MovieDetailPage/useMovieData.js` uses `useTmdbRecommendations(movieId, 'MOVIE')`.
- `src/components/pages/FilmDetails/TvSeriesDetailPage/useSeriesData.js` uses `useTmdbRecommendations(id, 'SERIES')`.
- `SimilarTitlesSection.jsx` already handles TMDB fields like `id`, `title`, `name`, `poster_path`, `backdrop_path`, `vote_average`, `release_date`, and `first_air_date`.

## UX problem to solve

### What happens now

- User opens a movie or TV detail page.
- The Similar tab shows TMDB recommendations for that exact title.
- User adds the title to their watchlist.
- The Similar tab stays the same.

### Why this can feel worse

This behavior is technically correct, but it can feel stale if the UI implies that all recommendation surfaces are personalized. Users may think:

- "I added this film, why did recommendations not update?"
- "Is the recommendation system broken?"
- "Did my watchlist action not work?"

The app should separate two recommendation concepts clearly:

1. **Similar titles** — catalog-based, from TMDB, tied to the current title.
2. **For you / member recommendations** — personalized, from the backend, influenced by user data.

## Recommended follow-up changes

### 1. Rename the Similar tab label/copy to set expectations

Files:

- `src/components/pages/FilmDetails/MovieDetailPage/MovieDetailPage.jsx`
- `src/components/pages/FilmDetails/TvSeriesDetailPage/TvSeriesDetailPage.jsx`
- `src/components/pages/FilmDetails/SimilarTitlesSection.jsx`

Recommended UI language:

- Tab label: keep `Similar` if space is tight, or change to `More like this` for clearer UX.
- Section eyebrow/copy inside the Similar tab: add a small note above the grid:

```txt
More like this
Title-based picks from TMDB. Your watchlist shapes recommendations on the home page.
```

Why:

- Makes it clear this section is title-based, not personalized.
- Prevents confusion after adding a film.
- Points users to where personalized recommendations live.

### 2. Add post-watchlist feedback that directs users to personalized recommendations

Files:

- `src/components/pages/FilmDetails/MovieDetailPage/useMovieData.js`
- Related movie detail page UI/toast mechanism if one already exists.
- TV equivalent only if TV watchlist add uses the same interaction pattern.

Recommended behavior after a successful add:

```txt
Added to watchlist. Your home recommendations will update from your saved titles.
```

If there is an existing toast system, reuse it. Do not add a new notification library.

Why:

- Confirms the action worked.
- Explains where the effect will appear.
- Avoids users expecting the current Similar tab to mutate.

### 3. Improve Similar tab empty/error copy for TMDB source

File:

- `src/components/pages/FilmDetails/SimilarTitlesSection.jsx`

Current examples:

- Error: `Temporary Signal Loss`
- Empty description: `Check back soon as new recommendations are synced.`
- Auth/member copy exists but is not currently passed by movie/TV detail pages.

Recommended copy changes:

- Error title: `Recommendations unavailable`
- Error description: `TMDB could not return recommendations for this title right now. Try again in a moment.`
- Empty title: `No recommendations yet`
- Empty description: `TMDB does not have recommendations for this title yet. Try another movie or series.`

Why:

- More accurate now that the source is TMDB, not the backend recommender.
- Avoids implying the app is syncing a recommendation library.
- Keeps the UI honest and easier to debug.

### 4. Visually distinguish catalog recommendations from personalized recommendations

Files:

- `src/components/pages/FilmDetails/SimilarTitlesSection.jsx`
- `src/components/pages/Home/MemberRecommendationsSection.jsx`

Design direction:

- Similar tab should feel like a **catalog reel**:
  - label: `TMDB picks`
  - restrained neutral chip
  - copy focused on the current title: `Because you are viewing this title`
- Home/member recommendations should feel like a **personal queue**:
  - label: `For you`
  - stronger personalized chip
  - copy focused on the user's watchlist/profile: `Based on your saved titles`

Why:

- Users can understand why each recommendation exists.
- The app avoids mixing algorithmic/personalized language with static title-based recommendations.
- It makes the UX feel intentional instead of inconsistent.

### 5. Optional: Add a small link from Similar tab to Home recommendations

File:

- `src/components/pages/FilmDetails/SimilarTitlesSection.jsx`

Suggested small CTA beneath the explanatory copy:

```txt
Want picks based on your watchlist? View your recommendations
```

Route target should use the existing home route if available.

Why:

- Gives users a next step after adding a film.
- Helps them discover the personalized recommendation surface.
- Avoids making the Similar tab responsible for personalization it cannot provide.

Keep this optional unless the route and layout make the CTA simple.

## What not to change

- Do not change the current `useTmdbRecommendations` query key unless there is a real cache bug.
- Do not refetch TMDB Similar recommendations after adding to watchlist; it will return the same title-based data and create misleading loading states.
- Do not make Similar Titles depend on backend member recommendation state.
- Do not change `src/lib/axiosInstance.js`.
- Do not change backend files.

## Verification from this frontend root

Run from `Frontend/`:

```bash
yarn lint
yarn build
```

Optional manual check:

```bash
yarn dev
```

Then verify:

1. Movie detail Similar tab still requests `/movie/{id}/recommendations?language=en-US`.
2. TV detail Similar tab still requests `/tv/{id}/recommendations?language=en-US`.
3. Adding a title to the watchlist does not misleadingly refetch or reshuffle the Similar tab.
4. The UI explains that Similar titles are title-based/TMDB-based.
5. The watchlist success feedback, if implemented, tells users that home recommendations are where personalization updates.
6. Member recommendations on the home page still use the backend and remain the personalized recommendation surface.
