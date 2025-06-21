import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import axiosInstance from '@/lib/axiosInstance';
import LoadingSideBar from '../Popular/LoadingSideBar';
import Popular from '../Popular/Popular';

function PopularMovies() {
    const [showAll, setShowAll] = useState(false);

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

    const design = clsx({
        'btn btn-outline btn-sm border-indigo-400 text-indigo-300 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white font-semibold rounded-lg transition duration-200 shadow-sm':
            !showAll,
        'btn btn-outline btn-sm border-rose-400 text-rose-300 hover:border-rose-500 hover:bg-rose-500/10 hover:text-white font-semibold rounded-lg transition duration-200 shadow-sm':
            showAll,
    });

    return (
        <div>
            <h1 className="text-white text-opacity-50 text-lg font-bold mb-3">Popular Movies</h1>
            {(isPopularMoviesLoading || isGenresLoading) && <LoadingSideBar />}
            {!isPopularMoviesLoading && !isGenresLoading && (
                <Popular movies={visibleMovies} genres={genres?.data?.genres} />
            )}
        </div>
    );
}

export default PopularMovies;
