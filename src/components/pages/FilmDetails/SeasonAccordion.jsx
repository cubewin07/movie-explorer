// SeasonAccordion.jsx
import { useState } from 'react';
import { useSeasonDetails } from '@/hooks/API/data';

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
                    <div className="space-y-3">
                        {episodes?.map((ep) => (
                            <div key={ep.id} className="border-b pb-2">
                                <h4 className="font-semibold">
                                    {ep.episode_number}. {ep.name}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {ep.overview || 'No description.'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
