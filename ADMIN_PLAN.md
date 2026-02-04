Admin Dashboard: Plan & Design

Objectives
- Add an admin dashboard accessible only to admins
- Allow promoting/demoting any user to admin
- Provide a statistics summary essential for a movie explorer app
- Keep existing architecture patterns and libraries

UX Structure
- Route: /admin
- Tabs: Users, Statistics, System
- Access: Admin-only, with clear 403 messaging and login redirect for non-admins

Users Management
- User search and pagination with a table view (id, email, username, role, createdAt)
- Actions: Promote to Admin, Demote to User
- Confirmation modal before role changes
- Safety rules:
  - Prevent demoting the last remaining admin
  - Discourage self-demotion (warn and require extra confirmation)
  - Show current user’s role and explain access impact

Statistics Summary
- Users:
  - Total users
  - Admin count
  - New registrations (last 7/30 days)
- Engagement:
  - Total chats and messages
  - Average messages per user
  - Pending vs accepted friendships
- Reviews:
  - Total reviews
  - Replies count
  - Top reviewed films (movie/series)
- Watchlist:
  - Total watchlisted movies
  - Total watchlisted series
  - Top watchlisted movies/series (top 10)
- Live presence:
  - Online users (approximate count via WebSocket presence)
- System/Observability:
  - Selected Actuator metrics (requests, cache stats)
  - Cache keys and quick eviction actions (optional)

Backend API Design
- Security
  - Require hasRole("ADMIN") for all admin endpoints
  - Continue using JWT filter that loads authorities from UserDetails on each request
- Endpoints
  - GET /admin/users?query=&page=0&size=20
    - Returns AdminUserDTO { id, email, username, role, createdAt }
  - GET /admin/users/{id}
    - Returns AdminUserDTO with additional relationships if needed
  - PATCH /admin/users/{id}/role
    - Body: { role: "ROLE_ADMIN" | "ROLE_USER" }
    - Validations: cannot demote last admin, double-confirm self-demotion
    - Cache eviction: userMeDTO (by email), allUsersDTO ('all'), userSearch, users
  - GET /admin/stats/summary
    - Returns counts: usersTotal, adminsTotal, newUsers7d, chatsTotal, messagesTotal, friendshipsAccepted, friendshipsPending, reviewsTotal, reviewsRepliesTotal, watchlistedMoviesTotal, watchlistedSeriesTotal, onlineUsers
  - GET /admin/stats/top-watchlisted?type=MOVIE&limit=10
    - Returns [{ filmId, watchers }]
  - GET /admin/stats/top-reviewed?type=MOVIE&limit=10
    - Returns [{ filmId, reviews }]
- Data sources and repos
  - Users: UserRepository
  - Chats: ChatRepository
  - Messages: MessageRepository
  - Friends: FriendRepo (Status.ACCEPTED/PENDING)
  - Reviews: ReviewRepository
  - Watchlist: WatchlistRepository (element collections watchlist_movies/watchlist_series)
  - Presence: STOMPEventListener userSessionMap (exposed via a service)
- Caching
  - Read-heavy stats should be cached per period (e.g., 60s) with explicit eviction on admin actions affecting counts
  - Respect existing cache names (userMeDTO, userSearch, allUsersDTO, friends, chats, notifications)

Frontend Design
- Access control
  - Add AdminRoute wrapper that requires user.isAdmin (from /user/me)
  - Extend UserMeDTO to include role or isAdmin boolean
- Users tab
  - Hook: useAdminUsers(query, page)
  - Table with actions; mutation hook: useUpdateUserRole(userId, role)
  - Toasts and optimistic updates with TanStack Query
- Statistics tab
  - Hook: useAdminStatsSummary()
  - Cards for headline metrics, lists for top watchlisted/reviewed
  - Prefer simple components with Tailwind; avoid adding new chart libraries initially
- System tab (optional)
  - Selected /actuator metrics snapshots
  - Cache eviction buttons (admin-only)
- Libraries and patterns
  - Use existing axios instance and TanStack Query
  - Tailwind + Radix UI for tables, modals, and cards

Data Model Changes
- Extend UserMeDTO with role or isAdmin to let the frontend gate /admin
- Add AdminUserDTO for admin user listing (id, email, username, role, createdAt)

Testing Strategy
- Security
  - Non-admin requests to /admin/** return 403
  - Admin role changes reflect immediately (JwtFilter loads authorities from DB)
- Role actions
  - Promote/demote flow, guard last-admin constraint, and self-demotion flow
  - Cache eviction verifies updated /user/me and /user/all responses
- Stats
  - H2-based counts match seeded data
  - Top watchlisted/reviewed endpoints return correct ordering and limits
- Websocket presence
  - Online count endpoint tolerates delayed disconnect (30s grace)
- CI/tests environment
  - Ensure REDIS_URL is set (dotenv not loaded in tests)

Potential Bugs & Risks
- SecurityConfig permits all methods on /reviews and /reviews/reply
  - Current config: requestMatchers("/reviews").permitAll and requestMatchers("/reviews/reply").permitAll
  - Impact: unauthenticated users could POST /reviews or /reviews/reply, causing null user issues
  - Fix: method-specific matchers (permit GET only; require auth for POST/DELETE)
- Missing admin visibility in /user/me
  - Frontend cannot gate /admin without role in UserMeDTO
  - Fix: include role or isAdmin in UserMeDTO and invalidate caches after role changes
- Username vs email confusion
  - getAllUsersDTO maps username to email to satisfy tests; UI should display both clearly
- Last admin demotion
  - Risk of locking out admin access
  - Fix: enforce at least one admin; block demoting the last admin
- Presence accuracy
  - STOMPEventListener has a 30s disconnect delay; live online count may lag
  - Fix: display “approximate” status and timestamp of last update
- Heavy stats queries
  - Large counts or top lists may be slow
  - Fix: indexes, caching, and pagination; avoid N+1 queries
- Tests and cache environment
  - Tests use a unified CacheManager and need REDIS_URL set; ensure eviction paths cover userMeDTO and allUsersDTO

Implementation Steps (Non-code)
- Add role/isAdmin to UserMeDTO for gating AdminRoute
- Create admin endpoints for users and stats with hasRole("ADMIN")
- Build Users tab and role mutate flow with confirmations
- Build Stats tab with summary cards and top lists
- Add tests covering security, role updates, caches, and stats correctness

References
- SecurityConfig (roles and permitted paths)
- JwtFilterChain (authorities loaded on each request)
- ROLE enum and User.authorities
- ReviewController, ReviewService, ReviewRepository (reviews and replies)
- WatchlistRepository, Watchlist model (element collections for counts)
- ChatRepository, MessageRepository, FriendRepo (engagement stats)
- STOMPEventListener (presence tracking)
