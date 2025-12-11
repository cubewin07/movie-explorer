import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { useLogin, useRegister, useGetUserInfo } from '../hooks/API/login&register';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import Login from '../components/pages/Authentication/Login';
import { useQueryClient } from '@tanstack/react-query';

const AuthenContext = createContext();

export function AuthenProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const queryClient = useQueryClient();

    // Always call hooks at the top level
    const loginMutation = useLogin();
    const { mutateAsync: registerMutateAsync } = useRegister();
    const token = Cookies.get('token');
    const userInfoQuery = useGetUserInfo(token);

    // Handle token expiration and automatic logout
    const handleTokenExpiration = () => {
        Cookies.remove('token');
        setUser(null);
        toast.error('Your session has expired. Please log in again.', {
            duration: 5000,
            position: 'top-center',
            action: {
                label: 'Login',
                onClick: () => {
                    setShowLoginModal(true);
                }
            }
        });
    };

    // Initialize user on mount - fetch user info if token exists
    useEffect(() => {
        if (token && userInfoQuery.data) {
            setUser(userInfoQuery.data);
        } else if (token && userInfoQuery.error) {
            // Check if error is due to token expiration (401 or 403)
            const errorStatus = userInfoQuery.error?.response?.status;
            if (errorStatus === 401 || errorStatus === 403) {
                handleTokenExpiration();
            }
        }
        setLoading(false);
    }, [token, userInfoQuery.data, userInfoQuery.error]);

    // Monitor userInfoQuery for token expiration errors
    useEffect(() => {
        if (userInfoQuery.error && token) {
            const errorStatus = userInfoQuery.error?.response?.status;
            if (errorStatus === 401 || errorStatus === 403) {
                handleTokenExpiration();    
            }
        }
    }, [userInfoQuery.error, token]);


    const login = async ({ email, password }) => {
        try {
        const res = await loginMutation.mutateAsync({ email, password });
        if (res?.token) {

            // Clear all queries and mutations to avoid stale data
            await queryClient.cancelQueries();
            queryClient.clear(); 

            Cookies.set('token', res.token, { expires: 7 });
            return { success: true };
        }
        return { success: false, message: res?.message || 'Login failed' };
    } catch (err) {
        return { success: false, message: err?.response?.data?.message || 'Login failed' };
    }
    };

    const register = async ({ email, password, username }) => {
        try {
            const res = await registerMutateAsync({ email, password, username });
            if (res?.token) {
                Cookies.set('token', res.token, { expires: 7 });
                setUser(res.user);
                return { success: true };
            }
            return { success: false, message: res?.message || 'Register failed' };
        } catch (err) {
            return { success: false, message: err?.response?.data?.message || 'Register failed' };
        }
    };

    const logout = async (showNotification = true) => {

            // Clear all queries and mutations to avoid stale data
            await queryClient.cancelQueries();
            queryClient.clear();

            // remove all cookies
            Cookies.remove('token');
            localStorage.removeItem('sessionToken');
            setUser(null);
            if (showNotification) toast.success('Logged out successfully');
    };
        
    // Handle login modal success
    const handleLoginModalSuccess = () => {
        setShowLoginModal(false);
    };

    // Handle login modal close
    const handleLoginModalClose = () => {
        setShowLoginModal(false);
    };

    return (
        <AuthenContext.Provider value={{ user, loading, login, register, logout, showLoginModal, setShowLoginModal, token }}>
            {children}
            <Dialog open={showLoginModal} onOpenChange={handleLoginModalClose}>
                <DialogContent className="w-full max-w-md">
                    <DialogHeader>
                        <DialogTitle>Session Expired</DialogTitle>
                    </DialogHeader>
                    <Login 
                        onSuccess={handleLoginModalSuccess}
                        hideHeader={true}
                    />
                </DialogContent>
            </Dialog>
        </AuthenContext.Provider>
    );
}

export function useAuthen() {
    return useContext(AuthenContext);
}
