import { usePopularMovies } from '@/hooks/API/data';
import { useMovieGenres } from '@/hooks/API/genres';
import LoadingSideBar from '../Popular/LoadingSideBar';
import Popular from '../Popular/Popular';
import { motion } from 'framer-motion';

function PopularMovies() {
    const { popularMovies, isPopularMoviesLoading, isError } = usePopularMovies(1);
    const { MovieGenres, isGenresLoading } = useMovieGenres();

    const movies = popularMovies?.results?.slice(0, 3) || [];
    const genreList = MovieGenres?.data?.genres || [];

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
                Popular Movies
            </motion.h1>

            {isError ? (
                <motion.div
                    className="text-red-500 font-semibold p-3 sm:p-4 text-sm sm:text-base"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    Failed to load popular movies. Please try again later.
                </motion.div>
            ) : isPopularMoviesLoading || isGenresLoading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <LoadingSideBar />
                </motion.div>
            ) : (
                <Popular movies={movies} genres={genreList} />
            )}
        </motion.div>
    );
}

export default PopularMovies;
