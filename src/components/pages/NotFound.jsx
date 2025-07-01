import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function AnimatedRobot() {
    // Simple animated robot SVG
    return (
        <motion.div
            className="hidden md:flex flex-col items-center justify-center h-full min-w-[220px]"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: [-20, 0, -20], opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ pointerEvents: 'none' }}
        >
            <svg width="140" height="180" viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Body */}
                <motion.rect x="30" y="60" width="80" height="80" rx="20" fill="#64748b" />
                {/* Head */}
                <motion.rect x="40" y="20" width="60" height="50" rx="15" fill="#94a3b8" />
                {/* Eyes */}
                <motion.ellipse cx="60" cy="45" rx="6" ry="8" fill="#fff" />
                <motion.ellipse cx="80" cy="45" rx="6" ry="8" fill="#fff" />
                {/* Pupils (blinking) */}
                <motion.ellipse
                    cx="60"
                    cy="45"
                    rx="2"
                    ry="3"
                    fill="#334155"
                    animate={{ ry: [3, 0.5, 3] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                />
                <motion.ellipse
                    cx="80"
                    cy="45"
                    rx="2"
                    ry="3"
                    fill="#334155"
                    animate={{ ry: [3, 0.5, 3] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, delay: 0.2 }}
                />
                {/* Antenna */}
                <motion.rect
                    x="68"
                    y="5"
                    width="4"
                    height="20"
                    rx="2"
                    fill="#38bdf8"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'mirror' }}
                />
                <motion.circle
                    cx="70"
                    cy="5"
                    r="5"
                    fill="#38bdf8"
                    animate={{ r: [5, 7, 5] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'mirror' }}
                />
                {/* Arms */}
                <motion.rect
                    x="15"
                    y="90"
                    width="15"
                    height="8"
                    rx="4"
                    fill="#cbd5e1"
                    animate={{ x: [15, 10, 15] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}
                />
                <motion.rect
                    x="110"
                    y="90"
                    width="15"
                    height="8"
                    rx="4"
                    fill="#cbd5e1"
                    animate={{ x: [110, 115, 110] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}
                />
                {/* Legs */}
                <rect x="50" y="140" width="10" height="30" rx="5" fill="#cbd5e1" />
                <rect x="80" y="140" width="10" height="30" rx="5" fill="#cbd5e1" />
            </svg>
        </motion.div>
    );
}

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <div className="relative min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 px-4 overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center z-10">
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
            <AnimatedRobot />
        </div>
    );
}
