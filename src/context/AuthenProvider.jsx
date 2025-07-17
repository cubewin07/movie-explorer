import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useLogin, useRegister, useLogout, useGetUserInfo } from '../hooks/API/features';

const AuthenContext = createContext();

export function AuthenProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Always call hooks at the top level
    const loginMutation = useLogin();
    const { mutateAsync: registerMutateAsync } = useRegister();
    const token = Cookies.get('token');
    const logoutMutation = useLogout(token || '');
    const userInfoQuery = token ? useGetUserInfo(token) : { data: null };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
    }, []);

    // On mount, check for token in cookies and set user if needed
    useEffect(() => {
        if (token && !user && userInfoQuery.data) {
            setUser(userInfoQuery.data);
        }
    }, [user, token, userInfoQuery.data]);

    const login = async ({ email, password }) => {
        try {
            const res = await loginMutation.mutateAsync({ email, password });
            if (res?.data?.token && res?.data?.user) {
                Cookies.set('token', res.data.token, { expires: 7 });
                setUser(res.data.user);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                return { success: true };
            }
            return { success: true };
        } catch (err) {
            console.log(err);
            return { success: false, message: err?.response?.data?.message || 'Login failed' };
        }
    };

    const register = async ({ email, password, username }) => {
        try {
            const res = await registerMutateAsync({ email, password, username });
            if (res?.token && res?.user) {
                Cookies.set('token', res.token, { expires: 7 });
                setUser(res.user);
                localStorage.setItem('user', JSON.stringify(res.user));
                return { success: true };
            }
            return { success: true };
        } catch (err) {
            console.log(err);
            return { success: false, message: err?.response?.data?.message || 'Register failed' };
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await logoutMutation.mutateAsync();
            }
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
