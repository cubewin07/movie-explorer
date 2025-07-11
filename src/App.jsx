import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './components/pages/Home/Home';
import MovieDetailPage from './components/pages/FilmDetails/MovieDetailPage';
import TVSeriesDetailPage from './components/pages/FilmDetails/TvSeriesDetailPage';
import Discovery from './components/pages/Discovery/Discovery';
import WatchlistPage from './components/pages/Watchlist/WatchlistPage';
import Settings from './components/pages/Settings/Settings';
import ComingSoon from './components/pages/ComingSoon/ComingSoon';
import UpcomingMoviesPage from './components/pages/ComingSoon/UpcomingMoviesPage';
import UpcomingTvSeriesPage from './components/pages/ComingSoon/UpcomingTvSeriesPage';
import HelpSupport from './components/pages/HelpSupport/HelpSupport';
import NotFound from './components/pages/NotFound/NotFound';
import Profile from './components/pages/Profile';

const queryClient = new QueryClient();

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <Layout />,
            children: [
                {
                    path: '/',
                    element: <Home />,
                },
                {
                    path: '/movies',
                    element: <Discovery />, // this contains the tabs + carousels + <Outlet />
                },
                {
                    path: '/tvseries',
                    element: <Discovery />,
                },
                {
                    path: '/settings',
                    element: <Settings />,
                },
                {
                    path: '/coming-soon',
                    element: <ComingSoon />,
                },
                {
                    path: '/profile',
                    element: <Profile />,
                },
                {
                    path: '/movie/:id',
                    element: <MovieDetailPage />,
                },
                {
                    path: '/tv/:id',
                    element: <TVSeriesDetailPage />,
                },
                {
                    path: '/watchlist',
                    element: <WatchlistPage />,
                },
                {
                    path: '/movies/upcoming',
                    element: <UpcomingMoviesPage />,
                },
                {
                    path: '/tv/upcoming',
                    element: <UpcomingTvSeriesPage />,
                },
                {
                    path: '/help',
                    element: <HelpSupport />,
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

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}

export default App;
