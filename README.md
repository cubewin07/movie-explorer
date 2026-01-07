# Movie Explorer

A full‑stack application for discovering movies/series, managing watchlists, writing reviews, and chatting with friends in real time. Built with React (Vite) on the frontend and Spring Boot on the backend, using WebSockets (STOMP), JWT auth, PostgreSQL, and a multi‑level caching architecture (Upstash Redis + Caffeine). Production runs on Render (backend), Supabase (PostgreSQL), and Upstash (Redis); local development runs everything on your machine.

## Live Demo

- Frontend: https://cubewin07.github.io/movie-explorer
- Backend API (Render): https://your-render-app.onrender.com
  - Replace with your actual Render URL; CORS is configured for the GitHub Pages domain

## Highlights

- Real‑time chat with unread counts, notifications, and online presence
- Social graph with friend requests, blocking, and user search
- Watchlist management with add/remove and profile stats
- Reviews with replies and episode/season metadata support
- Robust JWT security with membership checks on every protected resource
- Multi‑level cache: Redis (Upstash) + Caffeine with Kryo serialization
- Observability: Spring Boot Actuator + Prometheus metrics
- Clean React architecture with TanStack Query and modular hooks/components

## Recruiter Quick Tour (2 minutes)

- Open the app: https://cubewin07.github.io/movie-explorer
- Register or login, then:
  - Create a private chat with a user and send a message (real‑time via STOMP)
  - Observe notifications and unread states on the chat list
  - Add a movie to watchlist from Home and view profile stats
  - Write a review and reply; navigate episode metadata
- Technical notes to highlight while demoing:
  - Membership checks on every chat/messages call
  - WebSocket handshake sets Principal from email, topic routing per user/chat
  - Multi‑level caching reduces DB hits (Redis + Caffeine)

## Screenshots & GIFs (placeholders)

- Home hero + “Add to Watchlist”
- Chat list with unread badges and online ring
- Friend requests tabs (incoming/sent)
- Reviews thread with replies
- Profile with watchlist stats
- Tip: record 5–10s GIFs for each; place them under `docs/` and embed here.

## Tech Stack

- Frontend
  - React 19 + Vite 6
  - React Router 7
  - TanStack React Query 5
  - TailwindCSS + shadcn/ui (Radix primitives)
  - Framer Motion + lucide-react icons
  - STOMP client (`@stomp/stompjs`)
- Backend
  - Java 21 + Spring Boot 3
  - Spring Web, Security (JWT), Data JPA/Hibernate
  - PostgreSQL (Supabase in prod)
  - Flyway database migrations
  - WebSockets (STOMP) with Spring Messaging
  - Redis (Upstash) + Caffeine multi‑level caching
  - Actuator + Prometheus metrics

## Skills Map (feature → competency)

- Real‑time chat → STOMP/WebSocket, topic design, backpressure‑safe broadcasting
- AuthZ on chat/messages → Spring Security, JWT, resource membership enforcement
- Friends & requests → REST design, idempotent mutations, state modeling
- Watchlist & reviews → JPA mapping, pagination, DTO boundaries, validation
- Multi‑level caching → Redis + Caffeine, cache invalidation, Kryo serialization
- Frontend data layer → TanStack Query, optimistic UI, modular hooks
- UI/UX polish → Tailwind + shadcn/ui, Framer Motion, accessibility considerations
- Observability → Actuator endpoints, Prometheus metrics, structured logging

## Architecture

- Production
  - Frontend: GitHub Pages
  - Backend: Render (HTTP and WebSocket endpoints)
  - Database: Supabase PostgreSQL
  - Cache: Upstash Redis
  - Metrics: Prometheus scraping Actuator metrics
- Development (local)
  - Frontend: `vite` dev server on 5173
  - Backend: Spring Boot local on 8080
  - Postgres: local instance
  - Redis: local instance
  - WebSocket: `ws://localhost:8080/ws`

### ASCII Architecture Diagram

