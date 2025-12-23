import { motion } from 'framer-motion';
import { Inbox, Send } from 'lucide-react';
import { REQUEST_TYPES } from './requestTypeConstants';

export default function EmptyState({ type }) {
  const isIncoming = type === REQUEST_TYPES.INCOMING;
  const Icon = isIncoming ? Inbox : Send;
  const title = isIncoming ? 'No incoming requests' : 'No sent requests';
  const subtitle = isIncoming ? "You're all caught up!" : 'Start adding friends!';

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={isIncoming ? { y: [0, -12, 0] } : { rotate: [0, 20, -20, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-4"
      >
        <Icon className="h-12 w-12 text-slate-400 dark:text-slate-500" />
      </motion.div>
      <motion.p
        className="text-sm text-slate-500 dark:text-slate-400 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {title}
      </motion.p>
      <motion.p
        className="text-xs text-slate-400 dark:text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}
