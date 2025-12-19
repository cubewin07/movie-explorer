import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function SearchSkeletonItem({ delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: delay * 0.1 }}
      className={cn(
        'group relative flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/50 shadow-sm',
        'hover:shadow-md transition-shadow',
        className
      )}
    >
      {/* Poster skeleton (match MovieCard compact poster size) */}
      <Skeleton
        variant="shimmer"
        delay={delay}
        className="w-20 h-30 sm:w-24 sm:h-36 flex-shrink-0 rounded-lg"
      />

      {/* Content skeleton */}
      <div className="flex-1 space-y-2 sm:space-y-2.5">
        {/* Title line */}
        <Skeleton variant="shimmer" delay={delay + 0.05} className="h-4 sm:h-5 w-3/4" />
        {/* Subtitle / meta */}
        <Skeleton variant="shimmer" delay={delay + 0.1} className="h-3 sm:h-4 w-1/2" />
        {/* One more line to simulate genres */}
        <Skeleton variant="shimmer" delay={delay + 0.15} className="h-3 sm:h-4 w-2/3" />

        {/* Tiny badges row */}
        <div className="flex gap-2 pt-1">
          <Skeleton variant="shimmer" delay={delay + 0.2} className="h-5 w-12 rounded-full" />
          <Skeleton variant="shimmer" delay={delay + 0.25} className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

export default SearchSkeletonItem;