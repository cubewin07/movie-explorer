import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Login hook
export function useLogin() {
    return useMutation({
        mutationFn: async ({ email, password }) => {
            const res = await axios.post(
                `${API_BASE_URL}/user/login`,
                { email, password },
                { headers: { 'Content-Type': 'application/json' } },
            );
            return res.data;
        },
    });
}

// Register hook for user registration
export function useRegister() {
    return useMutation({
        mutationFn: async ({ email, password, username }) => {
            const res = await axios.post(
                `${API_BASE_URL}/user/register`,
                { email, password, username },
                { headers: { 'Content-Type': 'application/json' } },
            );
            return res.data;
        },
    });
}

// Logout hook
export function useLogout(token) {
    return useMutation({
        mutationFn: async (email, password) => {
            console.log(email, password);
            const res = await axios.post(
                `${API_BASE_URL}/auth/logout`,
                {email, password},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            return res.data;
        },
    });
}

// Get user info hook
export function useGetUserInfo(token) {
    return useQuery({
        queryKey: ['userInfo', token],
        queryFn: async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                return res.data;
            } catch (error) {
                // Re-throw the error so it can be handled by the AuthenProvider
                throw error;
            }
        },
        enabled: !!token, // Only run if token exists
        retry: (failureCount, error) => {
            // Don't retry on authentication errors (401, 403)
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                return false;
            }
            // Retry up to 2 times for other errors
            return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
