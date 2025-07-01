import { motion } from 'framer-motion';
import { Film, Tv, Star, Play, Plus, Share } from 'lucide-react';

const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export default function FancyLoader({ type = 'movie' }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
            },
        },
    };

    const shimmerVariants = {
        animate: {
            x: ['-100%', '100%'],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
            },
        },
    };

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Animated Backdrop Skeleton */}
            <motion.div
                className="relative h-64 sm:h-96 md:h-[500px] overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800"
                variants={itemVariants}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent" />
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    variants={shimmerVariants}
                    animate="animate"
                />
            </motion.div>

            {/* Content Container */}
            <div className="max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8">
                <motion.div
                    className="p-4 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 -mt-32 sm:-mt-40 md:-mt-48 relative z-10"
                    variants={itemVariants}
                >
                    {/* Poster Skeleton */}
                    <motion.div
                        className="flex items-center justify-center w-32 sm:w-48 md:w-60 h-48 sm:h-72 md:h-90 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 shadow-2xl border border-white dark:border-slate-700 mx-auto md:mx-0 relative overflow-hidden"
                        variants={itemVariants}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        <div className="text-slate-400 dark:text-slate-500">
                            {type === 'movie' ? (
                                <Film className="w-12 h-12 sm:w-16 sm:h-16" />
                            ) : (
                                <Tv className="w-12 h-12 sm:w-16 sm:h-16" />
                            )}
                        </div>
                    </motion.div>

                    {/* Info Section */}
                    <motion.div className="flex-1 space-y-4" variants={itemVariants}>
                        {/* Title Skeleton */}
                        <motion.div
                            className="h-8 sm:h-10 md:h-12 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg relative overflow-hidden"
                            variants={itemVariants}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        </motion.div>

                        {/* Meta Info Skeleton */}
                        <motion.div className="flex flex-wrap items-center gap-3" variants={itemVariants}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full relative overflow-hidden"
                                    style={{ width: `${Math.random() * 60 + 40}px` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                </div>
                            ))}
                        </motion.div>

                        {/* Rating Skeleton */}
                        <motion.div className="flex items-center gap-2" variants={itemVariants}>
                            <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                            <div className="h-6 w-12 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                            </div>
                        </motion.div>

                        {/* Genres Skeleton */}
                        <motion.div className="flex flex-wrap gap-2" variants={itemVariants}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-6 bg-gradient-to-r from-indigo-200 to-indigo-300 dark:from-indigo-700 dark:to-indigo-800 rounded-full px-3 relative overflow-hidden"
                                    style={{ width: `${Math.random() * 40 + 60}px` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                </div>
                            ))}
                        </motion.div>

                        {/* Description Skeleton */}
                        <motion.div className="space-y-2" variants={itemVariants}>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded relative overflow-hidden"
                                    style={{ width: `${Math.random() * 40 + 60}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                </div>
                            ))}
                        </motion.div>

                        {/* Buttons Skeleton */}
                        <motion.div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-4" variants={itemVariants}>
                            {[
                                { icon: Play, width: 'w-32' },
                                { icon: Plus, width: 'w-36' },
                                { icon: Share, width: 'w-24' },
                            ].map((button, i) => (
                                <div
                                    key={i}
                                    className={`h-10 ${button.width} bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg relative overflow-hidden`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Tabs Section */}
                <motion.div className="p-2 sm:p-4 md:p-8" variants={itemVariants}>
                    {/* Tabs List Skeleton */}
                    <div className="grid grid-cols-3 md:grid-cols-6 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6 p-1 gap-1">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-10 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-md relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                            </div>
                        ))}
                    </div>

                    {/* Tab Content Skeleton */}
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded relative overflow-hidden"
                                style={{ width: `${Math.random() * 40 + 60}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Floating Loading Indicator */}
            <motion.div
                className="fixed bottom-8 right-8 bg-white dark:bg-slate-800 rounded-full p-4 shadow-lg border border-slate-200 dark:border-slate-700"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
            >
                <motion.div
                    className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
            </motion.div>

            {/* Loading Text */}
            <motion.div
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <motion.div
                    className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Loading {type === 'movie' ? 'Movie' : 'TV Series'} Details...
                </motion.div>
                <motion.div
                    className="text-sm text-slate-500 dark:text-slate-500"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                    Please wait while we fetch the latest information
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
