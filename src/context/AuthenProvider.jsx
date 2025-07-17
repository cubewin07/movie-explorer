import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useLogin, useRegister, useLogout } from '../hooks/API/features';

const AuthenContext = createContext();

export function AuthenProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
    }, []);

    // On mount, check for token in cookies and set if needed
    useEffect(() => {
        const token = Cookies.get('token');
        if (token && !user) {
            // Optionally, fetch user info with token here if needed
            // For now, just ensure token is available in cookies
        }
    }, [user]);

    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const logoutMutation = useLogout(Cookies.get('token'));

    const login = async ({ email, password }) => {
        try {
            const res = await loginMutation.mutateAsync({ email, password });
            if (res?.data?.token && res?.data?.user) {
                Cookies.set('token', res.data.token, { expires: 7 });
                setUser(res.data.user);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                return { success: true };
            }
            return { success: false };
        } catch (err) {
            return { success: false, message: err?.response?.data?.message || 'Login failed' };
        }
    };

    const register = async ({ email, password, username }) => {
        try {
            const res = await registerMutation.mutateAsync({ email, password, username });
            if (res?.data?.token && res?.data?.user) {
                Cookies.set('token', res.data.token, { expires: 7 });
                setUser(res.data.user);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                return { success: true };
            }
            return { success: false };
        } catch (err) {
            return { success: false, message: err?.response?.data?.message || 'Register failed' };
        }
    };

    const logout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } catch (err) {
            // Optionally handle error
        }
        Cookies.remove('token');
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthenContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthenContext.Provider>
    );
}

export function useAuthen() {
    return useContext(AuthenContext);
}
