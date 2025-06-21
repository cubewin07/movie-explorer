import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';

function Home() {
    // Fetch popular movies and genres
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
    const { data: genres, isLoading: isGenresLoading } = useQuery({
        queryKey: ['genres'],
        queryFn: () =>
            axiosInstance.get('/genre/movie/list', {
                params: { language: 'en-US' },
            }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

    const movies = popularMovies?.data?.results || [];
    const featured = movies[0];
    const rest = movies.slice(1, 8);
    const genreMap =
        genres?.data?.genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};

    return (
        <div className="w-full flex flex-col gap-12">
            {/* Hero Section */}
            {featured && (
                <div className="relative rounded-2xl overflow-hidden shadow-lg min-h-[320px] flex items-center bg-gradient-to-r from-blue-100 to-blue-50 animate-fade-in">
                    <img
                        src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`}
                        alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="relative z-10 p-10 max-w-2xl">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 drop-shadow-lg">{featured.title}</h1>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow">
                                ★ {featured.vote_average.toFixed(1)}
                            </span>
                            <span className="text-gray-700 text-sm font-medium">
                                {featured.release_date?.slice(0, 4)}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {featured.genre_ids.map((id) => (
                                <span key={id} className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    {genreMap[id]}
                                </span>
                            ))}
                        </div>
                        <p className="text-gray-700 mb-6 line-clamp-3">{featured.overview}</p>
                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all"
                        >
                            View Details
                        </Button>
                    </div>
                </div>
            )}

            {/* Popular Movies Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Popular Movies</h2>
                    <Button variant="link" className="text-blue-600">
                        View All
                    </Button>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-2">
                    {isPopularMoviesLoading || isGenresLoading ? (
                        <div className="flex gap-6 w-full">
                            {Array(6)
                                .fill(0)
                                .map((_, i) => (
                                    <div key={i} className="w-56 h-80 bg-gray-200 rounded-xl animate-pulse" />
                                ))}
                        </div>
                    ) : (
                        rest.map((movie) => (
                            <div
                                key={movie.id}
                                className="w-56 min-w-[14rem] bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col overflow-hidden group animate-fade-in"
                            >
                                <div className="relative h-72 overflow-hidden">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow">
                                        ★ {movie.vote_average.toFixed(1)}
                                    </span>
                                </div>
                                <div className="p-4 flex flex-col gap-2 flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">{movie.title}</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {movie.genre_ids.slice(0, 2).map((id) => (
                                            <span
                                                key={id}
                                                className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                                            >
                                                {genreMap[id]}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500">{movie.release_date?.slice(0, 4)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

export default Home;
