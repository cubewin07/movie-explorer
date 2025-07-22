import { useAuthen } from '@/context/AuthenProvider';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LoginNotificationModal } from '@/components/react_components/Modal/LoginNotificationModal';

/**
 * ProtectedRoute component that requires user authentication
 * Redirects to login modal or shows login prompt for unauthenticated users
 */
export default function ProtectedRoute({ children, fallback = 'modal' }) {
    const { user, loading } = useAuthen();
    const location = useLocation();
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <motion.div 
                className="flex flex-col items-center justify-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <motion.div
                    className="relative mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                </motion.div>
                <p className="text-muted-foreground">Checking authentication...</p>
            </motion.div>
        );
    }

    // If user is authenticated, render the protected content
    if (user) {
        return children;
    }

    // Handle different fallback strategies for unauthenticated users
    if (fallback === 'redirect') {
        // Redirect to home page with the current location in state
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Default: Show login prompt with modal option
    return (
        <>
            <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="mx-auto mb-6 w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </motion.div>
                
                <motion.h2 
                    className="text-2xl font-bold mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Authentication Required
                </motion.h2>
                
                <motion.p 
                    className="text-lg text-muted-foreground mb-6 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Please log in to access this page and enjoy personalized features.
                </motion.p>
                
                <motion.div
                    className="flex gap-4 justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Button 
                        onClick={() => setShowLoginModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                    >
                        <User className="w-4 h-4" />
                        Log In
                    </Button>
                </motion.div>
            </motion.div>

            <LoginNotificationModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLoginSuccess={() => setShowLoginModal(false)}
            />
        </>
    );
}
