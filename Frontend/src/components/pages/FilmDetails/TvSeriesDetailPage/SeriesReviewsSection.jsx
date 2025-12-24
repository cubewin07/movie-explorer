import { useState } from 'react';
import Reviews from '@/components/react_components/Reviews/Reviews';
import EpisodeSelector from './EpisodeSelector';

/**
 * SeriesReviewsSection Component
 * Specialized review section for TV series
 * - Prompts user to select season/episode before reviewing
 * - Supports whole series reviews
 * - Prevents accidental full-series reviews with modal confirmation
 */
export default function SeriesReviewsSection({ seriesId, seasons }) {
    const [showSelector, setShowSelector] = useState(true);
    const [selectedEpisode, setSelectedEpisode] = useState(null);

    const handleEpisodeSelect = (selection) => {
        setSelectedEpisode(selection);
        setShowSelector(false);
    };

    const handleChangeEpisode = () => {
        setShowSelector(true);
        setSelectedEpisode(null);
    };

    // If no episode selected, show modal
    if (showSelector) {
        return (
            <EpisodeSelector
                seasons={seasons}
                onSelect={handleEpisodeSelect}
                onClose={() => setShowSelector(false)}
                open={true}
            />
        );
    }

    // If episode selected, show reviews with the appropriate filmId
    if (selectedEpisode) {
        const filmId = selectedEpisode.type === 'whole'
            ? `series-${seriesId}`
            : `series-${seriesId}-s${selectedEpisode.seasonNumber}-e${selectedEpisode.episodeNumber}`;

        return (
            <div className="space-y-4">
                {/* Episode Context Display */}
                {selectedEpisode.type === 'specific' && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                📺 Reviewing Episode
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
                )}

                {selectedEpisode.type === 'whole' && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
                                📺 Reviewing Whole Series
                            </p>
                            <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                All Seasons & Episodes
                            </p>
                        </div>
                        <button
                            onClick={handleChangeEpisode}
                            className="px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 font-medium transition-colors text-sm"
                        >
                            Change
                        </button>
                    </div>
                )}

                {/* Reviews Component */}
                <Reviews filmId={filmId} type="SERIES" />
            </div>
        );
    }

    return null;
}
