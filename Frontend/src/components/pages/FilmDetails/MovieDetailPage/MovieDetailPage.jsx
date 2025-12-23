import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Clock, Calendar, Users } from 'lucide-react';
import FancyLoader from '@/components/ui/FancyLoader';
import ErrorState from '@/components/ui/ErrorState';
import { LoginNotificationModal } from '@/components/react_components/Modal/LoginNotificationModal';
import { motion } from 'framer-motion';

import { useMovieData } from './useMovieData';
import { MovieInfoSection } from './MovieInfoSection';
import { MovieCastCrewSection } from './MovieCastCrewSection';
import { MovieReviewsSection } from './MovieReviewsSection';

/**
 * MovieDetailPage Component
 * Main component for displaying movie details
 * Orchestrates data fetching and section rendering
 */
export default function MovieDetailPage() {
    const { id } = useParams();
    const {
        movie,
        genres,
        isLoading,
        isError,
        trailerUrl,
        isLoadingTrailer,
        cast,
        crew,
        isLoadingCredits,
        isErrorCredits,
        addToWatchlist,
        isPending,
        showLoginModal,
        setShowLoginModal,
        loginSuccess,
    } = useMovieData(id);

    if (isLoading) {
        return <FancyLoader type="movie" />;
    }

    if (isError || !movie) {
        return (
            <ErrorState 
                title="Movie Not Found"
                message="Failed to load movie details"
                subtitle="The movie you're looking for might not exist or there was a connection issue"
            />
        );
    }

    return (
        <div className="flex-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-y-auto mx-auto px-2 sm:px-4 md:px-8 rounded-lg">
            {/* Hero Section with Backdrop & Poster */}
            <MovieInfoSection
                movie={movie}
                genres={genres}
                trailerUrl={trailerUrl}
                isLoadingTrailer={isLoadingTrailer}
                isPending={isPending}
                onAddToWatchlist={addToWatchlist}
            />

            {/* Tabs Content */}
            <div className="p-2 sm:p-4 md:p-8">
                <Tabs defaultValue="overview">
                    <TabsList className="grid grid-cols-3 md:grid-cols-6 bg-slate-200 dark:bg-slate-800 mb-6 overflow-x-auto rounded-lg">
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

                    {/* Overview Tab */}
                    <TabsContent value="overview">
                        <OverviewTab movie={movie} genres={genres} />
                    </TabsContent>

                    {/* Cast & Crew Tab */}
                    <TabsContent value="cast" className="space-y-6">
                        <MovieCastCrewSection
                            isLoadingCredits={isLoadingCredits}
                            isErrorCredits={isErrorCredits}
                            cast={cast}
                            crew={crew}
                        />
                    </TabsContent>

                    {/* Crew Tab (Alternative view for movies) */}
                    <TabsContent value="crew">
                        <div className="text-slate-600 dark:text-slate-300">
                            Crew information displayed in the Cast tab for movies. Check the Cast section above.
                        </div>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews">
                        <MovieReviewsSection filmId={id} />
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details">
                        <DetailsTab movie={movie} />
                    </TabsContent>

                    {/* Similar Tab */}
                    <TabsContent value="similar">
                        <p className="text-slate-600 dark:text-slate-300">Similar movies coming soon.</p>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <LoginNotificationModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={loginSuccess}
                />
            )}
        </div>
    );
}

/**
 * OverviewTab Component
 * Displays story, quick stats, and genres
 */
function OverviewTab({ movie, genres }) {
    return (
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
                <StatCard
                    icon={<Star className="w-4 h-4 text-yellow-500" />}
                    title="Rating"
                    value={movie.vote_average?.toFixed(1) || 'N/A'}
                    bgGradient="from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20"
                    borderColor="border-green-200 dark:border-green-700"
                    textColor="text-green-600 dark:text-green-400"
                />
                <StatCard
                    icon={<Users className="w-4 h-4 text-purple-500" />}
                    title="Votes"
                    value={movie.vote_count?.toLocaleString() || 'N/A'}
                    bgGradient="from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20"
                    borderColor="border-purple-200 dark:border-purple-700"
                    textColor="text-purple-600 dark:text-purple-400"
                />
                <StatCard
                    icon={<Clock className="w-4 h-4 text-orange-500" />}
                    title="Runtime"
                    value={movie.runtime ? `${movie.runtime}m` : 'N/A'}
                    bgGradient="from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20"
                    borderColor="border-orange-200 dark:border-orange-700"
                    textColor="text-orange-600 dark:text-orange-400"
                />
                <StatCard
                    icon={<Calendar className="w-4 h-4 text-rose-500" />}
                    title="Year"
                    value={movie.release_date?.slice(0, 4) || 'N/A'}
                    bgGradient="from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20"
                    borderColor="border-rose-200 dark:border-rose-700"
                    textColor="text-rose-600 dark:text-rose-400"
                />
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
    );
}

