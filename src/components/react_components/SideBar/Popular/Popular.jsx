import { useContext } from 'react';
import { FilmModalContext } from '@/context/FilmModalProvider';

function Popular({ movies, genres }) {
    const { setIsOpen, setContext } = useContext(FilmModalContext);

    const getGenreNames = (ids) => ids.map((id) => genres.find((g) => g.id === id)?.name).filter(Boolean);

    const handleClick = (movie) => {
        setContext(movie);
        setIsOpen(true);
    };

    return (
        <div className="flex flex-col gap-4">
            {movies.map((movie) => {
                const genreNames = getGenreNames(movie.genre_ids);
                console.log(movie);
                return (
                    <div
                        key={movie.id}
                        className="flex gap-4 items-start p-3 rounded-lg transition hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer shadow-sm"
                        onClick={() => handleClick({ ...movie, genres: genreNames })}
                    >
                        {/* Poster */}
                        <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="h-24 w-auto rounded-lg object-cover shadow-md"
                        />

                        {/* Info */}
                        <div className="flex flex-col justify-between h-24">
                            <div className="space-y-1">
                                <h2 className="text-xs font-semibold text-gray-900 dark:text-white truncate w-[120px]">
                                    {movie.title || movie.name}
                                </h2>
                                <p className="text-[10px] text-gray-700 dark:text-gray-300">
                                    {movie.release_date || movie.first_air_date}
                                </p>

                                {/* Genres */}
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

                            {/* Rating */}
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-[1px] rounded">
                                    IMDb
                                </span>
                                <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                                    {movie.vote_average.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default Popular;
