# Internal Film ID Migration Plan (Watchlist + Recommendations)

## 1) Current state (what is in the code today)
- Watchlist uses two ElementCollection sets with external TMDB ids stored in:
  - watchlist_movies (movie_id)
  - watchlist_series (series_id)
- Watchlist API accepts and returns tmdb ids only:
  - POST /watchlist { id, type }
  - GET /watchlist -> { moviesId: [], seriesId: [] }
- Frontend uses TMDB ids to fetch details in client.
- Reviews store film_id (tmdb id) + type in the review table.

## 2) Target state (internal id with external mapping)
- Use the recommendation schema as the source of truth:
  - film(internal_id PK, film_id = TMDB id, type, title, rating, date, background_img, ...)
  - Unique index: (film_id, type)
- Replace watchlist_movies/watchlist_series with a single join table:
  - watchlist_items(watchlist_id, internal_film_id)
  - Composite primary key: (watchlist_id, internal_film_id)
- Recommendation logic uses film.internal_id only.
- API still returns TMDB ids for client rendering, optionally alongside internal ids.

## 3) Backend changes (where to modify)
- New Film model + repository + service (lookup/create by tmdb_id + type).
- Watchlist entity: replace ElementCollection sets with a relationship to Film or a WatchlistItem entity.
- WatchlistDTO: decide payload shape. Recommended shape:
  - items: [{ filmId, tmdbId, type }]
  - keep moviesId/seriesId as deprecated arrays during transition if needed.
- WatchlistService: resolve internal film id on add/remove, and map output to DTO.
- WatchlistRepository: replace countAllWatchlistedMovies/Series with queries against watchlist_items joined to film.type.
- UserService: update watchlist summary building to align with new DTO shape.
- Review model/service: decide whether to keep tmdb id or migrate to internal film id.
  - Recommended: add film_id_internal and migrate reviews to internal ids for consistency.

## 4) Data migration (existing rows with external ids)
- New Flyway migration should:
  1) Create or reuse film table from the recommendation schema.
  2) Insert distinct TMDB ids from watchlist_movies and watchlist_series into film with type.
  3) Create watchlist_items table (composite PK).
  4) Backfill watchlist_items by joining on film_id (TMDB) + type -> internal_id.
  5) (Optional but recommended) Migrate reviews:
     - Add review.film_id_internal column (nullable).
     - Backfill by joining film on review.film_id + review.type.
     - Update code to read/write film_id_internal.
     - Later drop review.film_id once fully cut over.
  6) Enforce composite PKs in join tables (do not rely on multiple PK statements).

## 5) API + Frontend impacts
- Recommended compatibility strategy:
  - Keep POST/DELETE taking TMDB id + type (server resolves or creates film.internal_id).
  - GET /watchlist returns TMDB ids for UI, and optionally internal ids for rec engine.
- Update hooks that read watchlist data to use TMDB ids for TMDB API calls.

## 6) Rollout steps (safe order)
1) Add film + watchlist_items schema and backfill (no code change yet).
2) Deploy backend to write to new tables (dual-write if needed).
3) Update GET /watchlist response and frontend parsing.
4) (Optional) Migrate reviews to internal ids and update review queries.
5) Remove old watchlist_movies/watchlist_series tables and legacy DTO fields.

## 7) Decision points to confirm
- Do you want review.film_id to become internal id as well (recommended for consistency)?
- Should GET /watchlist include internal ids, or keep TMDB-only response?
- Do you want a separate Film metadata cache table (title, poster_path) to reduce TMDB calls?



