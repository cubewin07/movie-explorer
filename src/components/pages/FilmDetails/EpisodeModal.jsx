// components/EpisodeModal.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function EpisodeModal({ open, onOpenChange, episode }) {
    if (!episode) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        Episode {episode.episode_number}: {episode.name}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <img
                        src={`https://image.tmdb.org/t/p/w780${episode.still_path}`}
                        alt={episode.name}
                        className="w-full h-auto rounded-lg"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                        {episode.overview || 'No description.'}
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1">
                        <li>Air Date: {episode.air_date}</li>
                        <li>Runtime: {episode.runtime || 'N/A'} min</li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    );
}
