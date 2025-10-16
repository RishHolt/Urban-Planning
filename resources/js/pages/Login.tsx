import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Mock credentials
    const mockCredentials = {
        'admin@urbanplanning.com': 'admin123',
        'zoning@urbanplanning.com': 'zoning123',
        'building@urbanplanning.com': 'building123',
        'housing@urbanplanning.com': 'housing123'
    };

    // Mock user data
    const getUserByEmail = (email: string) => {
        const users: Record<string, any> = {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check credentials
            if (mockCredentials[formData.email as keyof typeof mockCredentials] === formData.password) {
                const userData = getUserByEmail(formData.email);
                if (userData) {
                    // Save user data to localStorage
                    localStorage.setItem('user', JSON.stringify(userData));
                    // Redirect to dashboard
                    router.visit('/dashboard');
                } else {
                    setErrors({ email: 'Invalid credentials. Please try again.' });
                }
            } else {
                setErrors({ email: 'Invalid credentials. Please try again.' });
            }
        } catch (error) {
            setErrors({ email: 'An error occurred. Please try again.' });
        }

        setIsLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="bg-primary p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">UP</span>
                    </div>
                    <h1 className="text-3xl font-bold text-primary mb-2">Urban Planning System</h1>
                    <p className="text-muted">Sign in to access the management dashboard</p>
                </div>

                {/* Login Form */}
                <div className="card-theme">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={16} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`input-theme pl-10 ${errors.email ? 'border-error' : ''}`}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-error">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={16} />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`input-theme pl-10 pr-10 ${errors.password ? 'border-error' : ''}`}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-error">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-surface-variant rounded-theme-md">
                        <h3 className="text-sm font-medium text-primary mb-2">Demo Credentials:</h3>
                        <div className="space-y-1 text-xs text-muted">
                            <p><strong>Admin:</strong> admin@urbanplanning.com / admin123</p>
                            <p><strong>Zoning:</strong> zoning@urbanplanning.com / zoning123</p>
                            <p><strong>Building:</strong> building@urbanplanning.com / building123</p>
                            <p><strong>Housing:</strong> housing@urbanplanning.com / housing123</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-muted">
                        Urban Planning Management System v1.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
