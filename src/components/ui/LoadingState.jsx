import { motion } from 'framer-motion';

/**
 * Reusable LoadingState component with modern gradient design and animations
 * @param {Object} props - Component props
 * @param {string} props.title - Main loading title text (e.g., "Loading Movies", "Loading Data")
 * @param {string} props.subtitle - Optional subtitle text (defaults to "Discovering amazing content for you...")
 * @param {boolean} props.fullScreen - Whether to use full screen height (default: true)
 * @param {string} props.className - Additional CSS classes
 */
export default function LoadingState({ 
    title = "Loading", 
    subtitle = "Discovering amazing content for you...",
    fullScreen = true,
    className = ""
}) {
    return (
        <div className={`${fullScreen ? 'min-h-screen' : 'h-96'} bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col justify-center items-center px-4 ${className}`}>
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Loading Icon */}
                <motion.div
                    className="relative mb-8"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                >
                    <div className="relative">
                        <motion.div
                            className="w-16 h-16 border-4 border-gradient-to-r from-blue-500 to-purple-600 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            style={{
                                background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6)',
                                borderRadius: '50%',
                                padding: '2px'
                            }}
                        >
                            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full"></div>
                        </motion.div>
                        
                        {/* Pulsing rings */}
                        <motion.div
                            className="absolute inset-0 w-16 h-16 border-2 border-blue-300/30 rounded-full"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="absolute inset-0 w-16 h-16 border-2 border-purple-300/30 rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.5 }}
                        />
                    </div>
                </motion.div>
                
                {/* Loading Text */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        {title}
                    </h2>
                    <motion.p 
                        className="text-gray-600 dark:text-gray-400 max-w-md mx-auto"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    >
                        {subtitle}
                    </motion.p>
                </motion.div>
                
                {/* Loading dots */}
                <motion.div 
                    className="flex items-center justify-center gap-2 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                delay: i * 0.2,
                                ease: 'easeInOut'
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}
