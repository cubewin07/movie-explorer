import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import LoadingSideBar from '../Popular/LoadingSideBar';
import Popular from '../Popular/Popular';
import { useMovieGenres } from '@/Hooks/API/genres';

function PopularMovies() {
    const { data: popularMovies, isLoading: isPopularMoviesLoading } = useQuery({
        queryKey: ['popularMovies'],
        queryFn: () =>
            axiosInstance.get('/movie/popular', {
                params: { language: 'en-US', page: 1 },
            }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

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
