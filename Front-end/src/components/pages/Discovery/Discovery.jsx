import { useState, useLayoutEffect, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from './Breadcrumb';
import InfiniteList from '@/components/react_components/List/InfiniteList';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useLocation, useNavigate } from 'react-router-dom';
import { set } from 'react-hook-form';

const SORT_OPTIONS = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'release_date.desc', label: 'Newest' },
    { value: 'release_date.asc', label: 'Oldest' },
    { value: 'original_title.asc', label: 'Title A-Z' },
];

export default function Discovery() {
    const location = useLocation();
    const navigate = useNavigate();
    const getTypeFromPath = (pathname) => {
        if (pathname.startsWith('/tvseries')) return 'tv';
        if (pathname.startsWith('/movies')) return 'movie';
        return 'movie';
    };
    const initialType = location.state?.type || getTypeFromPath(location.pathname);
    const initialSort = location.state?.sortBy || 'popularity.desc';
    const [type, setType] = useState(initialType);
    const [sortBy, setSortBy] = useState(initialSort);

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [sortBy]);

    // Sync type with path and state
    useEffect(() => {
        const newType = location.state?.type || getTypeFromPath(location.pathname);
        setType(newType);
    }, [location.pathname, location.state?.type]);

    const categoryKey = type === 'movie' ? 'movies' : 'tvseries';

    const breadcrumbItems = [
        { name: 'Home', to: '/' },
        { name: type === 'movie' ? 'Movies' : 'TV Series', to: `/${categoryKey}` },
    ];

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="w-full px-2 sm:px-4 md:px-8 py-6 mx-auto max-w-screen-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <Breadcrumb items={breadcrumbItems} />

                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-6 border-b border-slate-300 dark:border-slate-700 overflow-x-auto">
                    <button
                        onClick={() => {
                            setType('movie');
                            setSortBy('popularity.desc'); // Reset sort when switching types
                            navigate('/movies', { state: { type: 'movie', sortBy } });
                        }}
                        className={cn(
                            'pb-2 text-base sm:text-lg font-medium transition-colors duration-200',
                            type === 'movie'
                                ? 'text-blue-600 border-b-2 border-blue-500 font-semibold'
                                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
                        )}
                    >
                        Movies
                    </button>
                    <button
                        onClick={() => {
                            setType('tv');
                            setSortBy('popularity.desc'); // Reset sort when switching types
                            navigate('/tvseries', { state: { type: 'tv', sortBy } });
                        }}
                        className={cn(
                            'pb-2 text-base sm:text-lg font-medium transition-colors duration-200',
                            type === 'tv'
                                ? 'text-blue-600 border-b-2 border-blue-500 font-semibold'
                                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
                        )}
                    >
                        TV Series
                    </button>
                </div>

                {/* Sorting Dropdown */}
                <div className="flex justify-end mb-4 sticky top-12 z-20">
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full max-w-xs">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Infinite List */}
                <InfiniteList type={type} sortBy={sortBy} />
            </motion.div>
        </AnimatePresence>
    );
}
