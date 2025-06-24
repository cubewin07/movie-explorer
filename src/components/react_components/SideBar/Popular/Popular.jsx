import { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FilmModalContext } from '@/context/FilmModalProvider';

function Popular({ movies = [], genres = [] }) {
    const { setIsOpen, setContext } = useContext(FilmModalContext);
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const firstItem = useMemo(() => movies[0], [movies]);

    const getGenreNames = (ids) => ids?.map((id) => genres.find((g) => g.id === id)?.name).filter(Boolean) || [];

    const isTvSeries = (item) => !!item?.name && !item?.title;

    const handleClick = (movie) => {
        setContext(movie);
        setIsOpen(true);
    };

    const handleToggle = () => {
        if (!firstItem) return;
        const isTV = isTvSeries(firstItem);
        if (!showAll) {
            navigate(isTV ? '/tvseries/popular' : '/movies/popular');
        } else {
            navigate(-1);
            setShowAll(false);
        }
    };

    useEffect(() => {
        if (!firstItem) return;

        const isTV = isTvSeries(firstItem);
        const expectedPath = isTV ? '/tvseries/popular' : '/movies/popular';
        setShowAll(location.pathname === expectedPath);
    }, [location.pathname, firstItem]);

    return (
        <div className="flex flex-col gap-4">
            {movies.map((item) => {
                const genreNames = getGenreNames(item.genre_ids);
                const isTV = isTvSeries(item);
                const displayTitle = isTV ? item.name : item.title;
                const displayDate = isTV ? item.first_air_date : item.release_date;

                return (
                    <div
                        key={item.id}
                        className="flex gap-4 items-start p-3 rounded-lg transition hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer shadow-sm"
                        onClick={() => handleClick({ ...item, genres: genreNames })}
                    >
                        <img
                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                            alt={displayTitle}
                            className="h-24 w-auto rounded-lg object-cover shadow-md"
                        />

                        <div className="flex flex-col justify-between h-24">
                            <div className="space-y-1">
                                <h2 className="text-xs font-semibold text-gray-900 dark:text-white truncate w-[120px]">
                                    {displayTitle}
                                </h2>
                                <p className="text-[10px] text-gray-700 dark:text-gray-300">{displayDate}</p>

                                <div className="flex flex-wrap gap-1 mt-1">
                                    {genreNames.slice(0, 2).map((name) => (
                                        <span
                                            key={name}
                                            className="bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] px-2 py-[2px] rounded-full font-medium"
                                        >
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-[1px] rounded">
                                    IMDb
                                </span>
                                <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                                    {item.vote_average?.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {firstItem && (
                <AnimatePresence mode="wait">
                    <motion.button
                        key={showAll ? 'less' : 'more'}
                        onClick={handleToggle}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={`mt-3 px-4 py-1.5 border text-sm font-medium rounded-md transition-colors duration-200 ${
                            showAll
                                ? 'border-red-500 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/10'
                                : 'border-blue-500 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/10'
                        }`}
                    >
                        {showAll ? 'Show Less' : 'Show More'}
                    </motion.button>
                </AnimatePresence>
            )}
        </div>
    );
}

export default Popular;
