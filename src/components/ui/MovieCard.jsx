import { Star, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

function MovieCard({ title, year, rating, genres = [], image, onClick, type }) {
    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="group flex gap-4 items-start cursor-pointer 
                hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50/30 
                dark:hover:from-slate-800 dark:hover:to-blue-900/20 
                p-4 rounded-xl transition-all duration-300 
                border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30 
                hover:shadow-xl dark:hover:shadow-blue-900/40"
        >
            <div className="relative w-16 h-24 flex-shrink-0">
                <motion.img
                    src={image || '/placeholder.svg?height=96&width=64'}
                    alt={title}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="w-full h-full object-cover rounded-lg 
                        bg-gradient-to-br from-slate-100 to-slate-200 
                        dark:from-slate-700 dark:to-slate-800 
                        group-hover:shadow-lg"
                />
                {rating && (
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center shadow-md"
                    >
                        <Star className="w-3 h-3 fill-current mr-1" />
                        {rating}
                    </motion.div>
                )}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                        {title}
                    </h4>
                </div>
                {year && (
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                        {year}
                    </div>
                )}
                {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {genres.slice(0, 3).map((genre, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="text-xs px-2 py-0.5 
                                    bg-blue-50 text-blue-700 border-blue-200 
                                    hover:bg-blue-100 
                                    dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-800 transition-colors"
                            >
                                {genre}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default MovieCard;
