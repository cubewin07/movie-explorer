# Plan: Switch Similar Titles to TMDB Recommendations

## Context

The frontend currently sources detail-page similar titles from the backend recommendation endpoint through `useSimilarRecommendations`. The requested change is to keep backend recommendation hooks intact, add a new TMDB-backed hook, and switch only movie/TV detail pages to use TMDB's native recommendations endpoint.

This should make the existing Similar tab work from TMDB directly without changing `SimilarTitlesSection.jsx`, `axiosInstance.js`, or any backend files.

Important path finding: the actual project path is lowercase `src/hooks/API/recommendations.js`, not `src/Hooks/API/recommendations.js`.

Loaded skills/instructions: `tooling/skills/REGISTRY.md`, `shared/karpathy-coding-principles.md`, `frontend-design`, Serena coding instructions, and mem0 context loader.

## Files to modify

### 1. `src/hooks/API/recommendations.js`

- Add `import axiosInstance from '@/lib/axiosInstance';` alongside the existing backend `instance` import.
- Keep existing exports:
  - `useSimilarRecommendations`
  - `useMemberRecommendations`
- Add a new exported hook: `useTmdbRecommendations(filmId, type, enabled = true)`.
- Reuse the same React Query shape and options style as `useSimilarRecommendations`:
  - normalize `filmId` to a number
  - keep an `enabled` guard requiring a valid id and external `enabled`
  - use `signal` in the query function
  - keep the same stale time/options behavior as the existing hook
- Build the TMDB path from the type:
  - `MOVIE` / `movie` → `/movie/${filmId}/recommendations`
  - `SERIES` / `TV` / `tv` → `/tv/${filmId}/recommendations`
- Call TMDB with params `{ language: 'en-US' }`.
- Return `data.results` as an array, falling back to `[]`.
- Preserve the caller-facing return shape:

```js
{
  similarItems,
  isLoadingSimilar,
  isErrorSimilar,
}
```

### 2. `src/components/pages/FilmDetails/MovieDetailPage/useMovieData.js`

- Change the recommendation import from `useSimilarRecommendations` to `useTmdbRecommendations`.
- Replace `useSimilarRecommendations(movieId, 'MOVIE')` with `useTmdbRecommendations(movieId, 'MOVIE')`.
- Keep destructured names unchanged:
  - `similarItems`
  - `isLoadingSimilar`
  - `isErrorSimilar`

### 3. `src/components/pages/FilmDetails/TvSeriesDetailPage/useSeriesData.js`

- Change the recommendation import from `useSimilarRecommendations` to `useTmdbRecommendations`.
- Replace `useSimilarRecommendations(id, 'SERIES')` with `useTmdbRecommendations(id, 'SERIES')`.
- Keep destructured names unchanged:
  - `similarItems`
  - `isLoadingSimilar`
  - `isErrorSimilar`

## Files intentionally not changed

- `src/components/pages/FilmDetails/SimilarTitlesSection.jsx`
- `src/lib/axiosInstance.js`
- Any backend files
- Member recommendations UI/source

## Verification from this frontend root

Run these from `Frontend/`:

```bash
yarn lint
yarn build
```

Optional manual verification:

```bash
yarn dev
```

Then:

1. Open a movie detail page and confirm the Similar tab triggers a TMDB request like:
   - `/movie/{filmId}/recommendations?language=en-US`
2. Open a TV detail page and confirm:
   - `/tv/{filmId}/recommendations?language=en-US`
3. Confirm similar titles still render through the existing `SimilarTitlesSection.jsx` normalization.
