import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './components/pages/Home/Home';
import PopularMoviesPage from './components/pages/Aside_Page/PopularPage/PopularMovies/PopularMoviesPage';
import PopularTvSeriesPage from './components/pages/Aside_Page/PopularPage/PopularTvSeries/PopularTvSeriesPage';
import MovieDetailPage from './components/pages/FilmDetails/MovieDetailPage';
import TVSeriesDetailPage from './components/pages/FilmDetails/TvSeriesDetailPage';
import Discovery from './components/pages/Discovery/Discovery';
import WatchlistPage from './components/pages/Watchlist/WatchlistPage';
// import Community from './pages/Community'
// import Discovery from './pages/Discovery'
// import ComingSoon from './pages/ComingSoon'
// import Profile from './pages/Profile'

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
                    path: '/movies/:type',
                    element: <PopularMoviesPage />,
                },
                {
                    path: '/movie/:id',
                    element: <MovieDetailPage />,
                },
                {
                    path: '/tvseries',
                    element: <Discovery />,
                },
                {
                    path: '/tvserie/:id',
                    element: <TVSeriesDetailPage />,
                },
                {
                    path: '/tvseries/:type',
                    element: <PopularTvSeriesPage />,
                },
                {
                    path: '/watchlist',
                    element: <WatchlistPage />,
                },
                // Add other routes here
            ],
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
