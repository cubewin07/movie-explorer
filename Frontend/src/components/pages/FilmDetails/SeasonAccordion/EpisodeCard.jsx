import { Calendar, Clock, Play, Star, Eye } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import {
  isImageMissing,
  isFutureDate,
  getEpisodeCardStyles,
  getDateTimeTextClass,
  getEpisodeImageUrl,
  getEpisodeBadgeConfig,
  formatEpisodeName,
  getEpisodeOverview,
} from './episodeUtils';

const iconMap = {
  Clock,
  Star,
  Eye,
  Play,
  Calendar,
};

export default function EpisodeCard({ episode, index, isClickable, onEpisodeClick }) {
  const isMissing = isImageMissing(episode);
  const isFuture = isFutureDate(episode.air_date);
  const cardStyles = getEpisodeCardStyles(episode);
  const dateTimeClass = getDateTimeTextClass(episode);
  const badgeConfig = getEpisodeBadgeConfig(episode);

  const BadgeIcon = badgeConfig ? iconMap[badgeConfig.icon] : null;

  const episodeCard = (
    <motion.div
      onClick={() => {
        if (!isMissing) onEpisodeClick(episode);
      }}
      className={`
        group relative flex gap-4 p-4 rounded-2xl border-2 transition-all duration-300 transform
        ${isMissing ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] hover:-translate-y-1'}
        ${cardStyles.borderClass}
        ${cardStyles.bgClass}
        shadow-lg ${cardStyles.shadowClass} backdrop-blur-sm
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: isMissing ? 1 : 1.02 }}
      whileTap={{ scale: isMissing ? 1 : 0.98 }}
    >
      {/* Episode Image */}
      <div className="relative w-36 h-24 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl overflow-hidden shadow-inner">
        {isMissing && !isFuture ? (
          <div className="relative w-full h-full">
            <img
              src="/no-image-available.png"
              alt="No image available"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent"></div>
          </div>
        ) : isFuture ? (
          <div className="flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-300">
            <Clock className="w-8 h-8 mb-1 animate-pulse" />
            <span className="font-bold text-xs text-center leading-tight">
              Coming<br />Soon
            </span>
          </div>
        ) : (
          <div className="relative w-full h-full group">
            <img
              src={getEpisodeImageUrl(episode.still_path)}
              alt={episode.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Play className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </div>
        )}
      </div>

      {/* Episode Content */}
      <div className="flex-1 space-y-3">
        {/* Header with badge and rating */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {badgeConfig && (
              <motion.span
                className={`inline-flex items-center gap-1 mb-2 text-xs font-bold px-3 py-1 rounded-full shadow-sm ${badgeConfig.class}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
                {badgeConfig.label}
              </motion.span>
            )}
          </div>
          {episode.vote_average > 0 && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {episode.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Title and Overview */}
        <div>
          <h4 className="font-bold text-lg leading-tight mb-1 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            {formatEpisodeName(episode)}
          </h4>
          <p className="text-sm line-clamp-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            {getEpisodeOverview(episode.overview)}
          </p>
        </div>

        {/* Footer with metadata */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-4 text-xs">
            <div className={`flex items-center gap-1 ${dateTimeClass}`}>
              <Calendar className="w-3 h-3" />
              <span>{episode.air_date || 'TBA'}</span>
            </div>
            {!isMissing && episode.runtime && (
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{episode.runtime} min</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return isMissing ? (
    <Tooltip>
      <TooltipTrigger asChild>{episodeCard}</TooltipTrigger>
      <TooltipContent side="top">Episode not yet released</TooltipContent>
    </Tooltip>
  ) : (
    episodeCard
  );
}
