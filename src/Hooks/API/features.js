import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'https://moviehub.congminh.site/api';

// Login hook
export function useLogin() {
    return useMutation(async ({ email, password }) => {
        const res = await axios.post(
            `${API_BASE_URL}/auth/login`,
            { email, password },
            { headers: { 'Content-Type': 'application/json' } },
        );
        return res.data;
    });
}

// Register hook
export function useRegister() {
    return useMutation(async ({ email, password, ...rest }) => {
        const res = await axios.post(
            `${API_BASE_URL}/auth/register`,
            { email, password, ...rest },
            { headers: { 'Content-Type': 'application/json' } },
        );
        return res.data;
    });
}

// Logout hook (assuming POST, adjust if GET)
export function useLogout(token) {
    return useMutation(async () => {
        const res = await axios.post(
            `${API_BASE_URL}/auth/logout`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return res.data;
    });
}

// Add to watchlist hook
export function useAddToWatchlist(token) {
    return useMutation(async (item) => {
        const res = await axios.post(`${API_BASE_URL}/watchlist`, item, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    });
}
