import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
                className="flex flex-col items-center"
            >
                <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: [-10, 10, -10] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="mb-4"
                >
                    <Film className="w-24 h-24 text-blue-400 dark:text-blue-500 drop-shadow-lg" />
                </motion.div>
                <motion.h1
                    className="text-7xl sm:text-8xl font-extrabold text-blue-600 dark:text-blue-400 mb-2 drop-shadow"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7, type: 'spring' }}
                >
                    404
                </motion.h1>
                <motion.p
                    className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7, type: 'spring' }}
                >
                    Oops! Page Not Found
                </motion.p>
                <motion.p
                    className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center max-w-md"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.7, type: 'spring' }}
                >
                    The page you are looking for does not exist or has been moved.
                    <br />
                    Let's get you back to the movies!
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow"
                        onClick={() => navigate('/')}
                    >
                        Go Home
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
}
