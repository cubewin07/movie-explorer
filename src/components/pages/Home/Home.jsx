import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { TrendingCarousel } from '@/components/TrendingCarousel';
import { useMovieGenres } from '@/hooks/API/genres';
import { usePopularMovies, usePaginatedFetch } from '@/hooks/API/data';
import { FilmModalContext } from '@/context/FilmModalProvider';

function Home() {
    const { data, isLoading, isError } = usePaginatedFetch('trending/movie/week', 1);
    const {
        popularMovies,
        isLoading: IsLoadingPopularMovies,
        isError: isFetchingPopularMovieError,
    } = usePopularMovies(1);
    const { MovieGenres, isGenresLoading } = useMovieGenres();

    const navigate = useNavigate();

    const { setIsOpen, setContext } = useContext(FilmModalContext);

    const TrendingMovies = data?.results || [];
    const movies = popularMovies?.results || [];
    const genreMap =
        MovieGenres?.data?.genres?.reduce((acc, g) => {
            acc[g.id] = g.name;
            return acc;
        }, {}) || {};

    const carouselItems = TrendingMovies.slice(0, 8).map((movie) => ({
        title: movie.title,
        id: movie.id,
        subtitle: movie.tagline,
        image: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(movie.title),
        description: movie.overview,
        rating: movie.vote_average?.toFixed(1),
        year: movie.release_date?.slice(0, 4),
        extra: movie.genre_ids?.map((id) => genreMap[id]) || [],
    }));

    return (
        <div className="w-full max-w-screen-xl mx-auto flex flex-col gap-12 px-2 sm:px-4 md:px-8">
            {/* Hero Section: Trending Carousel */}
            {carouselItems.length > 0 && <TrendingCarousel items={carouselItems} />}

            {/* Popular Movies Section */}
            <section>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Popular Movies
                    </h2>
                    <button
                        onClick={() => navigate('/movies/popular')}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors"
                    >
                        View All
                    </button>
                </div>
                {/* Responsive: grid on md+, horizontal scroll on mobile */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isError ? (
                        <div className="text-red-500 font-semibold p-4 col-span-full">
                            Failed to load popular movies. Please try again later.
                        </div>
                    ) : isLoading || isGenresLoading || IsLoadingPopularMovies ? (
                        Array(6)
                            .fill(0)
                            .map((_, i) => (
                                <div
                                    key={i}
                                    className="w-full h-80 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"
                                />
                            ))
                    ) : (
                        movies.slice(1, 9).map((movie) => {
                            const genreNames = movie.genre_ids.map((id) => genreMap[id]).filter(Boolean);
                            return (
                                <div
                                    key={movie.id}
                                    className="w-full bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col overflow-hidden group animate-pop-in cursor-pointer"
                                    onClick={() => {
                                        setContext({ ...movie, genres: genreNames });
                                        setIsOpen(true);
                                    }}
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
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                            {movie.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-1">
                                            {movie.genre_ids.slice(0, 2).map((id) => (
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
                        })
                    )}
                </div>
                {/* Mobile: horizontal scroll */}
                <div className="flex gap-6 overflow-x-auto pb-2 md:hidden">
                    {isError ? (
                        <div className="text-red-500 font-semibold p-4">
                            Failed to load popular movies. Please try again later.
                        </div>
                    ) : isLoading || isGenresLoading || IsLoadingPopularMovies ? (
                        Array(6)
                            .fill(0)
                            .map((_, i) => (
                                <div
                                    key={i}
                                    className="w-56 h-80 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse flex-shrink-0"
                                />
                            ))
                    ) : (
                        movies.slice(1, 9).map((movie) => {
                            const genreNames = movie.genre_ids.map((id) => genreMap[id]).filter(Boolean);
                            return (
                                <div
                                    key={movie.id}
                                    className="w-56 min-w-[14rem] bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col overflow-hidden group animate-pop-in cursor-pointer flex-shrink-0"
                                    onClick={() => {
                                        setContext({ ...movie, genres: genreNames });
                                        setIsOpen(true);
                                    }}
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
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                            {movie.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-1">
                                            {movie.genre_ids.slice(0, 2).map((id) => (
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
                        })
                    )}
                </div>
            </section>
        </div>
    );
}

export default Home;
