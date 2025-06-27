import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthen } from '@/context/AuthenProvider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, User, Mail, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const schema = z
    .object({
        username: z.string().min(2, 'Username is required'),
        email: z.string().email({ message: 'Invalid email format' }),
        password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
        confirmPassword: z.string().min(6),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export default function Register({ onSuccess, onShowLogin, hideHeader }) {
    const { register: registerUser } = useAuthen();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = (data) => {
        toast.promise(registerUser(data), {
            loading: 'Creating your account...',
            success: () => {
                onSuccess?.();
                return 'Account created successfully!';
            },
            error: () => 'Registration failed. Try again.',
        });
    };

    return (
        <motion.div
            className={clsx('w-full', {
                'max-w-lg p-6': !hideHeader,
                // 'max-w-md': hideHeader,
            })}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            {!hideHeader && (
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Join us to start building your watchlist</p>
                </div>
            )}

            {/* Form */}
            <motion.form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            id="username"
                            {...register('username')}
                            className="pl-10 h-12"
                            placeholder="Enter your username"
                        />
                    </div>
                    {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            id="email"
                            {...register('email')}
                            className="pl-10 h-12"
                            placeholder="Enter your email"
                        />
                    </div>
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            type={showPassword ? 'text' : 'password'}
                            {...register('password')}
                            className="pr-10 h-12"
                            placeholder="Enter your password"
                        />
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                    </Label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...register('confirmPassword')}
                            className="pr-10 h-12"
                            placeholder="Confirm your password"
                        />
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>

                <div className="text-center text-sm pt-4 border-t border-gray-200 dark:border-slate-700">
                    <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                    <button
                        type="button"
                        onClick={onShowLogin}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Sign In
                    </button>
                </div>
            </motion.form>
        </motion.div>
    );
}
