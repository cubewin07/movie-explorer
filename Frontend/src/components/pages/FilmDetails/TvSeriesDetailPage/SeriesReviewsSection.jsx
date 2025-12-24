import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Reviews from '@/components/react_components/Reviews/Reviews';
import EpisodeSelector from './EpisodeSelector';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

/**
 * SeriesReviewsSection Component
 * Specialized review section for TV series
 * - Users can read whole series reviews immediately
 * - Tabs for switching between series reviews and episode reviews
 * - Episode selector modal only appears when user wants to WRITE a review for a specific episode
 * - Prevents accidental reviews by requiring deliberate selection without defaults
 * - Passes numeric seriesId and episodeMetadata directly to Reviews component
 */
export default function SeriesReviewsSection({ seriesId, seasons }) {
    const [activeTab, setActiveTab] = useState('series');
    const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
    const [selectedEpisode, setSelectedEpisode] = useState(null);

    const handleEpisodeSelect = (selection) => {
        // Set selected episode when user chooses from modal
        setSelectedEpisode({
            type: selection.type,
            seasonNumber: selection.seasonNumber,
            episodeNumber: selection.episodeNumber,
        });
        setShowEpisodeSelector(false);
    };

    const handleStartEpisodeReview = () => {
        // Open modal when user wants to write a review for specific episode
        setShowEpisodeSelector(true);
    };

    const handleChangeEpisode = () => {
        // Reset selection and open modal again
        setSelectedEpisode(null);
        setShowEpisodeSelector(true);
    };

    // Show episode selector modal if needed
    if (showEpisodeSelector && activeTab === 'episode') {
        return (
            <EpisodeSelector
                seasons={seasons}
                onSelect={handleEpisodeSelect}
                onClose={() => setShowEpisodeSelector(false)}
                open={true}
            />
        );
    }

    return (
        <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="series">📺 Series Reviews</TabsTrigger>
                    <TabsTrigger value="episode">🎬 Episode Reviews</TabsTrigger>
                </TabsList>

                {/* Series Reviews Tab */}
                <TabsContent value="series" className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
                            📺 All Reviews & Episodes
                        </p>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100 mt-1">
                            Entire Series
                        </p>
                    </div>
                    <Reviews 
                        filmId={seriesId} 
                        type="SERIES"
                        episodeMetadata={null}
                    />
                </TabsContent>

                {/* Episode Reviews Tab */}
                <TabsContent value="episode" className="space-y-4">
                    {selectedEpisode ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`episode-${selectedEpisode.seasonNumber}-${selectedEpisode.episodeNumber}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                {/* Episode Context Display */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                            🎬 Specific Episode
                                        </p>
                                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                            Season {String(selectedEpisode.seasonNumber).padStart(2, '0')} • Episode {String(selectedEpisode.episodeNumber).padStart(2, '0')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleChangeEpisode}
                                        className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium transition-colors text-sm"
                                    >
                                        Change
                                    </button>
                                </div>

                                {/* Reviews Component for Specific Episode */}
                                <Reviews 
                                    filmId={seriesId} 
                                    type="SERIES"
                                    episodeMetadata={{
                                        seasonNumber: selectedEpisode.seasonNumber,
                                        episodeNumber: selectedEpisode.episodeNumber,
                                    }}
                                />
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-8 text-center space-y-3">
                            <p className="text-slate-600 dark:text-slate-300">
                                Select a specific episode to view and write reviews
                            </p>
                            <button
                                onClick={handleStartEpisodeReview}
                                className="inline-block px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium transition-colors"
                            >
                                Choose Episode
                            </button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
