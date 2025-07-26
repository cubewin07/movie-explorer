import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Enhanced LoadingSideBar component with modern skeleton animations
 * Displays loading state for popular movies/TV shows in the sidebar
 */
function LoadingSideBar() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.4,
                ease: 'easeOut'
            }
        }
    };

    return (
        <motion.div 
            className="flex flex-col gap-3 sm:gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {Array(3)
                .fill(0)
                .map((_, i) => (
                    <motion.div 
                        key={i} 
                        className="flex gap-3 sm:gap-4 p-2 rounded-lg bg-gradient-to-r from-slate-50/30 to-slate-100/30 dark:from-slate-800/20 dark:to-slate-900/20 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30"
                        variants={itemVariants}
                    >
                        {/* Poster skeleton */}
                        <Skeleton 
                            variant="shimmer"
                            delay={i * 0.1}
                            className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0"
                        />

                        {/* Text content */}
                        <div className="flex flex-col justify-between w-full space-y-2">
                            <div className="space-y-2">
                                <Skeleton 
                                    variant="shimmer"
                                    delay={i * 0.1 + 0.1}
                                    className="h-3 sm:h-4 w-2/3"
                                />
                                <Skeleton 
                                    variant="shimmer"
                                    delay={i * 0.1 + 0.2}
                                    className="h-2 w-1/2"
                                />
                            </div>
                            
                            {/* Rating skeleton */}
                            <Skeleton 
                                variant="shimmer"
                                delay={i * 0.1 + 0.3}
                                className="h-4 sm:h-5 w-14 sm:w-16 rounded-full bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-600 dark:to-yellow-700"
                            />
                        </div>
                    </motion.div>
                ))}
            
            {/* View All Button Skeleton */}
            <motion.div
                variants={itemVariants}
                className="mt-2"
            >
                <Skeleton 
                    variant="wave"
                    delay={0.4}
                    className="h-6 sm:h-8 w-full bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800"
                />
            </motion.div>
        </motion.div>
    );
}

export default LoadingSideBar;
