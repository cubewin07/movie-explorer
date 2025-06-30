import { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FilmModalContext } from '@/context/FilmModalProvider';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // Optional

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
            navigate(-1, { replace: true });
            setShowAll(false);
        }
    };

    useEffect(() => {
        if (!firstItem) return;
        const isTV = isTvSeries(firstItem);
        const expectedPath = isTV ? '/tvseries/popular' : '/movies/popular';
        setShowAll(location.pathname === expectedPath);
    }, [location.pathname, firstItem]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12 },
        },
    };
    const cardVariants = {
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 180, damping: 18 },
        },
    };
    const badgeVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    };

    return (
        <motion.div
            className="rounded-2xl p-2 sm:p-3 bg-slate-50 dark:bg-slate-900 shadow-md space-y-2 sm:space-y-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
        >
            {movies.map((item, i) => {
                const genreNames = getGenreNames(item.genre_ids);
                const isTV = isTvSeries(item);
                const displayTitle = isTV ? item.name : item.title;
                const displayDate = isTV ? item.first_air_date : item.release_date;

                return (
                    <motion.div
                        key={item.id}
                        className="flex gap-2 sm:gap-3 p-2 min-h-[100px] sm:min-h-[110px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:ring-1 hover:ring-blue-400 dark:hover:ring-blue-500 transition cursor-pointer shadow-sm"
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        onClick={() => handleClick({ ...item, genres: genreNames })}
                    >
                        <Card className="w-12 h-full sm:w-14 overflow-hidden rounded-md shadow-sm flex-shrink-0 bg-muted my-auto">
                            <img
                                src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                alt={displayTitle}
                                className="w-full h-full object-cover"
                            />
                        </Card>

                        <div className="flex flex-col justify-between w-full overflow-hidden">
                            <div className="space-y-0.5">
                                <h2 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {displayTitle}
                                </h2>
                                <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-slate-400 truncate">
                                    {displayDate}
                                </p>

                                <motion.div
                                    className="flex flex-wrap gap-[3px] sm:gap-[4px] mt-1"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={{
                                        hidden: {},
                                        visible: { transition: { staggerChildren: 0.08 } },
                                    }}
                                >
                                    {genreNames.slice(0, 2).map((name) => (
                                        <motion.span
                                            key={name}
                                            className="bg-indigo-100 dark:bg-indigo-600 text-indigo-800 dark:text-white text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-[2px] sm:py-[3px] rounded leading-none min-w-[40px] sm:min-w-[48px] text-center"
                                            variants={badgeVariants}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true }}
                                        >
                                            {name}
                                        </motion.span>
                                    ))}
                                </motion.div>
                            </div>

                            <div className="flex items-center gap-[3px] sm:gap-[4px] mt-1">
                                <span className="bg-yellow-300 text-black text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-[2px] sm:py-[3px] rounded-md leading-none min-w-[35px] sm:min-w-[40px] text-center">
                                    IMDb
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-gray-900 dark:text-white font-semibold">
                                    {item.vote_average?.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
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
                        className={`w-full mt-2 px-3 sm:px-4 py-1.5 sm:py-2 border text-xs sm:text-sm font-medium rounded-md text-center transition-colors duration-200 ${
                            showAll
                                ? 'border-red-500 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/10'
                                : 'border-blue-500 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/10'
                        }`}
                    >
                        {showAll ? 'Show Less' : 'Show More'}
                    </motion.button>
                </AnimatePresence>
            )}
        </motion.div>
    );
}

export default Popular;
