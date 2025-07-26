import { motion } from 'framer-motion';
import { Skeleton } from './skeleton';

/**
 * Enhanced SkeletonCard component with modern animations and multiple variants
 * @param {Object} props - Component props
 * @param {number} props.delay - Animation delay in seconds
 * @param {string} props.variant - Card variant ('default', 'movie', 'list', 'grid')
 * @param {string} props.animation - Animation type ('shimmer', 'wave', 'pulse')
 * @param {string} props.className - Additional CSS classes
 */
function SkeletonCard({ 
    delay = 0, 
    variant = 'default',
    animation = 'shimmer',
    className = ''
}) {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.4,
                delay: delay * 0.1,
                ease: 'easeOut'
            }
        }
    };

    // Movie/TV Show Card Skeleton
    if (variant === 'movie') {
        return (
            <motion.div 
                className={`group relative ${className}`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-lg">
                    {/* Poster Skeleton */}
                    <Skeleton 
                        variant={animation}
                        delay={delay}
                        className="aspect-[2/3] w-full"
                        rounded={false}
                    />
                    
                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <Skeleton 
                            variant={animation}
                            delay={delay + 0.1}
                            className="h-4 w-3/4 mb-2 bg-white/20"
                        />
                        <Skeleton 
                            variant={animation}
                            delay={delay + 0.2}
                            className="h-3 w-1/2 bg-white/15"
                        />
                    </div>
                    
                    {/* Rating Badge Skeleton */}
                    <div className="absolute top-2 right-2">
                        <Skeleton 
                            variant={animation}
                            delay={delay + 0.3}
                            className="w-10 h-6 bg-yellow-400/30 rounded-full"
                        />
                    </div>
                </div>
            </motion.div>
        );
    }

    // List View Skeleton
    if (variant === 'list') {
        return (
            <motion.div 
                className={`flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 ${className}`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Poster Skeleton */}
                <Skeleton 
                    variant={animation}
                    delay={delay}
                    className="w-[100px] h-[150px] flex-shrink-0"
                />
                
                {/* Content Skeleton */}
                <div className="flex-1 space-y-3">
                    <Skeleton 
                        variant={animation}
                        delay={delay + 0.1}
                        className="h-6 w-3/4"
                    />
                    <Skeleton 
                        variant={animation}
                        delay={delay + 0.2}
                        className="h-4 w-full"
                    />
                    <Skeleton 
                        variant={animation}
                        delay={delay + 0.3}
                        className="h-4 w-5/6"
                    />
                    
                    {/* Meta Info Skeletons */}
                    <div className="flex gap-2 mt-4">
                        <Skeleton 
                            variant={animation}
                            delay={delay + 0.4}
                            className="h-6 w-16 rounded-full"
                        />
                        <Skeleton 
                            variant={animation}
                            delay={delay + 0.5}
                            className="h-6 w-20 rounded-full"
                        />
                        <Skeleton 
                            variant={animation}
                            delay={delay + 0.6}
                            className="h-6 w-12 rounded-full"
                        />
                    </div>
                </div>
            </motion.div>
        );
    }

    // Grid View Skeleton
    if (variant === 'grid') {
        return (
            <motion.div 
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Image Skeleton */}
                <Skeleton 
                    variant={animation}
                    delay={delay}
                    className="aspect-[16/9] w-full"
                    rounded={false}
                />
                
                {/* Content */}
                <div className="p-4 space-y-3">
                    <Skeleton 
                        variant={animation}
                        delay={delay + 0.1}
                        className="h-5 w-4/5"
                    />
                    <Skeleton 
                        variant={animation}
                        delay={delay + 0.2}
                        className="h-4 w-full"
                    />
                    <Skeleton 
                        variant={animation}
                        delay={delay + 0.3}
                        className="h-4 w-3/4"
                    />
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Skeleton 
                            variant={animation}
                            delay={delay + 0.4}
                            className="h-8 w-20 rounded-lg"
                        />
                        <Skeleton 
                            variant={animation}
                            delay={delay + 0.5}
                            className="h-8 w-16 rounded-lg"
                        />
                    </div>
                </div>
            </motion.div>
        );
    }

    // Default Skeleton (Original Enhanced)
    return (
        <motion.div 
            className={`flex items-start gap-4 p-3 rounded-lg bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/30 dark:to-slate-900/30 backdrop-blur-sm ${className}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
        >
            <Skeleton 
                variant={animation}
                delay={delay}
                className="w-[100px] h-[150px] flex-shrink-0"
            />
            <div className="space-y-2 flex-1">
                <Skeleton 
                    variant={animation}
                    delay={delay + 0.1}
                    className="h-4 w-1/2"
                />
                <Skeleton 
                    variant={animation}
                    delay={delay + 0.2}
                    className="h-3 w-3/4"
                />
                <Skeleton 
                    variant={animation}
                    delay={delay + 0.3}
                    className="h-3 w-1/3"
                />
            </div>
        </motion.div>
    );
}

export default SkeletonCard;
