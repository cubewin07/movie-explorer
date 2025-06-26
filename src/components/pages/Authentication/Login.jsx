import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuthen } from '@/context/AuthenProvider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const schema = z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function Login({ onSuccess, onShowRegister }) {
    const { login } = useAuthen();
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
        const res = await login(data);
        if (res.success) {
            onSuccess?.();
        } else {
            setError('Invalid credentials');
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
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
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
                    placeholder="Enter your password"
                    className={errors.password && 'border-red-500'}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {error && (
                <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                </motion.p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>

            <div className="text-sm text-center">
                Don’t have an account?{' '}
                <button type="button" onClick={onShowRegister} className="text-primary underline hover:text-primary/80">
                    Register
                </button>
            </div>
        </motion.form>
    );
}
