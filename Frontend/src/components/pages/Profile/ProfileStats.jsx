import { motion } from 'framer-motion';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Eye, Star, Heart } from 'lucide-react';

/**
 * ProfileStats Component
 * Displays user statistics (watchlist, reviews, favorites) and recent activity
 */
export default function ProfileStats({ stats, recent }) {
    return (
        <div className="flex-1 flex flex-col gap-8 w-full">
            {/* Stats Cards */}
            <div className="flex gap-4 justify-center md:justify-start">
                {/* Watchlist Stat */}
                <Card className="flex flex-col items-center px-6 py-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-slate-800 dark:to-purple-900 shadow rounded-xl">
                    <Eye className="w-6 h-6 text-blue-500 mb-1" />
                    <span className="text-lg font-bold">{stats.watchlist}</span>
                    <span className="text-xs text-gray-500">Watchlist</span>
                </Card>

                {/* Reviews Stat */}
                <Card className="flex flex-col items-center px-6 py-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-slate-800 dark:to-purple-900 shadow rounded-xl">
                    <Star className="w-6 h-6 text-yellow-400 mb-1" />
                    <span className="text-lg font-bold">{stats.reviews}</span>
                    <span className="text-xs text-gray-500">Reviews</span>
                </Card>

                {/* Favorites Stat */}
                <Card className="flex flex-col items-center px-6 py-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-slate-800 dark:to-purple-900 shadow rounded-xl">
                    <Heart className="w-6 h-6 text-pink-500 mb-1" />
                    <span className="text-lg font-bold">{stats.favorites}</span>
                    <span className="text-xs text-gray-500">Favorites</span>
                </Card>
            </div>

            {/* Recent Activity */}
            <div>
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    Recent Activity
                </h3>
                <ul className="space-y-2">
                    {recent && recent.length > 0 ? (
                        recent.map((item, idx) => (
                            <motion.li
                                key={idx}
                                className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/70 rounded-lg px-4 py-2 shadow-sm"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx, duration: 0.5 }}
                            >
                                {item.type === 'watched' && <Eye className="w-4 h-4 text-blue-500" />}
                                {item.type === 'reviewed' && <Star className="w-4 h-4 text-yellow-400" />}
                                {item.type === 'favorited' && <Heart className="w-4 h-4 text-pink-500" />}
                                <span className="font-medium text-gray-700 dark:text-gray-200">{item.title}</span>
                                <Badge className="ml-auto bg-purple-200 dark:bg-purple-700 text-purple-700 dark:text-purple-100 text-xs font-semibold px-2 py-0.5">
                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                </Badge>
                                <span className="text-xs text-gray-400 ml-2">{item.date}</span>
                            </motion.li>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                    )}
                </ul>
            </div>
        </div>
    );
}
