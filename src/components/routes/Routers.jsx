import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layout/Layout';
import Home from '../components/pages/Home/Home';
import MovieDetailPage from '../components/pages/FilmDetails/MovieDetailPage';
import TVSeriesDetailPage from '../components/pages/FilmDetails/TvSeriesDetailPage';
import Discovery from '../components/pages/Discovery/Discovery';
import WatchlistPage from '../components/pages/Watchlist/WatchlistPage';
import Settings from '../components/pages/Settings/Settings';
import ComingSoon from '../components/pages/ComingSoon/ComingSoon';
import UpcomingMoviesPage from '../components/pages/ComingSoon/UpcomingMoviesPage';
import UpcomingTvSeriesPage from '../components/pages/ComingSoon/UpcomingTvSeriesPage';
import HelpSupport from '../components/pages/HelpSupport/HelpSupport';
import NotFound from '../components/pages/NotFound/NotFound';
import Profile from '../components/pages/Profile';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <Layout />,
            children: [
                // Public Routes - Accessible to everyone
                {
                    path: '/',
                    element: (
                        <PublicRoute>
                            <Home />
                        </PublicRoute>
                    ),
                },
                {
                    path: '/movies',
                    element: (
                        <PublicRoute>
                            <Discovery />
                        </PublicRoute>
                    ),
                },
                {
                    path: '/tvseries',
                    element: (
                        <PublicRoute>
                            <Discovery />
                        </PublicRoute>
                    ),
                },
                {
                    path: '/movie/:id',
                    element: (
                        <PublicRoute>
                            <MovieDetailPage />
                        </PublicRoute>
                    ),
                },
                {
                    path: '/tv/:id',
                    element: (
                        <PublicRoute>
                            <TVSeriesDetailPage />
                        </PublicRoute>
                    ),
                },
                {
                    path: '/coming-soon',
                    element: (
                        <PublicRoute>
                            <ComingSoon />
                        </PublicRoute>
                    ),
                },
                {
                    path: '/movies/upcoming',
                    element: (
                        <PublicRoute>
                            <UpcomingMoviesPage />
                        </PublicRoute>
                    ),
                },
                {
                    path: '/tv/upcoming',
                    element: (
                        <PublicRoute>
                            <UpcomingTvSeriesPage />
                        </PublicRoute>
                    ),
                },
                {
                    path: '/help',
                    element: (
                        <PublicRoute>
                            <HelpSupport />
                        </PublicRoute>
                    ),
                },

                // Protected Routes - Require authentication
                {
                    path: '/profile',
                    element: (
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '/watchlist',
                    element: (
                        <ProtectedRoute>
                            <WatchlistPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: '/settings',
                    element: (
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    ),
                },
                // Add other routes here
            ],
        },
        {
            path: '*',
            element: <NotFound />,
        },
    ],
    {
        basename: import.meta.env.DEV ? '/' : '/movie-explorer',
    },
);

export { router };
