'use client';
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'program_manager' | 'finance_manager' | 'viewer';
    profilePictureUrl?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    isLoading: boolean;
    mustChangePassword: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    clearMustChangePassword: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mustChangePassword, setMustChangePassword] = useState(false);
    const router = useRouter();

    const loadUserFromToken = (tokenToLoad: string) => {
        try {
            const decoded = jwtDecode(tokenToLoad) as { user: User, exp: number };
            if (decoded && decoded.exp * 1000 > Date.now()) {
                setUser(decoded.user);
                setToken(tokenToLoad);
                return true;
            }
        } catch (error) {
            console.error("Invalid token during load:", error);
        }
        localStorage.removeItem('token');
        return false;
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) loadUserFromToken(storedToken);
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { token: newToken, mustChangePassword: mustChange } = response.data;
        localStorage.setItem('token', newToken);
        loadUserFromToken(newToken);
        setMustChangePassword(!!mustChange);
        if (!!mustChange) {
            router.push('/change-password');
        } else {
            router.push('/dashboard');
        }
    };
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setMustChangePassword(false);
        router.push('/login');
    };
    const refreshUser = async () => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            loadUserFromToken(storedToken);
        }
    };
    const clearMustChangePassword = () => setMustChangePassword(false);
    const value = { isAuthenticated: !!token, user, token, isLoading, mustChangePassword, login, logout, refreshUser, clearMustChangePassword };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};