// MovieDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useMovieDetails, useMovieTrailer, useMovieCredits } from '@/hooks/API/data';
import { Play, Plus, Share, Heart, Star, Clock, Calendar, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/ui/Loader';
import FancyLoader from '@/components/ui/FancyLoader';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import useAddToWatchlist from '@/hooks/watchList/useAddtoWatchList';
import { useAuthen } from '@/context/AuthenProvider';
import { useState } from 'react';
import { LoginNotificationModal } from '@/components/react_components/Modal/LoginNotificationModal';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';

export default function MovieDetailPage() {
    const { id } = useParams();
    const { user } = useAuthen();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { movie, isLoading, isError } = useMovieDetails(id);
    const { trailerUrl, isLoadingTrailer } = useMovieTrailer(id);
    const genres = movie?.genres?.map((g) => g.name) || [];
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

    // Fetch credits (cast & crew)
    const { credits, isLoading: isLoadingCredits, isError: isErrorCredits } = useMovieCredits(id);
    const cast = credits?.cast?.slice(0, 10) || [];
    const crew = credits?.crew?.slice(0, 5) || [];

    const { mutate: addToWatchlist, isPending } = useAddToWatchlist(user?.email, 'movie');

    const handleAddToWatchlist = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        addToWatchlist(movie.id);
    };

    const handleLoginSuccess = () => {
        addToWatchlist(movie.id);
    };

    if (isLoading) return <FancyLoader type="movie" />;
    if (isError || !movie) return (
        <ErrorState 
            title="Movie Not Found"
            message="Failed to load movie details"
            subtitle="The movie you're looking for might not exist or there was a connection issue"
        />
    );

    return (
        <div className="flex-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-y-auto mx-auto px-2 sm:px-4 md:px-8 rounded-lg">
            {/* Backdrop */}
            <motion.div
                className="relative h-64 sm:h-96 md:h-[500px] overflow-hidden"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <img
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent" />
            </motion.div>

            {/* Poster + Info */}
            <motion.div
                className="p-4 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 -mt-32 sm:-mt-40 md:-mt-48 relative z-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={{
                    hidden: { opacity: 0, y: 40 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: { type: 'spring', stiffness: 120, damping: 18, staggerChildren: 0.15 },
                    },
                }}
            >
                <motion.div
                    className="flex items-center justify-center w-32 sm:w-48 md:w-60 h-48 sm:h-72 md:h-90 rounded-xl bg-gray-100 dark:bg-slate-800 shadow-2xl border border-white dark:border-slate-700 mx-auto md:mx-0"
                    initial={{ opacity: 0, x: -30, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <img
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        alt={movie.title}
                        className="object-cover w-full h-full rounded-xl my-auto"
                    />
                </motion.div>

                <motion.div
                    className="flex-1 space-y-4"
                    initial={{ opacity: 0, x: 30, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                >
                    <motion.h1
                        className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {movie.title}
                    </motion.h1>

                    <motion.div
                        className="flex flex-wrap items-center gap-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                    >
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{movie.release_date?.slice(0, 4)}</span>
                        </div>
                        <span className="opacity-60">•</span>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{movie.runtime} min</span>
                        </div>
                        <span className="opacity-60">•</span>
                        <div className="flex items-center gap-1 uppercase tracking-wide">
                            <span>{movie.original_language}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                        <span className="text-lg font-bold">{movie.vote_average?.toFixed(1)}</span>
                        <span className="text-slate-400">/10</span>
                    </motion.div>

                    <motion.div
                        className="flex flex-wrap gap-2"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: {
                                transition: { staggerChildren: 0.08 },
                            },
                        }}
                    >
                        {movie.genres.map((g) => (
                            <motion.div
                                key={g.id}
                                className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs px-2 py-1 rounded"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {g.name}
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.p
                        className="text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-3xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        {movie.overview}
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row flex-wrap gap-3 pt-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Button
                            className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-emerald-700 hover:to-emerald-800 shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out text-white px-6 py-2 text-sm sm:text-base w-full sm:w-auto"
                            onClick={() => window.open(trailerUrl, '_blank')}
                            disabled={!trailerUrl || isLoadingTrailer}
                        >
                            <Play className="w-4 h-4 mr-2" /> Watch Trailer
                        </Button>

                        <Button
                            variant="outline"
                            className="border-slate-400 dark:border-slate-600 text-slate-800 dark:text-white hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-800 dark:hover:text-white disabled:bg-blue-100 disabled:text-blue-800 px-6 py-2 text-sm sm:text-base w-full sm:w-auto"
                            onClick={handleAddToWatchlist}
                            disabled={isPending}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add to Watchlist
                        </Button>

                        <Button
                            variant="outline"
                            className="border-slate-400 dark:border-slate-600 text-slate-800 dark:text-white hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-800 dark:hover:text-white px-6 py-2 text-sm sm:text-base w-full sm:w-auto"
                        >
                            <Share className="w-4 h-4 mr-2" /> Share
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>

            <div className="p-2 sm:p-4 md:p-8">
                <Tabs defaultValue="overview">
                    <TabsList className="grid grid-cols-3 md:grid-cols-6 bg-slate-200 dark:bg-slate-800  mb-6 overflow-x-auto rounded-lg">
                        <TabsTrigger
                            value="overview"
                            className="hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="cast"
                            className="hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                        >
                            Cast
                        </TabsTrigger>
                        <TabsTrigger
                            value="crew"
                            className="hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                        >
                            Crew
                        </TabsTrigger>
                        <TabsTrigger
                            value="reviews"
                            className="hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                        >
                            Reviews
                        </TabsTrigger>
                        <TabsTrigger
                            value="details"
                            className="hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                        >
                            Details
                        </TabsTrigger>
                        <TabsTrigger
                            value="similar"
                            className="hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                        >
                            Similar
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="space-y-6"
                        >
                            {/* Story Section */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-blue-200 dark:border-slate-600 shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <Star className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Story</h3>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                                    {movie.overview || "No overview available for this movie."}
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <motion.div 
                                    className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700 shadow-md hover:shadow-lg transition-shadow"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Rating</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {movie.vote_average?.toFixed(1) || 'N/A'}
                                    </p>
                                </motion.div>

                                <motion.div 
                                    className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 shadow-md hover:shadow-lg transition-shadow"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Votes</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {movie.vote_count?.toLocaleString() || 'N/A'}
                                    </p>
                                </motion.div>

                                <motion.div 
                                    className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700 shadow-md hover:shadow-lg transition-shadow"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Runtime</span>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {movie.runtime ? `${movie.runtime}m` : 'N/A'}
                                    </p>
                                </motion.div>

                                <motion.div 
                                    className="bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-rose-200 dark:border-rose-700 shadow-md hover:shadow-lg transition-shadow"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-rose-500" />
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Year</span>
                                    </div>
                                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                        {movie.release_date?.slice(0, 4) || 'N/A'}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Genres */}
                            {genres.length > 0 && (
                                <div className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600 shadow-lg">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <div className="p-1 bg-slate-500 rounded">
                                            <Star className="w-4 h-4 text-white" />
                                        </div>
                                        Genres
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {genres.map((genre, index) => (
                                            <motion.span
                                                key={genre}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow cursor-default"
                                            >
                                                {genre}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </TabsContent>
                    <TabsContent value="cast">
                        {isLoadingCredits ? (
                            <LoadingState 
                                title="Loading Cast"
                                subtitle="Getting cast information..."
                                fullScreen={false}
                                className="py-8"
                            />
                        ) : isErrorCredits ? (
                            <ErrorState 
                                title="Cast Not Available"
                                message="Failed to load cast information"
                                subtitle="There was an issue loading the cast details"
                                fullScreen={false}
                                showHomeButton={false}
                                retryText="Retry"
                                className="py-8"
                            />
                        ) : cast.length === 0 ? (
                            <div className="py-6 text-muted-foreground">No cast info.</div>
                        ) : (
                            <motion.ul
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                {cast.map((person) => (
                                    <motion.li
                                        key={person.id}
                                        className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-3 shadow transition hover:bg-blue-100 hover:shadow-lg hover:border-blue-400 dark:hover:bg-slate-700 dark:hover:border-blue-400 text-slate-900 dark:text-white border border-transparent"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {person.profile_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                                alt={person.name}
                                                className="w-14 h-14 rounded-full object-cover mb-2 border-2 border-blue-200 dark:border-blue-700 shadow"
                                            />
                                        ) : (
                                            <User className="w-14 h-14 mb-2 text-blue-400 bg-blue-100 dark:bg-blue-900 rounded-full p-2" />
                                        )}
                                        <span className="font-semibold text-sm text-center truncate w-full">
                                            {person.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground text-center truncate w-full">
                                            {person.character}
                                        </span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                    </TabsContent>
                    <TabsContent value="crew">
                        {isLoadingCredits ? (
                            <LoadingState 
                                title="Loading Crew"
                                subtitle="Getting crew information..."
                                fullScreen={false}
                                className="py-8"
                            />
                        ) : isErrorCredits ? (
                            <ErrorState 
                                title="Crew Not Available"
                                message="Failed to load crew information"
                                subtitle="There was an issue loading the crew details"
                                fullScreen={false}
                                showHomeButton={false}
                                retryText="Retry"
                                className="py-8"
                            />
                        ) : crew.length === 0 ? (
                            <div className="py-6 text-muted-foreground">No crew info.</div>
                        ) : (
                            <motion.ul
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                {crew.map((person) => (
                                    <motion.li
                                        key={person.id}
                                        className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-3 shadow transition hover:bg-blue-100 hover:shadow-lg hover:border-blue-400 dark:hover:bg-slate-700 dark:hover:border-blue-400 text-slate-900 dark:text-white border border-transparent"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {person.profile_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                                alt={person.name}
                                                className="w-14 h-14 rounded-full object-cover mb-2 border-2 border-indigo-200 dark:border-indigo-700 shadow"
                                            />
                                        ) : (
                                            <User className="w-14 h-14 mb-2 text-indigo-400 bg-indigo-100 dark:bg-indigo-900 rounded-full p-2" />
                                        )}
                                        <span className="font-semibold text-sm text-center truncate w-full">
                                            {person.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground text-center truncate w-full">
                                            {person.job}
                                        </span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                    </TabsContent>
                    <TabsContent value="reviews">
                        <p>Reviews placeholder.</p>
                    </TabsContent>
                    <TabsContent value="details">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="space-y-6"
                        >
                            {/* Financial Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div 
                                    className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700 shadow-lg hover:shadow-xl transition-shadow"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-emerald-500 rounded-lg">
                                            <Star className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Budget</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {movie.budget ? `$${movie.budget.toLocaleString()}` : 'Not Available'}
                                    </p>
                                    <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-2">
                                        Production Budget
                                    </p>
                                </motion.div>

                                <motion.div 
                                    className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-shadow"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-blue-500 rounded-lg">
                                            <Star className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Revenue</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'Not Available'}
                                    </p>
                                    <p className="text-sm text-blue-600/70 dark:text-blue-400/70 mt-2">
                                        Box Office Revenue
                                    </p>
                                </motion.div>
                            </div>

                            {/* Movie Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div 
                                    className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-shadow"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-purple-500 rounded-lg">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300">Language</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {movie.original_language?.toUpperCase() || 'N/A'}
                                    </p>
                                    <p className="text-sm text-purple-600/70 dark:text-purple-400/70 mt-2">
                                        Original Language
                                    </p>
                                </motion.div>

                                <motion.div 
                                    className="bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-rose-200 dark:border-rose-700 shadow-lg hover:shadow-xl transition-shadow"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-rose-500 rounded-lg">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-rose-800 dark:text-rose-300">Release Date</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                        {movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        }) : 'Not Available'}
                                    </p>
                                    <p className="text-sm text-rose-600/70 dark:text-rose-400/70 mt-2">
                                        Theatrical Release
                                    </p>
                                </motion.div>
                            </div>

                            {/* Additional Stats */}
                            {(movie.budget > 0 && movie.revenue > 0) && (
                                <motion.div 
                                    className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700 shadow-lg"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-amber-500 rounded-lg">
                                            <Star className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300">Profit Analysis</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                                ${(movie.revenue - movie.budget).toLocaleString()}
                                            </p>
                                            <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Net Profit</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                                {((movie.revenue / movie.budget) * 100).toFixed(0)}%
                                            </p>
                                            <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Return on Investment</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Production Companies */}
                            {movie.production_companies && movie.production_companies.length > 0 && (
                                <motion.div 
                                    className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600 shadow-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-slate-500 rounded-lg">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-300">Production Companies</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {movie.production_companies.slice(0, 5).map((company, index) => (
                                            <motion.div
                                                key={company.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-center gap-2 bg-white dark:bg-slate-600 px-3 py-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-500"
                                            >
                                                {company.logo_path && (
                                                    <img 
                                                        src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                                                        alt={company.name}
                                                        className="w-6 h-6 object-contain"
                                                    />
                                                )}
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {company.name}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </TabsContent>
                    <TabsContent value="similar">
                        <p>Similar movies coming soon.</p>
                    </TabsContent>
                </Tabs>
            </div>

            {showLoginModal && (
                <LoginNotificationModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </div>
    );
}
