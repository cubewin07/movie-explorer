import { Star, Users, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DetailsSection({ series }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-6"
        >
            {/* Series Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                    className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500 rounded-lg">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300">Language</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {series.original_language?.toUpperCase() || 'N/A'}
                    </p>
                    <p className="text-sm text-purple-600/70 dark:text-purple-400/70 mt-2">
                        Original Language
                    </p>
                </motion.div>

                <motion.div 
                    className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Star className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Country</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {series.origin_country?.join(', ') || 'N/A'}
                    </p>
                    <p className="text-sm text-blue-600/70 dark:text-blue-400/70 mt-2">
                        Origin Country
                    </p>
                </motion.div>
            </div>

            {/* Runtime & Air Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700 shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-500 rounded-lg">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300">Runtime</h3>
                    </div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {series.episode_run_time?.[0] ? `${series.episode_run_time[0]} min` : 'N/A'}
                    </p>
                    <p className="text-sm text-orange-600/70 dark:text-orange-400/70 mt-2">
                        Per Episode
                    </p>
                </motion.div>

                <motion.div 
                    className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700 shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500 rounded-lg">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">First Aired</h3>
                    </div>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {series.first_air_date ? new Date(series.first_air_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        }) : 'N/A'}
                    </p>
                    <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-2">
                        Premiere Date
                    </p>
                </motion.div>

                <motion.div 
                    className="bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-rose-200 dark:border-rose-700 shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-500 rounded-lg">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-rose-800 dark:text-rose-300">Last Aired</h3>
                    </div>
                    <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                        {series.last_air_date ? new Date(series.last_air_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        }) : series.status === 'Returning Series' ? 'Ongoing' : 'N/A'}
                    </p>
                    <p className="text-sm text-rose-600/70 dark:text-rose-400/70 mt-2">
                        Latest Episode
                    </p>
                </motion.div>
            </div>

            {/* Series Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                    className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700 shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500 rounded-lg">
                            <Star className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300">Popularity</h3>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {series.popularity?.toFixed(0) || 'N/A'}
                    </p>
                    <p className="text-sm text-indigo-600/70 dark:text-indigo-400/70 mt-2">
                        TMDB Score
                    </p>
                </motion.div>

                <motion.div 
                    className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-700 shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-teal-500 rounded-lg">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-teal-800 dark:text-teal-300">Vote Count</h3>
                    </div>
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {series.vote_count?.toLocaleString() || 'N/A'}
                    </p>
                    <p className="text-sm text-teal-600/70 dark:text-teal-400/70 mt-2">
                        Total Votes
                    </p>
                </motion.div>
            </div>

            {/* Additional Information */}
            {(series.created_by?.length > 0 || series.type) && (
                <motion.div 
                    className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-slate-500 rounded-lg">
                            <Star className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-300">Additional Info</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {series.type && (
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Type</p>
                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{series.type}</p>
                            </div>
                        )}
                        {series.created_by?.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Created By</p>
                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                    {series.created_by.slice(0, 2).map(creator => creator.name).join(', ')}
                                    {series.created_by.length > 2 && ` +${series.created_by.length - 2} more`}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
