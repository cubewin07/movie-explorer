import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuthen } from '@/context/AuthenProvider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const schema = z
    .object({
        username: z.string().min(2, 'Username is required'),
        email: z.string().email({ message: 'Invalid email format' }),
        password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
        confirmPassword: z.string().min(6, { message: 'Confirm your password' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export default function Register({ onSuccess }) {
    const { register: registerUser } = useAuthen();
    const [error, setError] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        setError('');
        const res = await registerUser(data);
        if (res.success) {
            onSuccess?.();
        } else {
            setError('Registration failed');
        }
    };

    return (
        <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 p-6 bg-background border border-border rounded-xl shadow-lg w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    {...register('username')}
                    placeholder="Your username"
                    className={errors.username && 'border-red-500'}
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    {...register('email')}
                    placeholder="you@example.com"
                    className={errors.email && 'border-red-500'}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={errors.password && 'border-red-500'}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    placeholder="Re-enter password"
                    className={errors.confirmPassword && 'border-red-500'}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
                <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                </motion.p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
        </motion.form>
    );
}
