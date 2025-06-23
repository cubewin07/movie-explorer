import { usePopularMovies } from '@/Hooks/API/data';
import { useMovieGenres } from '@/hooks/API/genres';
import LoadingSideBar from '../Popular/LoadingSideBar';
import Popular from '../Popular/Popular';

function PopularMovies() {
    const { popularMovies, isPopularMoviesLoading } = usePopularMovies();
    const { MovieGenres, isGenresLoading } = useMovieGenres();

    const movies = popularMovies?.data?.results?.slice(0, 3) || [];
    const genreList = MovieGenres?.data?.genres || [];

    return (
        <div>
            <h1 className="text-white text-opacity-50 text-lg font-bold mb-3">Popular Movies</h1>

            {(isPopularMoviesLoading || isGenresLoading) && <LoadingSideBar />}

            {!isPopularMoviesLoading && !isGenresLoading && <Popular movies={movies} genres={genreList} />}
        </div>
    );
}

export default PopularMovies;
