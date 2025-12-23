import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EpisodeCard from './EpisodeCard';
import EpisodeSkeleton from './EpisodeSkeleton';
import EpisodeModal from '../EpisodeModal';
import { useSeasonDetails } from '@/hooks/API/data';

export default function SeasonAccordion({ tvId, seasonNumber, season, open, onToggle }) {
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const { episodes, isLoading } = useSeasonDetails(tvId, seasonNumber, open);

  return (
    <>
      <motion.div
        className="collapse collapse-arrow border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 text-slate-900 dark:text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <input type="checkbox" checked={open} onChange={onToggle} />
        <div className="collapse-title font-bold text-lg sm:text-xl bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <span>Season {season.season_number}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>({season.air_date?.slice(0, 4)})</span>
          </div>
        </div>
        <div className="collapse-content pt-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <EpisodeSkeleton key={i} index={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="grid md:grid-cols-2 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {episodes?.map((ep, index) => (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    index={index}
                    isClickable={!!ep.still_path}
                    onEpisodeClick={setSelectedEpisode}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <EpisodeModal
        open={!!selectedEpisode}
        onClose={() => setSelectedEpisode(null)}
        episode={selectedEpisode}
      />
    </>
  );
}
