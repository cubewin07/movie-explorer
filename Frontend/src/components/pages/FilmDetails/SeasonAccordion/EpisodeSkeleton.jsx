import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function EpisodeSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Skeleton className="w-full h-28 rounded-xl bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600" />
    </motion.div>
  );
}
