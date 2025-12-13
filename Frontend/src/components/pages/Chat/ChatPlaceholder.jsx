import { motion } from 'framer-motion';
import { MessageSquare, Users } from 'lucide-react';

export default function ChatPlaceholder({ type = 'default' }) {
  const isChat = type === 'chat';
  const Icon = isChat ? MessageSquare : Users;
  const title = isChat ? 'Select a chat to start conversation' : 'Select a conversation or friend to start';
  const subtitle = isChat ? 'Choose from your conversations' : 'Pick a chat or friend to begin';

  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-4"
      >
        <Icon className="h-16 w-16 text-slate-400 dark:text-slate-500" />
      </motion.div>
      <motion.p
        className="text-lg text-slate-500 dark:text-slate-400 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {title}
      </motion.p>
      <motion.p
        className="text-sm text-slate-400 dark:text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}
