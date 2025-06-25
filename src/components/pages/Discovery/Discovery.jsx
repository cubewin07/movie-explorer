import { useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                className="w-full px-4 sm:px-6 lg:px-8 py-6 mx-auto max-w-screen-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <Breadcrumb items={breadcrumbItems} />

                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-6 border-b border-slate-300 dark:border-slate-700">
                    <NavLink
                        to="/movies"
                        className={({ isActive }) =>
                            cn(
                                'pb-2 text-lg font-medium transition-colors duration-200',
                                isActive
                                    ? 'text-blue-600 border-b-2 border-blue-500 font-semibold'
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
                                'pb-2 text-lg font-medium transition-colors duration-200',
                                isActive
                                    ? 'text-blue-600 border-b-2 border-blue-500 font-semibold'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
                            )
                        }
                    >
                        TV Series
                    </NavLink>
                </div>

                {/* Carousels */}
                <Carousel title="Trending" url={`trending/${apiType}/week`} type={apiType} />
                <div className="my-6" />
                <Carousel title="Popular" url={`${apiType}/popular`} type={apiType} />
                <div className="my-6" />
                <Carousel title="Top Rated" url={`${apiType}/top_rated`} type={apiType} />
            </motion.div>
        </AnimatePresence>
    );
}
