import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import Login from '@/components/pages/Authentication/Login';
import Register from '@/components/pages/Authentication/Register';

export function LoginNotificationModal({ isOpen, onClose, onLoginSuccess }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        onLoginSuccess?.();
        onClose();
    };

    const handleShowRegister = () => {
        setIsLoginMode(false);
    };

    const handleShowLogin = () => {
        setIsLoginMode(true);
    };

    const handleClose = () => {
        setIsLoginMode(true);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-full max-w-xs sm:max-w-md md:max-w-lg p-0 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6"
                >
                    {/* Header */}
                    <DialogHeader className="text-center mb-6">
                        <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">
                            {isLoginMode ? 'Login Required' : 'Create Account'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {isLoginMode
                                ? 'Please login to add items to your watchlist and enjoy personalized features.'
                                : 'Create an account to start building your watchlist and get personalized recommendations.'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Login Form */}
                    {isLoginMode && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Login
                                onSuccess={handleLoginSuccess}
                                onShowRegister={handleShowRegister}
                                hideHeader={true}
                            />
                        </motion.div>
                    )}

                    {/* Register Form */}
                    {!isLoginMode && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Register onSuccess={handleLoginSuccess} onShowLogin={handleShowLogin} hideHeader={true} />
                        </motion.div>
                    )}
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
