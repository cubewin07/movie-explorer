import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './components/pages/Home/Home';
import FilmModalProvider from './context/FilmModalProvider';
import PopularMoviesPage from './components/pages/Aside_Page/PopularPage/PopularMovies/PopularMoviesPage';
import PopularTvSeriesPage from './components/pages/Aside_Page/PopularPage/PopularTvSeries/PopularTvSeriesPage';
import Discovery from './components/pages/Discovery/Discovery';
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
                    children: [
                        {
                            path: 'popular',
                            element: <PopularMoviesPage />,
                        },
                        {
                            path: 'treding',
                            element: <PopularMoviesPage />,
                        },
                        {
                            path: 'top_rated',
                            element: <PopularTvSeriesPage />,
                        },
                    ],
                },
                {
                    path: '/tvseries',
                    element: <Discovery />,
                    children: [
                        {
                            path: 'popular',
                            element: <PopularTvSeriesPage />,
                        },
                        ,
                        {
                            path: 'trending',
                            element: <PopularTvSeriesPage />,
                        },
                        {
                            path: 'top_rated',
                            element: <PopularTvSeriesPage />,
                        },
                    ],
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
            <FilmModalProvider>
                <RouterProvider router={router} />
            </FilmModalProvider>
        </QueryClientProvider>
    );
}

export default App;
