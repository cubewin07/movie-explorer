import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import FancyLoader from '@/components/ui/FancyLoader';
import ErrorState from '@/components/ui/ErrorState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAuthen } from '@/context/AuthenProvider';
import useAddToWatchlist from '@/hooks/watchList/useAddtoWatchList';
import { LoginNotificationModal } from '@/components/react_components/Modal/LoginNotificationModal';
import { useSeriesData } from '@/components/pages/FilmDetails/TvSeriesDetailPage/useSeriesData';

import SeriesInfoSection from './SeriesInfoSection';
import SeriesStatsSection from './SeriesStatsSection';
import CastCrewSection from './CastCrewSection';
import SeasonsSection from './SeasonsSection';
import SeriesReviewsSection from './SeriesReviewsSection';
import DetailsSection from './DetailsSection';

export default function TvSeriesDetailPage() {
    const { id } = useParams();
    const { user, token } = useAuthen();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [openSeason, setOpenSeason] = useState(null);

    // Use the extracted hook
    const {
        series,
        isLoading,
        isError,
        trailerUrl,
        isLoadingTrailer,
        cast,
        crew,
        isLoadingCredits,
        isErrorCredits,
        watchlistData,
    } = useSeriesData(id);

    const { mutate: addToWatchlist, isPending } = useAddToWatchlist(token);

    const handleAddToWatchlist = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        addToWatchlist({ id: series.id, type: 'SERIES' });
    };

    const handleLoginSuccess = () => {
        addToWatchlist({ id: series.id, type: 'SERIES' });
    };

    if (isLoading) {
        return <FancyLoader type="tv" />;
    }

    if (isError || !series) {
        return (
            <ErrorState 
                title="TV Series Not Found"
                message="Failed to load TV series details"
                subtitle="The TV series you're looking for might not exist or there was a connection issue"
            />
        );
    }

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
                    src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`}
                    alt={series.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent" />
            </motion.div>

            {/* Series Info Section */}
            <SeriesInfoSection
                series={series}
                trailerUrl={trailerUrl}
                isLoadingTrailer={isLoadingTrailer}
                onAddToWatchlist={handleAddToWatchlist}
                onWatchlistPending={isPending}
            />

            {/* Tabs */}
            <div className="p-2 sm:p-4 md:p-8">
                <Tabs defaultValue="overview">
                    <TabsList className="grid grid-cols-2 md:grid-cols-6 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6 overflow-x-auto">
                        <TabsTrigger
                            value="overview"
                            className="hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="episodes"
                            className="hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                        >
                            Episodes
                        </TabsTrigger>
                        <TabsTrigger
                            value="cast"
                            className="hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                        >
                            Cast & Crew
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
                        <SeriesStatsSection series={series} />
                    </TabsContent>

                    {/* Episodes Tab */}
                    <TabsContent value="episodes">
                        <SeasonsSection
                            seasons={series.seasons}
                            tvId={series.id}
                            openSeason={openSeason}
                            onToggleSeason={setOpenSeason}
                        />
                    </TabsContent>

                    {/* Cast & Crew Tab */}
                    <TabsContent value="cast">
                        <div className="mt-4">
                            <CastCrewSection
                                cast={cast}
                                crew={crew}
                                isLoadingCredits={isLoadingCredits}
                                isErrorCredits={isErrorCredits}
                            />
                        </div>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews">
                        <SeriesReviewsSection filmId={id} />
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details">
                        <DetailsSection series={series} />
                    </TabsContent>

                    {/* Similar Tab */}
                    <TabsContent value="similar">
                        <p className="text-slate-600 dark:text-slate-300">Similar shows coming soon.</p>
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