/**
 * DetailsTab Component
 * Displays financial info, dates, production companies
 */
function DetailsTab({ movie }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-6"
        >
            {/* Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailsCard
                    icon={<Star className="w-5 h-5 text-white" />}
                    title="Budget"
                    value={movie.budget ? `$${movie.budget.toLocaleString()}` : 'Not Available'}
                    subtitle="Production Budget"
                    bgGradient="from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20"
                    borderColor="border-emerald-200 dark:border-emerald-700"
                    iconBg="bg-emerald-500"
                    textColor="text-emerald-600 dark:text-emerald-400"
                />
                <DetailsCard
                    icon={<Star className="w-5 h-5 text-white" />}
                    title="Revenue"
                    value={movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'Not Available'}
                    subtitle="Box Office Revenue"
                    bgGradient="from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20"
                    borderColor="border-blue-200 dark:border-blue-700"
                    iconBg="bg-blue-500"
                    textColor="text-blue-600 dark:text-blue-400"
                />
            </div>

            {/* Movie Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailsCard
                    icon={<Users className="w-5 h-5 text-white" />}
                    title="Language"
                    value={movie.original_language?.toUpperCase() || 'N/A'}
                    subtitle="Original Language"
                    bgGradient="from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20"
                    borderColor="border-purple-200 dark:border-purple-700"
                    iconBg="bg-purple-500"
                    textColor="text-purple-600 dark:text-purple-400"
                />
                <DetailsCard
                    icon={<Calendar className="w-5 h-5 text-white" />}
                    title="Release Date"
                    value={movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }) : 'Not Available'}
                    subtitle="Theatrical Release"
                    bgGradient="from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20"
                    borderColor="border-rose-200 dark:border-rose-700"
                    iconBg="bg-rose-500"
                    textColor="text-rose-600 dark:text-rose-400"
                />
            </div>

            {/* Profit Analysis */}
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
    );
}

/**
 * StatCard Component
 * Reusable card for displaying statistics
 */
function StatCard({ icon, title, value, bgGradient, borderColor, textColor }) {
    return (
        <motion.div 
            className={`bg-gradient-to-br ${bgGradient} rounded-lg p-4 border ${borderColor} shadow-md hover:shadow-lg transition-shadow`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</span>
            </div>
            <p className={`text-2xl font-bold ${textColor}`}>
                {value}
            </p>
        </motion.div>
    );
}

/**
 * DetailsCard Component
 * Reusable card for displaying detailed information
 */
function DetailsCard({ 
    icon, 
    title, 
    value, 
    subtitle, 
    bgGradient, 
    borderColor, 
    iconBg, 
    textColor 
}) {
    return (
        <motion.div 
            className={`bg-gradient-to-br ${bgGradient} rounded-xl p-6 border ${borderColor} shadow-lg hover:shadow-xl transition-shadow`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 ${iconBg} rounded-lg`}>
                    {icon}
                </div>
                <h3 className={`text-xl font-bold ${textColor.replace('text-', 'text-').split(' ')[0]}-800 dark:${textColor.replace('dark:text-', 'dark:text-').split(' ')[0]}-300`}>
                    {title}
                </h3>
            </div>
            <p className={`text-2xl font-bold ${textColor}`}>
                {value}
            </p>
            <p className={`text-sm ${textColor.replace('dark:', '').split(' ')[0]}/70 dark:${textColor.split(' ').slice(1).join(' ')}/70 mt-2`}>
                {subtitle}
            </p>
        </motion.div>
    );
}
