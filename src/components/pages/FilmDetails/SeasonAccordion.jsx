import { useState } from 'react';
import { useSeasonDetails } from '@/hooks/API/data';
import { Skeleton } from '@/components/ui/skeleton';
import EpisodeModal from './EpisodeModal';

export default function SeasonAccordion({ tvId, seasonNumber, season }) {
    const [open, setOpen] = useState(false);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const { episodes, isLoading } = useSeasonDetails(tvId, seasonNumber, open);

    return (
        <>
            <div className="collapse collapse-arrow bg-slate-100 dark:bg-slate-800">
                <input type="checkbox" onChange={() => setOpen(!open)} />
                <div className="collapse-title font-medium">
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
                            {episodes?.map((ep) => (
                                <div
                                    key={ep.id}
                                    className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                    onClick={() => setSelectedEpisode(ep)}
                                >
                                    <div className="flex gap-4">
                                        <img
                                            src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                            alt={ep.name}
                                            className="w-32 h-20 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-base">
                                                {ep.episode_number}. {ep.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {ep.overview || 'No description.'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Air Date: {ep.air_date} • {ep.runtime || 'N/A'} min
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Episode Modal */}
            <EpisodeModal
                open={!!selectedEpisode}
                onOpenChange={() => setSelectedEpisode(null)}
                episode={selectedEpisode}
            />
        </>
    );
}
