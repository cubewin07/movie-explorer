import { motion } from 'framer-motion';
import { Film, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AnimatedAnimeCharacter from './AnimatedCharater';
import { useState } from 'react';

export default function NotFound() {
    const navigate = useNavigate();
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [hoveringButton, setHoveringButton] = useState(false);

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div
            className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 px-4 overflow-hidden w-full h-full"
            onMouseMove={(e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 2;
                const y = (e.clientY / window.innerHeight - 0.5) * 2;
                setMouse({ x, y });
            }}
        >
            {/* Animated background elements */}
            <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute opacity-20"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0.2, 0.8, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 6 + Math.random() * 4,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: 'easeInOut',
                        }}
                    >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                    </motion.div>
                ))}
            </div>

            <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 z-10">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                        className="flex flex-col items-center"
                    >
                        <motion.div
                            initial={{ rotate: -15, scale: 0.8 }}
                            animate={{
                                rotate: [-15, 15, -15],
                                scale: [0.8, 1.1, 0.8],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 3,
                                ease: 'easeInOut',
                            }}
                            className="mb-6"
                        >
                            <Film className="w-28 h-28 text-pink-500 dark:text-pink-400 drop-shadow-2xl" />
                        </motion.div>

                        <div className="mb-4">
                            <div className="flex items-center gap-2">
                                {['4', '0', '4'].map((char, idx) => (
                                    <motion.span
                                        key={idx}
                                        className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg inline-block"
                                        initial={{ opacity: 0, y: 50, scale: 0.5, rotate: -6 }}
                                        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                                        transition={{
                                            delay: 0.2 + idx * 0.1,
                                            duration: 0.7,
                                            type: 'spring',
                                            bounce: 0.5,
                                        }}
                                        whileHover={{ y: -6, scale: 1.06, rotate: 3 }}
                                        style={{
                                            textShadow:
                                                '0 0 16px rgba(255,105,180,0.35), 0 0 28px rgba(138,43,226,0.35)',
                                        }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </div>
                        </div>

                        <motion.p
                            className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6 text-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.5,
                                duration: 0.8,
                                type: 'spring',
                            }}
                        >
                            <motion.span
                                animate={{
                                    color: ['#1f2937', '#ec4899', '#8b5cf6', '#1f2937'],
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                Oops! Page Not Found
                            </motion.span>
                        </motion.p>

                        <motion.p
                            className="text-xl text-gray-600 dark:text-gray-300 mb-10 text-center max-w-lg leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.7,
                                duration: 0.8,
                                type: 'spring',
                            }}
                        >
                            The page you are looking for seems to have vanished into the digital void!
                            <br />
                            <motion.span
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-pink-500 font-semibold"
                            >
                                Let's get you back to the movies! ✨
                            </motion.span>
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1, duration: 0.6, type: 'spring' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform"
                                onClick={handleGoHome}
                                onMouseEnter={() => setHoveringButton(true)}
                                onMouseLeave={() => setHoveringButton(false)}
                            >
                                <motion.span
                                    animate={{
                                        textShadow: [
                                            '0 0 10px rgba(255,255,255,0.5)',
                                            '0 0 20px rgba(255,255,255,0.8)',
                                            '0 0 10px rgba(255,255,255,0.5)',
                                        ],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    Go Home
                                </motion.span>
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
                <AnimatedAnimeCharacter mouse={mouse} hover={hoveringButton} />
            </div>
        </div>
    );
}
