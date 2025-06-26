import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthen } from '@/context/AuthenProvider';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const schema = z
    .object({
        email: z.string().email(),
        password: z.string().min(6),
        confirmPassword: z.string().min(6),
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
            if (onSuccess) onSuccess();
        } else {
            setError('Registration failed');
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
            <div>
                <label>Confirm Password</label>
                <input type="password" {...register('confirmPassword')} className="input input-bordered w-full" />
                {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
        </form>
    );
}
