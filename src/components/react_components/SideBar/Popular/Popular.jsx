import { useMemo, useState } from 'react';
import clsx from 'clsx';

function Popular({ movies, genres }) {
    // Utility to map genre IDs to names
    const getGenreNames = (ids) => {
        return ids.map((id) => genres.find((g) => g.id === id)?.name).filter(Boolean);
    };
    return (
        <div className="flex flex-col gap-4">
            {movies.map((movie, index) => {
                console.log(movie);
                const genreNames = getGenreNames(movie.genre_ids);
                return (
                    <div key={movie.id} className="flex gap-4 items-start">
                        <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="h-24 rounded-lg object-cover"
                        />
                        <div className="flex flex-col justify-between h-24">
                            <div>
                                <h2 className="text-white text-xs font-semibold w-[100px] truncate whitespace-nowrap overflow-hidden">
                                    {movie.title || movie.name}
                                </h2>
                                <p className="text-[10px] text-neutral-200">
                                    {movie.release_date || movie.first_air_date}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1 items-center">
                                    {genreNames.map((name) => (
                                        <span
                                            key={name}
                                            className="text-[10px] px-1.5 py-[1px] rounded font-medium bg-blue-100 text-blue-700 dark:bg-violet-900 dark:text-violet-200"
                                        >
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="bg-yellow-400 text-black text-[10px] font-extrabold px-1.5  rounded-sm">
                                    IMDb
                                </div>
                                <span className="text-xs text-slate-300 font-medium">
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
