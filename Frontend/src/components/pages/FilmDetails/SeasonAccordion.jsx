import { useState } from 'react';
import { Calendar, Clock, Play, Star, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
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
                <motion.div 
                    className="collapse collapse-arrow border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 text-slate-900 dark:text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
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
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <Skeleton className="w-full h-28 rounded-xl bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600" />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    className="grid md:grid-cols-2 gap-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {episodes?.map((ep, index) => {
                                    const isImageMissing = !ep.still_path;
                                    const isFutureEpisode = isFutureDate(ep.air_date);

                                        const episodeCard = (
                                            <motion.div
                                                key={ep.id}
                                                onClick={() => {
                                                    if (!isImageMissing) setSelectedEpisode(ep);
                                                }}
                                                className={`
                                                    group relative flex gap-4 p-4 rounded-2xl border-2 transition-all duration-300 transform
                                                    ${isImageMissing ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] hover:-translate-y-1'}
                                                    ${
                                                        isImageMissing
                                                            ? 'border-amber-200 dark:border-amber-700/50 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10 shadow-amber-100 dark:shadow-amber-900/20'
                                                            : isFutureEpisode
                                                              ? 'border-indigo-200 dark:border-indigo-700/50 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10 shadow-indigo-100 dark:shadow-indigo-900/20'
                                                              : 'border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20'
                                                    }
                                                    shadow-lg backdrop-blur-sm
                                                  `}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                                whileHover={{ scale: isImageMissing ? 1 : 1.02 }}
                                                whileTap={{ scale: isImageMissing ? 1 : 0.98 }}
                                            >
                                                <div className="relative w-36 h-24 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl overflow-hidden shadow-inner">
                                                    {isImageMissing && !isFutureEpisode ? (
                                                        <div className="relative w-full h-full">
                                                            <img
                                                                src="/no-image-available.png"
                                                                alt="No image available"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent"></div>
                                                        </div>
                                                    ) : isFutureEpisode ? (
                                                        <div className="flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-300">
                                                            <Clock className="w-8 h-8 mb-1 animate-pulse" />
                                                            <span className="font-bold text-xs text-center leading-tight">
                                                                Coming<br />Soon
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="relative w-full h-full group">
                                                            <img
                                                                src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                                                alt={ep.name}
                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                <Play className="w-8 h-8 text-white drop-shadow-lg" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            {isImageMissing && (
                                                                <motion.span 
                                                                    className="inline-flex items-center gap-1 mb-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ delay: 0.2 }}
                                                                >
                                                                    <Clock className="w-3 h-3" />
                                                                    Coming Soon
                                                                </motion.span>
                                                            )}
                                                            {!isImageMissing && isFutureEpisode && (
                                                                <motion.span 
                                                                    className="inline-flex items-center gap-1 mb-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ delay: 0.2 }}
                                                                >
                                                                    <Star className="w-3 h-3" />
                                                                    Airs Soon
                                                                </motion.span>
                                                            )}
                                                            {!isImageMissing && !isFutureEpisode && (
                                                                <motion.span 
                                                                    className="inline-flex items-center gap-1 mb-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ delay: 0.2 }}
                                                                >
                                                                    <Eye className="w-3 h-3" />
                                                                    Available
                                                                </motion.span>
                                                            )}
                                                        </div>
                                                        {ep.vote_average > 0 && (
                                                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                                                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                    {ep.vote_average.toFixed(1)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div>
                                                        <h4 className="font-bold text-lg leading-tight mb-1 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                                                            {ep.episode_number}. {ep.name}
                                                        </h4>
                                                        <p className="text-sm line-clamp-2 text-slate-600 dark:text-slate-400 leading-relaxed">
                                                            {ep.overview || 'No description available for this episode.'}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                                                        <div className="flex items-center gap-4 text-xs">
                                                            <div className={`flex items-center gap-1 ${
                                                                isImageMissing
                                                                    ? 'font-semibold text-amber-700 dark:text-amber-400'
                                                                    : isFutureEpisode
                                                                      ? 'font-medium text-indigo-700 dark:text-indigo-400'
                                                                      : 'text-slate-500 dark:text-slate-400'
                                                            }`}>
                                                                <Calendar className="w-3 h-3" />
                                                                <span>{ep.air_date || 'TBA'}</span>
                                                            </div>
                                                            {!isImageMissing && ep.runtime && (
                                                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>{ep.runtime} min</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
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
        </TooltipProvider>
    );
}
