import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * EpisodeSelector Modal Component
 * Allows users to select which season/episode to review or review the whole series
 * Features:
 * - Season dropdown selection
 * - Episode selection within season
 * - Whole series option
 * - Error shaking animation if user tries to submit without selecting
 */
export default function EpisodeSelector({
    seasons,
    onSelect,
    onClose,
    open = true,
}) {
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const [showError, setShowError] = useState(false);
    const [selectionType, setSelectionType] = useState(null); // 'whole' or 'specific'

    const currentSeason = selectedSeason 
        ? seasons?.find(s => s.season_number === selectedSeason)
        : null;

    const handleWholeSeries = () => {
        onSelect({
            type: 'whole',
            seriesId: null,
        });
        onClose?.();
    };

    const handleSelectEpisode = () => {
        if (!selectedSeason || !selectedEpisode) {
            setShowError(true);
            setTimeout(() => setShowError(false), 500);
            return;
        }

        onSelect({
            type: 'specific',
            seasonNumber: selectedSeason,
            episodeNumber: selectedEpisode,
            seriesId: null,
        });
        onClose?.();
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Choose Episode
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                Select an episode to review, or review the whole series.
                            </p>

                            {/* Whole Series Option */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleWholeSeries}
                                className="w-full p-4 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-left"
                            >
                                <div className="font-semibold text-blue-900 dark:text-blue-300">
                                    📺 Review the Whole Series
                                </div>
                                <div className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                    Share your thoughts about the entire series
                                </div>
                            </motion.button>

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                <span className="text-sm text-slate-500">OR</span>
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                            </div>

                            {/* Season Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Select Season
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedSeason || ''}
                                        onChange={(e) => {
                                            setSelectedSeason(e.target.value ? Number(e.target.value) : null);
                                            setSelectedEpisode(null);
                                            setSelectionType('specific');
                                        }}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Choose a season...</option>
                                        {seasons?.map((season) => (
                                            <option key={season.id} value={season.season_number}>
                                                Season {season.season_number} ({season.episode_count} episodes)
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Episode Selection */}
                            {selectedSeason && currentSeason && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-2"
                                >
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Select Episode
                                    </label>
                                    <div className="relative max-h-48 overflow-y-auto rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                                        {Array.from({ length: currentSeason.episode_count || 0 }, (_, i) => i + 1).map((epNum) => (
                                            <motion.button
                                                key={epNum}
                                                whileHover={{ backgroundColor: 'var(--hover-bg)' }}
                                                onClick={() => setSelectedEpisode(epNum)}
                                                className={`w-full px-4 py-3 text-left border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-colors ${
                                                    selectedEpisode === epNum
                                                        ? 'bg-blue-100 dark:bg-blue-900/50 font-semibold text-blue-900 dark:text-blue-300'
                                                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">
                                                        S{String(selectedSeason).padStart(2, '0')}E{String(epNum).padStart(2, '0')}
                                                    </span>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Error State - Shaking animation */}
                            {showError && !selectedEpisode && selectedSeason && (
                                <motion.div
                                    animate={{ x: [-10, 10, -10, 10, 0] }}
                                    transition={{ duration: 0.4 }}
                                    className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg"
                                >
                                    <p className="text-sm text-red-700 dark:text-red-400">
                                        ⚠️ Please select an episode to continue
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            {selectedSeason && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex-1"
                                >
                                    <Button
                                        onClick={handleSelectEpisode}
                                        disabled={!selectedEpisode}
                                        className="w-full"
                                    >
                                        {selectedEpisode
                                            ? `Review Episode ${selectedEpisode}`
                                            : 'Select Episode'}
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
