// Updated SeasonAccordion.jsx
import { useState } from 'react';
import { useSeasonDetails } from '@/hooks/API/data';
import { Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SeasonAccordion({ tvId, seasonNumber, season }) {
    const [open, setOpen] = useState(false);
    const { episodes, isLoading } = useSeasonDetails(tvId, seasonNumber, open);

    return (
        <div className="collapse collapse-arrow bg-slate-100 dark:bg-slate-800">
            <input type="checkbox" onChange={() => setOpen(!open)} />
            <div className="collapse-title font-medium">
                Season {season.season_number} ({season.air_date?.slice(0, 4)})
            </div>
            <div className="collapse-content">
                {isLoading ? (
                    <p>Loading episodes...</p>
                ) : (
                    <div className="space-y-4">
                        {episodes?.map((ep) => (
                            <Link
                                key={ep.id}
                                to={`/tv/${tvId}/season/${seasonNumber}/episode/${ep.episode_number}`}
                                className="block rounded-lg bg-slate-200/60 dark:bg-slate-700 hover:bg-slate-300/60 dark:hover:bg-slate-600 transition p-4 flex gap-4"
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w154${ep.still_path}`}
                                    alt={ep.name}
                                    className="w-28 h-16 object-cover rounded-md"
                                />

                                <div className="flex-1 space-y-1">
                                    <h4 className="font-semibold text-sm sm:text-base">
                                        {ep.episode_number}. {ep.name}
                                    </h4>

                                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                        {ep.overview || 'No description.'}
                                    </p>

                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-3 pt-1">
                                        {ep.air_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" /> {ep.air_date}
                                            </span>
                                        )}
                                        {ep.runtime && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" /> {ep.runtime} min
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
