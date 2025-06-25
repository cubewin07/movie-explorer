// EpisodeModal.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Star, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function EpisodeModal({ open, onClose, episode }) {
    const [showStars, setShowStars] = useState(false);
    if (!episode) return null;

    const trailer = episode.videos?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose();
            }}
        >
            <DialogContent
                className="w-full max-w-screen-sm md:max-w-2xl lg:max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white 
             rounded-2xl p-4 sm:p-6 
             max-h-[90vh] overflow-y-auto"
            >
                {/* Banner */}
                {episode.still_path && (
                    <img
                        src={`https://image.tmdb.org/t/p/original${episode.still_path}`}
                        alt={episode.name}
                        className="w-full h-auto rounded-xl object-cover mb-4"
                    />
                )}
                <DialogHeader className="space-y-1">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                        <DialogTitle className="text-2xl sm:text-3xl font-bold">
                            {episode.episode_number}. {episode.name}
                        </DialogTitle>
                        {episode.vote_average && (
                            <span className="bg-yellow-400 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded shadow">
                                ⭐ {episode.vote_average.toFixed(1)}
                            </span>
                        )}
                    </div>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                        Air Date: {episode.air_date} | Runtime: {episode.runtime || 'N/A'} min
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-6">
                    <div>
                        <p className="text-sm sm:text-base leading-relaxed">
                            {episode.overview || 'No description available.'}
                        </p>
                        {trailer && (
                            <button
                                onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                                className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                            >
                                <PlayCircle className="w-5 h-5" /> Watch Trailer
                            </button>
                        )}
                    </div>

                    {/* Toggleable Guest Stars */}
                    {episode.guest_stars?.some((star) => star.profile_path) && (
                        <div>
                            <h4 className="font-semibold text-base sm:text-lg mb-4">Guest Stars</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {episode.guest_stars
                                    .filter((star) => star.profile_path) // ✅ Skip stars without images
                                    .map((star) => (
                                        <div
                                            key={star.id}
                                            className="flex flex-col items-center text-center gap-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                                        >
                                            <img
                                                src={`https://image.tmdb.org/t/p/w185${star.profile_path}`}
                                                alt={star.name}
                                                className="w-16 h-16 object-cover rounded-full border border-slate-300 dark:border-slate-700"
                                            />
                                            <div className="text-sm font-medium">{star.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate w-full">
                                                {star.character}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
