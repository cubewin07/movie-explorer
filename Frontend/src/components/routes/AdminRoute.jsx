import { useAuthen } from '@/context/AuthenProvider';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuthen();
  const navigate = useNavigate();

  if (loading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full" />
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
        <p className="text-muted-foreground mt-6">Loading...</p>
      </motion.div>
    );
  }

  const isAdmin = user?.isAdmin === true || String(user?.role || '').toUpperCase().includes('ADMIN');
  if (!isAdmin) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mx-auto mb-6 w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
        </motion.div>
        <motion.h2
          className="text-2xl font-bold mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Admin Access Required
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground mb-6 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          You do not have permission to view this page.
        </motion.p>
        <Button onClick={() => navigate('/')} variant="outline">
          Go Home
        </Button>
      </motion.div>
    );
  }

  return children;
}
