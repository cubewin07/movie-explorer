import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import axiosInstance from "@/lib/axiosInstance";
import LoadingSideBar from "./LoadingSideBar";

function PopularMovies() {
    const [showAll, setShowAll] = useState(false);
    
    const {data: popularMovies, isLoading: isPopularMoviesLoading} = useQuery({
        queryKey: ['popularMovies'],
        queryFn: () => axiosInstance.get('/movie/popular', {
            params: {
                language: 'en-US',
                page: 1,
            }
        }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    })

    const {data: genres, isLoading: isGenresLoading} = useQuery({
        queryKey: ['genres'],
        queryFn: () => axiosInstance.get('/genre/movie/list', {
            params: {
                language: 'en-US',
            }
        }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    })

    console.log(genres?.data);

    console.log(popularMovies?.data?.results);

    const movies = popularMovies?.data?.results || []
    const visibleMovies =  movies.slice(0, 3)

    const design = clsx({
        'btn btn-outline btn-sm border-indigo-400 text-indigo-300 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white font-semibold rounded-lg transition duration-200 shadow-sm': !showAll,
        'btn btn-outline btn-sm border-rose-400 text-rose-300 hover:border-rose-500 hover:bg-rose-500/10 hover:text-white font-semibold rounded-lg transition duration-200 shadow-sm': showAll,
    })

    return ( 
        <div>
            <h1 className="text-white text-opacity-50 text-lg font-bold mb-3">Popular Movies</h1>
            {(isPopularMoviesLoading || isGenresLoading) && <LoadingSideBar />}
            {!isPopularMoviesLoading && !isGenresLoading && (
                <div className="flex flex-col gap-4">
                    {visibleMovies.map(movie => (
                        <div key={movie.id} className="flex gap-4 items-start">
                            <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="h-24 rounded-lg object-cover"
                            />
                            
                            <div className="flex flex-col justify-between h-24">
                                <div>
                                    <h2 className="text-white text-sm font-semibold w-[110px] truncate whitespace-nowrap overflow-hidden">
                                    {movie.title}
                                    </h2>
                                    <p className="text-xs text-neutral-200">{movie.release_date}</p>
                                </div>

                                <div className="flex items-center gap-1">
                                    <div className="bg-yellow-400 text-black text-[12px] font-bold px-1.5 py-[1px] rounded-sm">
                                        IMDb
                                    </div>
                                    <span className="text-xs text-slate-300 font-medium">
                                        {movie.vote_average.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                        {/* Toggle Button */}
                        {movies.length > 3 && (
                            <button
                                onClick={() => setShowAll(prev => !prev)}
                                className={design}
                            >
                                {showAll ? 'Show Less' : 'See More'}
                            </button>
                        )}
            </div>
            )}
        </div>
    );
}

export default PopularMovies;