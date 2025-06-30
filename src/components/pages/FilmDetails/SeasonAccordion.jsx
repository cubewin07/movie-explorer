import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import EpisodeModal from './EpisodeModal';
import { useSeasonDetails } from '@/hooks/API/data';

export default function SeasonAccordion({ tvId, seasonNumber, season, open, onToggle }) {
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const { episodes, isLoading } = useSeasonDetails(tvId, seasonNumber, open);

    const isFutureDate = (dateStr) => {
        if (!dateStr) return false;
        const today = new Date();
        const airDate = new Date(dateStr);
        return airDate > today;
    };

    return (
        <TooltipProvider>
            <>
                <div className="collapse collapse-arrow border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-sm">
                    <input type="checkbox" checked={open} onChange={onToggle} />
                    <div className="collapse-title font-semibold text-base sm:text-lg">
                        Season {season.season_number} ({season.air_date?.slice(0, 4)})
                    </div>
                    <div className="collapse-content">
                        {isLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="w-full h-24 rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {episodes?.map((ep) => {
                                    const isImageMissing = !ep.still_path;
                                    const isFutureEpisode = isFutureDate(ep.air_date);

                                    const episodeCard = (
                                        <div
                                            key={ep.id}
                                            onClick={() => {
                                                if (!isImageMissing) setSelectedEpisode(ep);
                                            }}
                                            className={`
                                                flex gap-4 p-3 rounded-lg border transition
                                                ${isImageMissing ? 'cursor-not-allowed' : 'cursor-pointer'}
                                                border-slate-200 dark:border-slate-700 
                                                ${
                                                    isImageMissing
                                                        ? 'bg-yellow-100 dark:bg-yellow-200/10 text-yellow-900'
                                                        : isFutureEpisode
                                                          ? 'bg-indigo-50 text-indigo-900'
                                                          : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-slate-700 dark:hover:border-slate-500'
                                                }
                                              `}
                                        >
                                            <div className="w-32 h-20 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded">
                                                {isImageMissing && !isFutureEpisode ? (
                                                    <img
                                                        src="/no-image-available.png"
                                                        alt="No image available"
                                                        className="w-32 h-20 object-cover rounded"
                                                    />
                                                ) : isImageMissing && isFutureEpisode ? (
                                                    <span className="text-xs font-medium text-yellow-800">
                                                        Coming Soon
                                                    </span>
                                                ) : (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                                        alt={ep.name}
                                                        className="w-32 h-20 object-cover rounded"
                                                    />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                {isImageMissing && (
                                                    <span className="inline-block mb-1 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded">
                                                        Coming Soon
                                                    </span>
                                                )}
                                                {!isImageMissing && isFutureEpisode && (
                                                    <span className="inline-block mb-1 bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                                                        Airs Soon
                                                    </span>
                                                )}
                                                <h4 className="font-semibold text-base">
                                                    {ep.episode_number}. {ep.name}
                                                </h4>
                                                <p className="text-xs line-clamp-2 text-slate-600 dark:text-slate-400">
                                                    {ep.overview || 'No description.'}
                                                </p>
                                                <p
                                                    className={`text-xs mt-1 flex items-center gap-1 ${
                                                        isImageMissing
                                                            ? 'font-semibold text-yellow-900'
                                                            : isFutureEpisode
                                                              ? 'font-medium text-indigo-800 dark:text-indigo-300'
                                                              : 'text-slate-500'
                                                    }`}
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                    Air Date: {ep.air_date}
                                                    {!isImageMissing && <> • {ep.runtime || 'N/A'} min</>}
                                                </p>
                                            </div>
                                        </div>
                                    );

                                    return isImageMissing ? (
                                        <Tooltip key={ep.id}>
                                            <TooltipTrigger asChild>{episodeCard}</TooltipTrigger>
                                            <TooltipContent side="top">Episode not yet released</TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        episodeCard
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <EpisodeModal
                    open={!!selectedEpisode}
                    onClose={() => setSelectedEpisode(null)}
                    episode={selectedEpisode}
                />
            </>
        </TooltipProvider>
    );
}
