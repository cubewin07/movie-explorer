import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable ErrorState component with modern gradient design and animations
 * @param {Object} props - Component props
 * @param {string} props.title - Main error title text (e.g., "Oops! Something went wrong")
 * @param {string} props.message - Primary error message (e.g., "Failed to load movies")
 * @param {string} props.subtitle - Optional subtitle text (e.g., "Please check your connection and try again")
 * @param {boolean} props.fullScreen - Whether to use full screen height (default: true)
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onRetry - Custom retry function (defaults to page reload)
 * @param {boolean} props.showHomeButton - Whether to show "Go Home" button (default: true)
 * @param {string} props.retryText - Custom text for retry button (default: "Try Again")
 * @param {string} props.homeText - Custom text for home button (default: "Go Home")
 */
export default function ErrorState({ 
    title = "Oops! Something went wrong",
    message = "An error occurred while loading the content",
    subtitle = "Please check your connection and try again",
    fullScreen = true,
    className = "",
    onRetry = null,
    showHomeButton = true,
    retryText = "Try Again",
    homeText = "Go Home"
}) {
    const navigate = useNavigate();

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            window.location.reload();
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className={`${fullScreen ? 'min-h-screen' : 'h-96'} bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-red-900/20 flex flex-col justify-center items-center px-4 ${className}`}>
            <motion.div
                className="text-center max-w-md mx-auto"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            >
                {/* Error Icon */}
                <motion.div
                    className="relative mb-8"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                >
                    <div className="relative">
                        <motion.div
                            className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.svg
                                className="w-10 h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </motion.svg>
                        </motion.div>
                        
                        {/* Pulsing error rings */}
                        <motion.div
                            className="absolute inset-0 w-20 h-20 border-2 border-red-300/30 rounded-full"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        />
                    </div>
                </motion.div>
                
                {/* Error Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">
                        {message}
                    </p>
                    {subtitle && (
                        <p className="text-gray-500 dark:text-gray-500 text-sm mb-8">
                            {subtitle}
                        </p>
                    )}
                </motion.div>
                
                {/* Action Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <motion.button
                        onClick={handleRetry}
                        className="group px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        whileHover={{ 
                            scale: 1.05,
                            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </motion.svg>
                        {retryText}
                    </motion.button>
                    
                    {showHomeButton && (
                        <motion.button
                            onClick={handleGoHome}
                            className="group px-6 py-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-200 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-500 transition-all duration-200 flex items-center gap-2"
                            whileHover={{ 
                                scale: 1.05,
                                borderColor: 'rgb(239 68 68)'
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                whileHover={{ x: -2 }}
                                transition={{ duration: 0.2 }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </motion.svg>
                            {homeText}
                        </motion.button>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
