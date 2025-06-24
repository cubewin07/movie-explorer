import { usePopularMovies } from '@/hooks/API/data';
import { useMovieGenres } from '@/hooks/API/genres';
import LoadingSideBar from '../Popular/LoadingSideBar';
import Popular from '../Popular/Popular';

function PopularMovies() {
    const { popularMovies, isPopularMoviesLoading, isError } = usePopularMovies(1);
    const { MovieGenres, isGenresLoading } = useMovieGenres();

    const movies = popularMovies?.results?.slice(0, 3) || [];
    const genreList = MovieGenres?.data?.genres || [];

    return (
        <div>
            <h1 className="text-white text-opacity-50 text-lg font-bold mb-3">Popular Movies</h1>

            {isError ? (
                <div className="text-red-500 font-semibold p-4">
                    Failed to load popular movies. Please try again later.
                </div>
            ) : isPopularMoviesLoading || isGenresLoading ? (
                <LoadingSideBar />
            ) : (
                <Popular movies={movies} genres={genreList} />
            )}
        </div>
    );
}

export default PopularMovies;
