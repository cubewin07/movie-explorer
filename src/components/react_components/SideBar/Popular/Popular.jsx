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
                console.log(genreNames);
                return (
                    <div
                        key={movie.id}
                        className="flex gap-4 items-start cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition"
                        onClick={() => handleClick({ ...movie, genres: genreNames })}
                    >
                        <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="h-24 rounded-lg object-cover"
                        />
                        <div className="flex flex-col justify-between h-24">
                            <div>
                                <h2 className="text-gray-900 dark:text-white text-xs font-semibold w-[100px] truncate whitespace-nowrap overflow-hidden">
                                    {movie.title || movie.name}
                                </h2>
                                <p className="text-[10px] text-gray-700 dark:text-gray-300">
                                    {movie.release_date || movie.first_air_date}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1 items-center">
                                    {genreNames.slice(0, 2).map((name) => (
                                        <span
                                            key={name}
                                            className="text-[10px] px-1.5 py-[1px] rounded font-medium bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                        >
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="bg-yellow-400 text-black text-[10px] font-extrabold px-1.5 rounded-sm">
                                    IMDb
                                </div>
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
