# Copilot Instructions for Movie Explorer

Welcome to the Movie Explorer project! This document provides essential guidance for AI coding agents to be productive in this codebase. It covers the architecture, workflows, conventions, and integration points specific to this project.

## Project Overview

Movie Explorer is a React-based web application built with Vite. It provides a platform for users to explore movies, TV series, and related content. The project is structured into distinct modules for features like authentication, chat, discovery, and watchlist management.

### Key Directories

- **`src/components/pages`**: Contains page-level components organized by feature (e.g., `Chat`, `Discovery`, `FilmDetails`).
- **`src/components/react_components`**: Reusable components like modals, lists, and sidebars.
- **`src/components/ui`**: UI primitives such as buttons, cards, and loaders.
- **`src/context`**: Context providers for managing global state (e.g., `AuthenProvider.jsx`, `FilmModalProvider.jsx`).
- **`src/hooks`**: Custom hooks for API interactions and watchlist management.
- **`src/lib`**: Utility functions and API instances (e.g., `axiosInstance.js`, `tmdb.js`).

## Architecture and Data Flow

1. **Routing**: Defined in `src/components/routes/Routers.jsx`. Public and protected routes are managed using `PublicRoute.jsx` and `ProtectedRoute.jsx`.
2. **State Management**: Context API is used for global state, with providers in `src/context`.
3. **API Integration**: TMDB API is accessed via utility functions in `src/lib/tmdb.js`.
4. **Styling**: Tailwind CSS is used for styling, with configurations in `tailwind.config.js`.

## Developer Workflows

### Build and Run

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build for production: `npm run build`

### Testing

Currently, no testing framework is set up. Add tests as needed.

### Debugging

- Use browser developer tools for debugging React components.
- Check API requests and responses in the network tab.

## Project-Specific Conventions

- **Component Organization**: Page-level components are in `src/components/pages`, while reusable components are in `src/components/react_components` and `src/components/ui`.
- **File Naming**: Use PascalCase for component files and camelCase for utility files.
- **Styling**: Use Tailwind CSS classes directly in JSX.

## Integration Points

- **Authentication**: Managed via `src/context/AuthenProvider.jsx`.
- **Chat**: Components for chat functionality are in `src/components/pages/Chat`.
- **Watchlist**: Custom hooks for watchlist management are in `src/hooks/watchList`.
- **API**: TMDB API integration is centralized in `src/lib/tmdb.js`.

## Examples

### Adding a New Page

1. Create a new folder in `src/components/pages`.
2. Add a main component file (e.g., `NewPage.jsx`).
3. Update `src/components/routes/Routers.jsx` to include the new route.

### Using a Custom Hook

To fetch watchlist data:

```javascript
import { useWatchList } from 'src/hooks/watchList/useWatchList';

const watchlist = useWatchList();
```

## Notes

- Follow the existing folder structure and naming conventions.
- Use Tailwind CSS for consistent styling.
- Centralize API calls in `src/lib` to maintain separation of concerns.

For further questions, refer to the `README.md` or explore the codebase.