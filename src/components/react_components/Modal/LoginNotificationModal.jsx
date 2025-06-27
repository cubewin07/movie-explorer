import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthen } from '@/context/AuthenProvider';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, User, Mail, Eye, EyeOff } from 'lucide-react';

export function LoginNotificationModal({ isOpen, onClose, onLoginSuccess }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, register } = useAuthen();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isLoginMode) {
                const result = await login(formData);
                if (result.success) {
                    toast.success('Logged in successfully!');
                    onLoginSuccess?.();
                    onClose();
                }
            } else {
                const result = await register(formData);
                if (result.success) {
                    toast.success('Registered successfully!');
                    setIsLoginMode(true);
                    setFormData({ email: '', password: '', username: '' });
                }
            }
        } catch (error) {
            toast.error(error.message || 'Authentication failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({ email: '', password: '', username: '' });
        setIsLoginMode(true);
        setShowPassword(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="p-6"
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLoginMode && (
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium">
                                    Username
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="pl-10"
                                        required={!isLoginMode}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="pr-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
                            {isSubmitting
                                ? isLoginMode
                                    ? 'Logging in...'
                                    : 'Creating account...'
                                : isLoginMode
                                  ? 'Login'
                                  : 'Create Account'}
                        </Button>
                    </form>

                    {/* Footer */}
                    <DialogFooter className="mt-6 pt-4 border-t">
                        <div className="text-center w-full">
                            <p className="text-sm text-muted-foreground">
                                {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLoginMode(!isLoginMode);
                                        setFormData({ email: '', password: '', username: '' });
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {isLoginMode ? 'Register' : 'Login'}
                                </button>
                            </p>
                        </div>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
