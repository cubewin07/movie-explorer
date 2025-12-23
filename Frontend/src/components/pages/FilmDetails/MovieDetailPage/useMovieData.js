import { useMovieDetails, useMovieTrailer, useMovieCredits } from '@/hooks/API/data';
import { useAuthen } from '@/context/AuthenProvider';
import useAddToWatchlist from '@/hooks/watchList/useAddtoWatchList';
import { useState } from 'react';

/**
 * Custom hook for managing movie detail data
 * Fetches movie info, trailer, credits, and handles watchlist operations
 */
export function useMovieData(movieId) {
    const { user, token } = useAuthen();
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Fetch movie details
    const { movie, isLoading, isError } = useMovieDetails(movieId);

    // Fetch trailer
    const { trailerUrl, isLoadingTrailer } = useMovieTrailer(movieId);

    // Fetch credits (cast & crew)
    const { 
        credits, 
        isLoading: isLoadingCredits, 
        isError: isErrorCredits 
    } = useMovieCredits(movieId);

    // Watchlist operations
    const { mutate: addToWatchlist, isPending } = useAddToWatchlist(token);

    // Extract genres
    const genres = movie?.genres?.map((g) => g.name) || [];

    // Build watchlist data
    const watchlistData = movie && {
        id: movie.id,
        title: movie.title,
        image: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(movie.title),
        rating: movie.vote_average?.toFixed(1),
        year: movie.release_date?.slice(0, 4),
        extra: genres,
    };

    // Extract cast and crew
    const cast = credits?.cast?.slice(0, 10) || [];
    const crew = credits?.crew?.slice(0, 5) || [];

    // Handle add to watchlist
    const handleAddToWatchlist = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        addToWatchlist({ id: movie.id, type: 'MOVIE' });
    };

    // Handle login success and add to watchlist
    const handleLoginSuccess = () => {
        addToWatchlist({ id: movie.id, type: 'MOVIE' });
    };

    return {
        // Movie data
        movie,
        genres,
        watchlistData,
        isLoading,
        isError,

        // Trailer
        trailerUrl,
        isLoadingTrailer,

        // Credits
        cast,
        crew,
        isLoadingCredits,
        isErrorCredits,

        // Watchlist
        user,
        addToWatchlist: handleAddToWatchlist,
        loginSuccess: handleLoginSuccess,
        isPending,
        showLoginModal,
        setShowLoginModal,
    };
}
