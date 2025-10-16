import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data based on email
const getUserByEmail = (email: string): User | null => {
    const users: Record<string, User> = {
        'admin@urbanplanning.com': {
            id: 1,
            name: 'Admin User',
            email: 'admin@urbanplanning.com',
            role: 'IT_ADMIN',
            firstName: 'Admin',
            lastName: 'User'
        },
        'zoning@urbanplanning.com': {
            id: 2,
            name: 'Zoning Admin',
            email: 'zoning@urbanplanning.com',
            role: 'ZONING_ADMIN',
            firstName: 'Zoning',
            lastName: 'Admin'
        },
        'building@urbanplanning.com': {
            id: 3,
            name: 'Building Officer',
            email: 'building@urbanplanning.com',
            role: 'BUILDING_OFFICER',
            firstName: 'Building',
            lastName: 'Officer'
        },
        'housing@urbanplanning.com': {
            id: 4,
            name: 'Housing Officer',
            email: 'housing@urbanplanning.com',
            role: 'ZONING_OFFICER',
            firstName: 'Housing',
            lastName: 'Officer'
        }
    };

    return users[email] || null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Mock credentials
        const mockCredentials = {
            'admin@urbanplanning.com': 'admin123',
            'zoning@urbanplanning.com': 'zoning123',
            'building@urbanplanning.com': 'building123',
            'housing@urbanplanning.com': 'housing123'
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (mockCredentials[email as keyof typeof mockCredentials] === password) {
            const userData = getUserByEmail(email);
            if (userData) {
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userData));
                return true;
            }
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
