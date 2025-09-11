import { createBrowserRouter } from 'react-router-dom';
import Layout from '../../layout/Layout';
import Home from '../pages/Home/Home';
import MovieDetailPage from '../pages/FilmDetails/MovieDetailPage';
import TVSeriesDetailPage from '../pages/FilmDetails/TvSeriesDetailPage';
import Discovery from '../pages/Discovery/Discovery';
import WatchlistPage from '../pages/Watchlist/WatchlistPage';
import Settings from '../pages/Settings/Settings';
import ComingSoon from '../pages/ComingSoon/ComingSoon';
import UpcomingMoviesPage from '../pages/ComingSoon/UpcomingMoviesPage';
import UpcomingTvSeriesPage from '../pages/ComingSoon/UpcomingTvSeriesPage';
import HelpSupport from '../pages/HelpSupport/HelpSupport';
import NotFound from '../pages/NotFound/NotFound';
import Profile from '../pages/Profile';
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
