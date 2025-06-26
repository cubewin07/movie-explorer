import { createContext, useContext, useState, useEffect } from 'react';

const AuthenContext = createContext();

export function AuthenProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
    }, []);

    const login = async ({ email, password }) => {
        // Demo: accept any email/password
        const fakeUser = { email };
        setUser(fakeUser);
        localStorage.setItem('user', JSON.stringify(fakeUser));
        return { success: true };
    };

    const register = async ({ email, password }) => {
        // Demo: accept any email/password
        const fakeUser = { email };
        setUser(fakeUser);
        localStorage.setItem('user', JSON.stringify(fakeUser));
        return { success: true };
    };

    const logout = () => {
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
