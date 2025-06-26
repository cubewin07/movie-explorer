import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthen } from '@/context/AuthenProvider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const schema = z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function Login({ onSuccess, onShowRegister }) {
    const { login } = useAuthen();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = (data) => {
        toast.promise(login(data), {
            loading: 'Logging in...',
            success: (res) => {
                if (res.success) {
                    onSuccess?.();
                    return 'Logged in successfully!';
                } else {
                    throw new Error('Invalid credentials');
                }
            },
            error: (err) => err.message || 'Login failed',
        });
    };

    return (
        <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-sm space-y-6 px-6 py-8 bg-background border border-border rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register('email')} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>

            <div className="text-center text-sm mt-4">
                Don't have an account?{' '}
                <button type="button" onClick={onShowRegister} className="text-blue-600 underline">
                    Register
                </button>
            </div>
        </motion.form>
    );
}
