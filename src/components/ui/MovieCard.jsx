import { Star, Calendar, Play, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

function MovieCard({ title, year, rating, genres = [], image, onClick, type }) {
    // Define gradient colors for different content types
    const getTypeGradient = () => {
        if (type === 'tv') {
            return {
                hover: 'hover:from-purple-50 hover:to-pink-50/40 dark:hover:from-purple-900/30 dark:hover:to-pink-900/20',
                border: 'hover:border-purple-300 dark:hover:border-purple-400/40',
                shadow: 'hover:shadow-purple-200/50 dark:hover:shadow-purple-900/40',
                text: 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
            };
        }
        return {
            hover: 'hover:from-blue-50 hover:to-cyan-50/40 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/20',
            border: 'hover:border-blue-300 dark:hover:border-blue-400/40',
            shadow: 'hover:shadow-blue-200/50 dark:hover:shadow-blue-900/40',
            text: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
        };
    };

    const typeGradient = getTypeGradient();

    // Genre color variants for better visual distinction
    const genreColors = [
        'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent',
        'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent',
        'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent',
        'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent',
        'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent',
        'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent'
    ];

    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`group relative overflow-hidden cursor-pointer 
                bg-white dark:bg-slate-800/50 backdrop-blur-sm
                hover:bg-gradient-to-br ${typeGradient.hover}
                p-4 rounded-2xl transition-all duration-300 
                border border-slate-200 dark:border-slate-700 ${typeGradient.border}
                hover:shadow-2xl ${typeGradient.shadow}
                hover:-translate-y-1`}
        >
            {/* Background Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/30 dark:to-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex gap-4 items-start">
                {/* Movie Poster Section */}
                <div className="relative w-20 h-30 sm:w-24 sm:h-36 flex-shrink-0">
                    <motion.div
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="relative w-full h-full rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                    >
                        <img
                            src={image || '/placeholder.svg?height=120&width=80'}
                            alt={title}
                            className="w-full h-full object-cover 
                                bg-gradient-to-br from-slate-200 to-slate-300 
                                dark:from-slate-600 dark:to-slate-700"
                        />
                        
                        {/* Play Button Overlay */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center rounded-xl"
                        >
                            <div className="bg-white/90 dark:bg-slate-800/90 rounded-full p-2 shadow-lg">
                                <Play className="w-4 h-4 text-slate-700 dark:text-slate-300 fill-current" />
                            </div>
                        </motion.div>
                    </motion.div>
                    
                    {/* Rating Badge */}
                    {rating && (
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg ring-2 ring-white dark:ring-slate-800"
                        >
                            <Star className="w-3 h-3 fill-current mr-1" />
                            {rating}
                        </motion.div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 space-y-2.5">
                    {/* Title */}
                    <div>
                        <h4 className={`font-bold text-slate-900 dark:text-white ${typeGradient.text} transition-colors duration-300 line-clamp-2 leading-tight text-base sm:text-lg mb-1`}>
                            {title}
                        </h4>
                    </div>
                    
                    {/* Year and Type - Compact Row */}
                    {year && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
                                <span className="font-medium">{year}</span>
                            </div>
                            {type && (
                                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                    type === 'tv' 
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}>
                                    {type === 'tv' ? 'TV' : 'Movie'}
                                </span>
                            )}
                        </div>
                    )}
                    
                    {/* Genres Section - Single Genre with Indicator */}
                    {genres.length > 0 && (
                        <div className="space-y-2">
                            {/* Primary Genre with Count Indicator */}
                            <div className="flex items-center gap-2 min-w-0">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200 truncate max-w-[140px] flex-shrink-0"
                                    title={genres[0]} // Show full text on hover
                                >
                                    {genres[0]}
                                </motion.div>
                                
                                {/* Genre count indicator */}
                                {genres.length > 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 cursor-default flex items-center gap-1 flex-shrink-0"
                                    >
                                        {/* <MoreHorizontal className="w-3 h-3" /> */}
                                        +{genres.length - 1}
                                    </motion.div>
                                )}
                            </div>
                            
                            {/* Full genre list on hover - Clean grid layout */}
                            {genres.length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ 
                                        opacity: 1, 
                                        height: 'auto',
                                        transition: { duration: 0.3, ease: 'easeOut' }
                                    }}
                                    className="overflow-hidden group-hover:block hidden"
                                >
                                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                                        {genres.slice(1).map((genre, i) => (
                                            <motion.div
                                                key={i + 1}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 text-center hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200"
                                            >
                                                {genre}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default MovieCard;
