import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import axiosInstance from '@/lib/axiosInstance';
import LoadingSideBar from '../Popular/LoadingSideBar';
import Popular from '../Popular/Popular';

function PopularMovies() {
    const { data: popularMovies, isLoading: isPopularMoviesLoading } = useQuery({
        queryKey: ['popularMovies'],
        queryFn: () =>
            axiosInstance.get('/movie/popular', {
                params: {
                    language: 'en-US',
                    page: 1,
                },
            }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

    const { data: genres, isLoading: isGenresLoading } = useQuery({
        queryKey: ['genres'],
        queryFn: () =>
            axiosInstance.get('/genre/movie/list', {
                params: {
                    language: 'en-US',
                },
            }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
    });

    console.log(genres?.data);

    console.log(popularMovies?.data?.results);

    const movies = popularMovies?.data?.results || [];
    const visibleMovies = movies.slice(0, 3);

    return (
        <div>
            <h1 className="text-white text-opacity-50 text-lg font-bold mb-3">Popular Movies</h1>
            {(isPopularMoviesLoading || isGenresLoading) && <LoadingSideBar />}
            {!isPopularMoviesLoading && !isGenresLoading && (
                <div className="flex flex-col gap-4">
                    {visibleMovies.map((movie) => (
                        <div key={movie.id} className="flex gap-4 items-start cursor-pointer">
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
                                    <p className="text-[10px] text-neutral-200">{movie.release_date}</p>
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
                    ))}
                </div>
            )}
        </div>
    );
}

export default PopularMovies;
