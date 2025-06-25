import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import EpisodeModal from './EpisodeModal';
import { useSeasonDetails } from '@/hooks/API/data';

export default function SeasonAccordion({ tvId, seasonNumber, season }) {
    const [open, setOpen] = useState(false);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const { episodes, isLoading } = useSeasonDetails(tvId, seasonNumber, open);

    return (
        <TooltipProvider>
            <>
                <div className="collapse collapse-arrow border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-sm">
                    <input type="checkbox" onChange={() => setOpen(!open)} />
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
                                    const isComingSoon = !ep.still_path;

                                    const episodeCard = (
                                        <div
                                            key={ep.id}
                                            onClick={() => {
                                                if (!isComingSoon) setSelectedEpisode(ep);
                                            }}
                                            className={`
                                                flex gap-4 p-3 rounded-lg border transition cursor-pointer
                                                border-slate-200 dark:border-slate-700 
                                                bg-slate-50 dark:bg-slate-800 
                                                hover:bg-slate-100 dark:hover:bg-slate-700
                                                ${isComingSoon ? 'opacity-90' : ''}
                                            `}
                                        >
                                            <div className="w-32 h-20 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded">
                                                {isComingSoon ? (
                                                    <span className="text-xs font-medium text-yellow-700">
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
                                                <h4 className="font-semibold text-base">
                                                    {ep.episode_number}. {ep.name}
                                                </h4>
                                                <p className="text-xs line-clamp-2 text-slate-600 dark:text-slate-400">
                                                    {ep.overview || 'No description.'}
                                                </p>
                                                <p
                                                    className={`text-xs mt-1 flex items-center gap-1 ${
                                                        isComingSoon
                                                            ? 'font-semibold text-yellow-900 bg-yellow-200 px-2 py-1 rounded w-fit'
                                                            : 'text-slate-500'
                                                    }`}
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                    Air Date: {ep.air_date}
                                                    {!isComingSoon && <> • {ep.runtime || 'N/A'} min</>}
                                                </p>
                                            </div>
                                        </div>
                                    );

                                    return isComingSoon ? (
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
