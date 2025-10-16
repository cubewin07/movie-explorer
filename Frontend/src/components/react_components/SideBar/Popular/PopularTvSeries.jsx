import { usePopularTvSeries } from '@/hooks/API/data';
import { useTvSeriesGenres } from '@/hooks/API/genres';

import Popular from '@/components/react_components/SideBar/Popular/Popular.jsx';
import LoadingSideBar from '@/components/react_components/SideBar/Popular/LoadingSideBar.jsx';
import { motion } from 'framer-motion';

function PopularTvSeries() {
    const { popularTvSeries, LoadingPopularTvSeries, isError } = usePopularTvSeries(1);
    const { TvSeriesGenresRes, isTvSeriesGenreLoading: LoadingTvSeriesGenre } = useTvSeriesGenres();

    const TvSeriesGenres = TvSeriesGenresRes?.data?.genres;
    const PopularTvSeries = popularTvSeries?.results || [];
    const visiblePopularTvSeries = PopularTvSeries.slice(0, 3);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <motion.h1
                className="text-base sm:text-lg font-bold mb-2 sm:mb-3
           text-gray-800/80 dark:text-white dark:text-opacity-80 ml-3"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
            >
                Popular TV Series
            </motion.h1>
            {isError ? (
                <motion.div
                    className="text-red-500 font-semibold p-3 sm:p-4 text-sm sm:text-base"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    Failed to load popular TV series. Please try again later.
                </motion.div>
            ) : LoadingPopularTvSeries || LoadingTvSeriesGenre ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <LoadingSideBar />
                </motion.div>
            ) : (
                <Popular movies={visiblePopularTvSeries} genres={TvSeriesGenres} />
            )}
        </motion.div>
    );
}

export default PopularTvSeries;