```
┌───────────────────────────┐         ┌───────────────────────────────┐
│    Frontend (Vite/React)  │  HTTPS  │  Backend (Spring Boot/Render) │
│  GitHub Pages (prod)      ├────────►│  REST + STOMP WebSockets      │
│  Local 5173 (dev)         │         │  JWT Security + JPA/Hibernate │
└───────────────────────────┘         └──────────────┬────────────────┘
                                                     │
                                                     │
                                             ┌───────▼────────┐
                                             │ Supabase (PG)  │
                                             │  Flyway        │
                                             └────────────────┘
                                                     │
                                                     │
                                             ┌───────▼────────┐
                                             │ Upstash Redis  │
                                             │  Kryo + Cache  │
                                             └────────────────┘
                                                     │
                                                     │
                                             ┌───────▼────────┐
                                             │ Prometheus     │
                                             │  Actuator      │
                                             └────────────────┘
```

## Key Features (with code references)

- Authentication & Security
  - JWT auth, stateless sessions, strict membership checks on protected endpoints
  - CORS configured for local dev and GitHub Pages
  - [SecurityConfig.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/config/SecurityConfig.java#L37-L57)
  - [ApplicationConfig.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/config/ApplicationConfig.java#L8-L17)
- WebSocket & Real‑Time Messaging
  - STOMP endpoints, handshake from query params, user principal set from email
  - Topic destinations for chat messages and notifications
  - [WebsocketConfiguration.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/websocket/WebsocketConfiguration.java#L36-L49)
  - [WebsocketHandshaker.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/websocket/interceptor/WebsocketHandshaker.java#L55-L84)
  - [STOMPController.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/websocket/controller/STOMPController.java#L38-L68)
- Notifications
  - Persisted notifications for chat and updates; WebSocket delivery if user online
  - Mark‑as‑read, bulk operations, and chat‑specific reads
  - [NotificationService.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/services/notification_service/service/NotificationService.java#L79-L107)
- Friends & Requests
  - Send, accept/block, delete; status lookups and list views
  - [FriendController.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/services/friend_service/controller/FriendController.java#L32-L68)
- Chat & Messages
  - Membership enforcement on reads and mutations; pagination for messages
  - [ChatController.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/services/chat_service/controller/ChatController.java#L33-L55)
  - [MessageController.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/services/chat_service/message/controller/MessageController.java#L37-L74)
- Reviews & Watchlist
  - Episode/season aware reviews; user‑scoped watchlist mutations
  - [ReviewController.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/services/review_service/controller/ReviewController.java#L27-L49)
  - [WatchlistController.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/services/watchlist_service/controller/WatchlistController.java#L19-L40)
- Caching
  - Multi‑level cache that reads/writes via Redis (Upstash) and Caffeine
  - Kryo serializer for efficient Redis object storage
  - [Multilevel_CacheManager.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/cache/Multilevel_CacheManager.java#L20-L27)
  - [Multilevel_CacheConfig.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/cache/Multilevel_CacheConfig.java#L13-L20)
  - [RedisCacheConfig.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/cache/RedisCacheConfig.java#L13-L21)
  - [KryoRedisSerializer.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/java/com/Backend/cache/KryoRedisSerializer.java#L27-L37)

## Frontend Architecture

- Auth & Session
  - JWT stored in cookies; session token for client session continuity
  - [AuthenProvider.jsx](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Frontend/src/context/AuthenProvider.jsx#L50-L62)
- WebSocket Client
  - Environment‑aware broker URL (`VITE_BACKEND_URL` → `ws/wss`)
  - Topic subscriptions for notifications and friend status
  - [WebsocketProvider.jsx](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Frontend/src/context/Websocket/WebsocketProvider.jsx#L40-L49)
- Chat UI
  - Sorted chats, unread detection, friend online indicator, mark‑as‑read flows
  - [ChatList.jsx](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Frontend/src/components/pages/Chat/ChatList.jsx#L141-L170)
- Documentation inside the repo for complex modules (FriendsView, FriendRequests, Home)
  - e.g. [ARCHITECTURE_FRIENDSVIEW.md](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Frontend/src/components/pages/Chat/FriendsView/ARCHITECTURE_FRIENDSVIEW.md)

## Running Locally

- Prerequisites
  - Node.js 18+
  - Java 21 (JDK)
  - PostgreSQL
  - Redis
- Backend
  - Env vars (see [application.yml](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/main/resources/application.yml#L6-L20))
    - DATABASE_URL
    - REDIS_URL
    - SECURITY_JWT_SECRET
    - SECURITY_JWT_EXPIRATION
    - PORT (default 8080)
  - Run: `./gradlew bootRun`
- Frontend
  - Env vars
    - VITE_BACKEND_URL (http://localhost:8080 for local)
  - Install: `npm install`
  - Dev server: `npm run dev`

## Testing & Quality

- Backend integration tests for WebSocket chat and notifications
  - [WebSocketChatIntegrationTest.java](file:///Users/letanthang/learning_software/React_projects/movie-explorer/Backend/src/test/java/com/Backend/services/chat_service/WebSocketChatIntegrationTest.java#L158-L251)
- Frontend linting
  - `npm run lint`

## Feature Demos (scripted)

- Real‑time Chat
  - Create a private chat via UI
  - Send a message; watch the recipient topic update instantly
  - Observe unread state and mark‑as‑read flow (REST + STOMP notification)
- Notifications
  - Receive chat notifications when you’re offline; they persist and show on login
  - Mark single/multiple/all as read; verify updates propagate
- Friend Requests
  - Search a user; send request; accept/block/cancel; check status transitions
- Watchlist
  - Add/remove items; open profile to see totals and breakdown
- Reviews
  - Post a review; add a reply; navigate episode metadata for series

## API Overview (selected)

- Auth
  - POST `/user/register`, `/user/authenticate`
  - GET `/user/me`
- Friends
  - GET `/friends/friend`, `/friends/status?email=...`
  - POST `/friends/request`
  - PUT `/friends/update`
  - DELETE `/friends/delete?id=...`
- Chat
  - POST `/chats/private`
  - GET `/chats?chatId=...`
- Messages
  - GET `/messages?chatId=...&page=...&size=...`
  - POST `/messages/mark-as-read?chatId=...`
- Reviews
  - GET `/reviews`
  - POST `/reviews`, `/reviews/reply`
- Watchlist
  - GET `/watchlist`
  - POST `/watchlist`
  - DELETE `/watchlist?id=...&type=...`

## Deployment Notes

- Backend (Render): Provide `DATABASE_URL`, `REDIS_URL`, `SECURITY_JWT_SECRET`, etc.
- Database (Supabase): Provision Postgres and expose connection string as `DATABASE_URL`
- Cache (Upstash): Provision Redis and use secure `REDIS_URL` (SSL enabled)
- Frontend (GitHub Pages): Build with `vite` and deploy `dist`; CORS allowed in backend for GitHub Pages domain
- WebSocket URL: Derived from `VITE_BACKEND_URL` and switched to `ws/wss`

## Security & Privacy

- JWT tokens in cookies; automatic logout on expiry
- Strict authorization and membership checks on chat/messages
- No secrets committed; env‑driven configuration

## Performance & Reliability

- Multi‑level cache (LRU + remote) to reduce DB load
- Kryo serializer for compact Redis payloads
- React memoization and debounced searches
- Prometheus metrics via Actuator endpoints

## What I Learned

- Designing and enforcing real‑time authorization with STOMP and JWT
- Building a resilient multi‑level caching layer across Redis and Caffeine
- Orchestrating a social UX with friend requests, presence, notifications
- Applying clean React architecture (hooks, query, modular components)
- Operating prod services: Render, Supabase, Upstash, and Prometheus

## Roadmap

- Add typing indicators and message delivery/seen states
- Extend notifications to non‑chat updates with richer payloads
- Improve search (fuzzy and multi‑field)
- Add e2e tests and load testing for WebSocket throughput

## Interview Talk Track (1 minute)

- Outcome: social discovery + real‑time messaging with consistent unread/notification states
- Security: JWT everywhere, strict membership checks on chat/messages, CORS scoped
- Real‑time: STOMP topics per chat/user; handshake sets Principal; broadcaster sends targeted notifications
- Data: Supabase Postgres with Flyway; DTOs isolate domain from transport
- Performance: multi‑level cache (Caffeine local + Upstash Redis remote) with Kryo; Prometheus + Actuator for visibility
- Frontend: modular hooks + TanStack Query; responsive UI with shadcn/ui and Framer Motion

## Contact

- Email: tanthang071208@gmail.com
- GitHub: https://github.com/cubewin07
