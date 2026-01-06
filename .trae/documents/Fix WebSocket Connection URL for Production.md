I have analyzed the codebase and identified the issues causing the WebSocket connection failure in production.

**Root Cause Analysis:**
1.  **Hardcoded WebSocket URL:** The `WebsocketProvider.jsx` hardcodes `ws://localhost:8080/ws`. This prevents connection to the production server.
2.  **Protocol Mismatch:** Production runs on `https`, which requires `wss` (Secure WebSocket). Connecting to `ws` from an `https` page will be blocked by the browser (Mixed Content).
3.  **Potential Data Mismatch:** If you are testing with a local user ID against the production server, the connection will fail because the backend validates the `userId` in the database.

**Proposed Solution:**
I will implement a dynamic WebSocket URL generator that automatically adapts to the environment (Local vs. Production) and protocol (HTTP/WS vs. HTTPS/WSS).

**Implementation Plan:**

1.  **Modify `Frontend/src/context/Websocket/WebsocketProvider.jsx`**:
    *   Create a `getWebSocketUrl()` helper function.
    *   It will read `import.meta.env.VITE_BACKEND_URL` (which is already configured in your `.env`).
    *   Logic:
        *   Replace `http://` with `ws://`.
        *   Replace `https://` with `wss://`.
        *   Append `/ws` to the base URL.
        *   Append `?userId=${user.id}`.
    *   Add enhanced error logging in `onStompError` and `onWebSocketClose` to help diagnose any further issues.

2.  **Debugging & Verification Steps (for you):**
    *   **Localhost:** Ensure your local backend is running. The app will connect to `ws://localhost:8080/ws`.
    *   **Production:** Deploy the changes. The app will connect to `wss://movie-explorer-ktn5.onrender.com/ws`.
    *   **User ID Check:** Ensure you are logged in with a valid user that exists in the *target* environment's database.

**Note on Backend:**
I verified `WebsocketConfiguration.java` and `WebsocketHandshaker.java`. The backend allows all origins (`*`) and validates the `userId` from the query parameter. No backend changes are required.
