import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthen } from '@/context/AuthenProvider';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
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
            if (onSuccess) onSuccess();
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label>Email</label>
                <input {...register('email')} className="input input-bordered w-full" />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <div>
                <label>Password</label>
                <input type="password" {...register('password')} className="input input-bordered w-full" />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-center text-xs mt-2">
                Don't have an account?{' '}
                <button type="button" className="text-blue-600 underline" onClick={onShowRegister}>
                    Register
                </button>
            </div>
        </form>
    );
}
