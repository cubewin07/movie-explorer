import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './components/pages/Home/Home';
import FilmModalProvider from './context/FilmModalProvider';
import PopularMoviesPage from './components/pages/Aside_Page/PopularPage/PopularMovies/PopularMoviesPage';
import PopularTvSeriesPage from './components/pages/Aside_Page/PopularPage/PopularTvSeries/PopularTvSeriesPage';
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
                    path: '/movies/popular',
                    element: <PopularMoviesPage />,
                },
                {
                    path: '/tvseries/popular',
                    element: <PopularTvSeriesPage />,
                },
                //   {
                //     path: '/community',
                //     element: <Community />,
                //   },
                //   {
                //     path: '/discovery',
                //     element: <Discovery />,
                //   },
                //   {
                //     path: '/coming-soon',
                //     element: <ComingSoon />,
                //   },
                //   {
                //     path: '/profile',
                //     element: <Profile />,
                //   },
                //   {
                //     path: '/friend',
                //     element: <Friend />,
                //   },
                //   {
                //     path: '/media',
                //     element: <Media />,
                //   },
                //   {
                //     path: '/settings',
                //     element: <Settings />,
                //   },
                //   {
                //     path: '/help',
                //     element: <Help />,
                //   },
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
