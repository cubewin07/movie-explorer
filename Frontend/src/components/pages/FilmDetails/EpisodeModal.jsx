// EpisodeModal.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Star, PlayCircle, ChevronDown, ChevronUp, Calendar, Clock, Users, Play, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EpisodeModal({ open, onClose, episode }) {
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
                className="w-full max-w-screen-sm md:max-w-2xl lg:max-w-4xl bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 text-slate-900 dark:text-white 
             rounded-3xl p-0 border-2 border-slate-200/60 dark:border-slate-700/60 shadow-2xl backdrop-blur-sm
             max-h-[90vh] overflow-hidden"
            >
                {/* Enhanced Banner with Overlay */}
                <div className="relative overflow-hidden">
                    {episode.still_path ? (
                        <div className="relative">
                            <motion.img
                                src={`https://image.tmdb.org/t/p/original${episode.still_path}`}
                                alt={episode.name}
                                className="w-full h-64 sm:h-80 object-cover"
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />
                        </div>
                    ) : (
                        <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                            <div className="text-center text-slate-500 dark:text-slate-400">
                                <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
                                <p className="text-lg font-medium">No Preview Available</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-20rem)]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <DialogHeader className="space-y-4">
                            <div className="flex justify-between items-start flex-wrap gap-4">
                                <div className="flex-1">
                                    <DialogTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent leading-tight">
                                        {episode.episode_number}. {episode.name}
                                    </DialogTitle>
                                </div>
                                {episode.vote_average > 0 && (
                                    <motion.div 
                                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900 px-4 py-2 rounded-full shadow-lg font-bold text-sm"
                                        initial={{ scale: 0, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                    >
                                        <Star className="w-4 h-4 fill-current" />
                                        <span>{episode.vote_average.toFixed(1)}</span>
                                    </motion.div>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                        {episode.air_date || 'TBA'}
                                    </span>
                                </div>
                                {episode.runtime && (
                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                                        <Clock className="w-4 h-4 text-green-500" />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                            {episode.runtime} min
                                        </span>
                                    </div>
                                )}
                            </div>
                        </DialogHeader>
                        <div className="mt-6 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                                        Episode Overview
                                    </h3>
                                    <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                                        {episode.overview || 'No description available for this episode.'}
                                    </p>
                                </div>
                                
                                {trailer && (
                                    <motion.button
                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                                        className="mt-4 inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <PlayCircle className="w-5 h-5" /> 
                                        <span>Watch Trailer</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </motion.div>

                            {/* Enhanced Guest Stars Section */}
                            {episode.guest_stars?.some((star) => star.profile_path) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50"
                                >
                                    <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <span>Guest Stars</span>
                                        <span className="text-sm font-normal bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                                            {episode.guest_stars.filter((star) => star.profile_path).length}
                                        </span>
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                        {episode.guest_stars
                                            .filter((star) => star.profile_path)
                                            .map((star, index) => (
                                                <motion.div
                                                    key={star.id}
                                                    className="group flex flex-col items-center text-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5 + index * 0.1 }}
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/w185${star.profile_path}`}
                                                            alt={star.name}
                                                            className="w-20 h-20 object-cover rounded-full border-3 border-white dark:border-slate-600 shadow-lg group-hover:border-purple-300 dark:group-hover:border-purple-500 transition-colors duration-300"
                                                        />
                                                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                                                            {star.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                                                            {star.character}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
