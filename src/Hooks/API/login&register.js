import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'https://moviehub.congminh.site/api';

// Login hook
export function useLogin() {
    return useMutation({
        mutationFn: async ({ email, password }) => {
            const res = await axios.post(
                `${API_BASE_URL}/auth/login`,
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
                `${API_BASE_URL}/auth/register`,
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
            const res = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        },
        enabled: !!token, // Only run if token exists
    });
}
