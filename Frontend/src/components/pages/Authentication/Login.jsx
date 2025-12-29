import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthen } from '@/context/AuthenProvider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useDebounceValidation } from '@/hooks/useDebounceValidation';

const schema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email({ message: 'Invalid email format' }),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, { message: 'Password must be at least 8 characters' }),
});

export default function Login({ onSuccess, onShowRegister, hideHeader }) {
    const { login } = useAuthen();
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, dirtyFields },
        watch,
        trigger,
    } = useForm({
        resolver: zodResolver(schema),
    });

    const email = watch('email');
    const password = watch('password');

    // Use debounced validation for better UX
    const showEmailError = useDebounceValidation(
        'email',
        email,
        dirtyFields.email,
        trigger,
        1000
    );

    const showPasswordError = useDebounceValidation(
        'password',
        password,
        dirtyFields.password,
        trigger,
        1000
    );

    const onSubmit = async (data) => {
        setFormError('');
        try {
            const res = await login(data);
            if (res.success) {
                toast.success('Logged in successfully!', {
                    duration: 3000,
                    position: 'top-right',
                });
                reset();
                onSuccess?.();
            } else {
                const errorMessage = res.message || 'Invalid credentials';
                setFormError(errorMessage);
                toast.error(errorMessage, {
                    duration: 4000,
                    position: 'top-right',
                });
            }
        } catch (err) {
            const errorMessage = err?.message || 'Login failed';
            setFormError(errorMessage);
            toast.error(errorMessage, {
                duration: 4000,
                position: 'top-right',
            });
        }
    };

    return (
        <motion.div
            className={clsx('w-full', 'sm:max-w-sm', 'md:max-w-md', 'lg:max-w-lg', 'xl:max-w-xl', {
                'p-6': !hideHeader,
            })}
            style={{ minWidth: 0 }}
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to your account to continue</p>
                </div>
            )}

            {/* Form */}
            <motion.form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 p-4 sm:p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            id="email"
                            {...register('email')}
                            className={clsx('pl-10 h-12 w-full', {
                                'border-red-500': showEmailError || errors.email,
                            })}
                            placeholder="Enter your email"
                        />
                    </div>
                    {(showEmailError || errors.email) && (
                        <p className="text-sm text-red-500">{errors.email?.message}</p>
                    )}
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
                            className={clsx('pr-10 h-12 w-full', {
                                'border-red-500': showPasswordError || errors.password,
                            })}
                            placeholder="Enter your password"
                        />
                    </div>
                    {(showPasswordError || errors.password) && (
                        <p className="text-sm text-red-500">{errors.password?.message}</p>
                    )}
                </div>

                {formError && <p className="text-sm text-red-500 text-center">{formError}</p>}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                    {isSubmitting ? 'Logging in...' : 'Sign In'}
                </Button>

                <div className="text-center text-sm pt-4 border-t border-gray-200 dark:border-slate-700">
                    <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                    <button
                        type="button"
                        onClick={onShowRegister}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Create Account
                    </button>
                </div>
            </motion.form>
        </motion.div>
    );
}
