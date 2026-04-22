import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../service/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const response = await api.login(email, password);
        if (response.success) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setToken(response.token);
            setUser(response.user);
            return { success: true };
        }
        return { success: false, message: response.message };
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const register = async (name, email, password) => {
        return await api.register(name, email, password);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            loading, 
            login, 
            logout, 
            register,
            isAuthenticated: !!token 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
