import { Star, Users, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SeriesStatsSection({ series }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-6"
        >
            {/* Story Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-blue-200 dark:border-slate-600 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                        <Star className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Story</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                    {series.overview || "No overview available for this TV series."}
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div 
                    className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700 shadow-md hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {series.vote_average?.toFixed(1) || 'N/A'}
                    </p>
                </motion.div>

                <motion.div 
                    className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 shadow-md hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Seasons</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {series.number_of_seasons || 'N/A'}
                    </p>
                </motion.div>

                <motion.div 
                    className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700 shadow-md hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Episodes</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {series.number_of_episodes || 'N/A'}
                    </p>
                </motion.div>

                <motion.div 
                    className="bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-rose-200 dark:border-rose-700 shadow-md hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</span>
                    </div>
                    <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                        {series.status || 'N/A'}
                    </p>
                </motion.div>
            </div>

            {/* Genres */}
            {series.genres && series.genres.length > 0 && (
                <div className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600 shadow-lg">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <div className="p-1 bg-slate-500 rounded">
                            <Star className="w-4 h-4 text-white" />
                        </div>
                        Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {series.genres.map((genre, index) => (
                            <motion.span
                                key={genre.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow cursor-default"
                            >
                                {genre.name}
                            </motion.span>
                        ))}
                    </div>
                </div>
            )}

            {/* Networks & Production */}
            {(series.networks?.length > 0 || series.production_companies?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Networks */}
                    {series.networks?.length > 0 && (
                        <div className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-700 shadow-lg">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <div className="p-1 bg-cyan-500 rounded">
                                    <Star className="w-4 h-4 text-white" />
                                </div>
                                Networks
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {series.networks.slice(0, 3).map((network, index) => (
                                    <motion.div
                                        key={network.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-2 bg-white dark:bg-slate-600 px-3 py-2 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-500"
                                    >
                                        {network.logo_path && (
                                            <img 
                                                src={`https://image.tmdb.org/t/p/w92${network.logo_path}`}
                                                alt={network.name}
                                                className="w-6 h-6 object-contain"
                                            />
                                        )}
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {network.name}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Production Companies */}
                    {series.production_companies?.length > 0 && (
                        <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700 shadow-lg">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <div className="p-1 bg-emerald-500 rounded">
                                    <Users className="w-4 h-4 text-white" />
                                </div>
                                Production
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {series.production_companies.slice(0, 3).map((company, index) => (
                                    <motion.div
                                        key={company.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-2 bg-white dark:bg-slate-600 px-3 py-2 rounded-lg shadow-md border border-emerald-200 dark:border-emerald-500"
                                    >
                                        {company.logo_path && (
                                            <img 
                                                src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                                                alt={company.name}
                                                className="w-6 h-6 object-contain"
                                            />
                                        )}
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {company.name}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
