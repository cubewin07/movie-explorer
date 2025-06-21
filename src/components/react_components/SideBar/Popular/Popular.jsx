import { useState } from "react";
import clsx from "clsx";

function Popular({ movies, genres }) {
  const [showAll, setShowAll] = useState(false);
  const visibleMovies = showAll ? movies : movies.slice(0, 3);

  const design = clsx({
    'btn btn-outline btn-sm border-indigo-400 text-indigo-300 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white font-semibold rounded-lg transition duration-200 shadow-sm': !showAll,
    'btn btn-outline btn-sm border-rose-400 text-rose-300 hover:border-rose-500 hover:bg-rose-500/10 hover:text-white font-semibold rounded-lg transition duration-200 shadow-sm': showAll,
  });

  // Utility to map genre IDs to names
  const getGenreNames = (ids) => {
    return ids.map(id => genres.find(g => g.id === id)?.name).filter(Boolean);
  };

  return (
    <div className="flex flex-col gap-4">
      {movies.map(movie => {
                const genreNames = getGenreNames(movie.genre_ids);
                const visibleGenres = genreNames.slice(0, 2);
                const extraGenres = genreNames.slice(2);

                return (
                    <div key={movie.id} className="flex gap-4 items-start">
                        <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="h-24 rounded-lg object-cover"
                        />

                        <div className="flex flex-col justify-between h-24">
                            {/* Title + Release Date */}
                            <div>
                                <h2 className="text-white text-sm font-semibold w-[110px] truncate whitespace-nowrap overflow-hidden">
                                    {movie.title}
                                </h2>
                                <p className="text-xs text-neutral-200">{movie.release_date}</p>

                                {/* Genre Tags */}
                                <div className="flex flex-wrap gap-1 mt-1 items-center">
                                    {visibleGenres.map((name) => (
                                        <span
                                            key={name}
                                            className="bg-indigo-700/30 text-indigo-300 text-[10px] px-1.5 py-[1px] rounded"
                                        >
                                            {name}
                                        </span>
                                    ))}

                                    {extraGenres.length > 0 && (
                                        <div className="indicator">
                                            <span
                                                className="indicator-item badge badge-sm bg-indigo-500 text-white text-[10px] tooltip"
                                                data-tip={extraGenres.join(', ')}
                                            >
                                                +{extraGenres.length}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* IMDb Rating */}
                            <div className="flex items-center gap-1">
                                <div className="bg-yellow-400 text-black text-[12px] font-extrabold px-1.5 py-[1px] rounded-sm">
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

      {movies.length > 3 && (
        <button onClick={() => setShowAll(prev => !prev)} className={design}>
          {showAll ? "Show Less" : "See More"}
        </button>
      )}
    </div>
  );
}

export default Popular;
