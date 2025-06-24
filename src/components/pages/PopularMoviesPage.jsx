import { usePopularMovies } from '@/hooks/API/data';
import { useMovieGenres } from '@/hooks/API/genres';
import { useNavigate } from 'react-router-dom';
import { useEffect, useContext } from 'react';
import { FilmModalContext } from '@/context/FilmModalProvider';

export default function PopularMoviesPage() {
    const { popularMovies, isPopularMoviesLoading, isError } = usePopularMovies(1);
    const { MovieGenres, isGenresLoading } = useMovieGenres();
    const navigate = useNavigate();
    const { setIsOpen, setContext } = useContext(FilmModalContext);

    const movies = popularMovies?.results || [];
    const genreMap =
        MovieGenres?.data?.genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-fade-in">Popular Movies</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors"
                    >
                        Back
                    </button>
                </div>
                {isError ? (
                    <div className="text-red-500 font-semibold p-4">
                        Failed to load popular movies. Please try again later.
                    </div>
                ) : isPopularMoviesLoading || isGenresLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {Array(10)
                            .fill(0)
                            .map((_, i) => (
                                <div key={i} className="h-80 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                            ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {movies.map((movie, idx) => {
                            const genreNames = movie.genre_ids.map((id) => genreMap[id]).filter(Boolean);
                            return (
                                <div
                                    key={movie.id}
                                    className="bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden group cursor-pointer animate-pop-in"
                                    style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
                                    onClick={() => {
                                        setContext({ ...movie, genres: genreNames });
                                        setIsOpen(true);
                                    }}
                                >
                                    <div className="relative h-72 overflow-hidden">
                                        <img
                                            src={
                                                movie.poster_path
                                                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                                    : 'https://ui-avatars.com/api/?name=' +
                                                      encodeURIComponent(movie.title)
                                            }
                                            alt={movie.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow">
                                            ★ {movie.vote_average.toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="p-4 flex flex-col gap-2 flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                            {movie.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-1">
                                            {movie.genre_ids.slice(0, 3).map((id) => (
                                                <span
                                                    key={id}
                                                    className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full"
                                                >
                                                    {genreMap[id]}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {movie.release_date?.slice(0, 4)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes pop-in {
                    0% { opacity: 0; transform: scale(0.95) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-pop-in {
                    animation: pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .animate-fade-in {
                    animation: fade-in 0.7s ease both;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
