import { useLocation, NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

import Breadcrumb from './Breadcrumb';
import Carousel from './Carousel';

export default function Discovery() {
    const location = useLocation();
    const isMovies = location.pathname.startsWith('/movies');
    const categoryKey = isMovies ? 'movies' : 'tvseries';
    const apiType = isMovies ? 'movie' : 'tv';

    const breadcrumbItems = [
        { name: 'Home', to: '/' },
        { name: isMovies ? 'Movies' : 'TV Series', to: `/${categoryKey}` },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <Breadcrumb items={breadcrumbItems} />

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b">
                <NavLink
                    to="/movies"
                    className={({ isActive }) =>
                        cn(
                            'pb-2 text-lg font-medium',
                            isActive
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
                        )
                    }
                >
                    Movies
                </NavLink>
                <NavLink
                    to="/tvseries"
                    className={({ isActive }) =>
                        cn(
                            'pb-2 text-lg font-medium',
                            isActive
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
                        )
                    }
                >
                    TV Series
                </NavLink>
            </div>

            {/* Carousels */}
            <Carousel title="Trending" url={`trending/${apiType}/week`} type={apiType} />
            <Carousel title="Popular" url={`${apiType}/popular`} type={apiType} />
            <Carousel title="Top Rated" url={`${apiType}/top_rated`} type={apiType} />

            {/* Nested detail routes will render here */}
            <Outlet />
        </div>
    );
}
