import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useAppearance } from '../hooks/use-appearance';
import { router } from '@inertiajs/react';
import { apiService, type User as ApiUser } from '../lib/api';
import Swal from 'sweetalert2';
import { Button } from '../components';

interface PageHeaderProps {
    userData: ApiUser | null;
    onUserDataChange: (user: ApiUser | null) => void;
    onLogout: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ userData, onUserDataChange, onLogout }) => {
    const { appearance, updateAppearance } = useAppearance();
    const theme = appearance;
    const toggleTheme = () => updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogout = async () => {
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Logout Confirmation',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
        });
        
        if (!result.isConfirmed) {
            return;
        }
        
        // Set logout flag to prevent auth check from running
        setIsLoggingOut(true);
        
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        localStorage.removeItem('user');
        onUserDataChange(null);
        setIsProfileOpen(false);
        onLogout();
        
        // Reset logout flag after a short delay
        setTimeout(() => {
            setIsLoggingOut(false);
        }, 1000);
    };

    // Close profile dropdown when clicking outside or pressing Escape
    useEffect(() => {
        if (!isProfileOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.profile-dropdown')) {
                setIsProfileOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsProfileOpen(false);
            }
        };

        // Add event listeners with a small delay to prevent immediate closure
        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside, true);
            document.addEventListener('keydown', handleKeyDown);
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside, true);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isProfileOpen]);

    return (
        <header className="py-2 bg-primary border-b-2 border-accent sticky top-0 z-4">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <img src="/images/services/city.png" alt="Caloocan City Seal" className="h-10 w-auto" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold" style={{ fontWeight: 700 }}>
                            <span className="text-white">Go</span><span className="text-white">Serve</span><span className="text-white">PH</span>
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Live Time and Date */}
                        <div className="text-right">
                            <div className="text-lg font-semibold">
                                {formatTime(currentTime)}
                            </div>
                            <div className="text-sm opacity-90">
                                {formatDate(currentTime)}
                            </div>
                        </div>

                        {/* Dark Mode Toggle */}
                        <Button
                            onClick={toggleTheme}
                            variant="ghost"
                            className={`${
                                theme === 'dark' 
                                    ? 'text-yellow-400 hover:bg-gray-600' 
                                    : 'text-gray-700 hover:bg-gray-200'
                            }`}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </Button>

                        {/* Profile Dropdown or Login Button */}
                        {userData ? (
                            <div className="relative profile-dropdown">
                                <Button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    variant="ghost"
                                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                                    aria-expanded={isProfileOpen}
                                    aria-haspopup="true"
                                    aria-label="User profile menu"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-sm text-white shadow-md">
                                        {getInitials(userData?.name || 'User')}
                                    </div>
                                    <span className="hidden sm:block font-medium">
                                        {userData?.name || 'User'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </Button>

                                {/* Profile Dropdown Menu */}
                                <div 
                                    className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 transition-all duration-300 ease-in-out transform origin-top-right backdrop-blur-sm overflow-hidden ${
                                        isProfileOpen 
                                            ? 'opacity-100 scale-100 translate-y-0 visible' 
                                            : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                                    }`}
                                    role="menu"
                                    aria-orientation="vertical"
                                    style={{
                                        zIndex: 10001,
                                        animation: isProfileOpen ? 'dropdownSlideIn 0.3s ease-out' : 'dropdownSlideOut 0.2s ease-in'
                                    }}
                                >
                                    {/* User Info Header */}
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-sm text-white shadow-md">
                                                {getInitials(userData?.name || 'User')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{userData?.name || 'User'}</p>
                                                <p className="text-xs text-gray-500 truncate">{userData?.email || 'user@example.com'}</p>
                                                <div className="flex items-center mt-1">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {userData?.role || 'CITIZEN'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Menu Items */}
                                    <div className="py-1">
                                        {/* Admin Panel Option - Only for admin users */}
                                        {(userData?.role === 'IT_ADMIN' || userData?.role === 'ZONING_ADMIN' || userData?.role === 'BUILDING_OFFICER' || userData?.role === 'ZONING_OFFICER') && (
                                            <div className="px-1">
                                                <Button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        setIsNavigating(true);
                                                        router.visit('/dashboard');
                                                    }}
                                                    variant="ghost"
                                                    size="sm"
                                                    loading={isNavigating}
                                                    disabled={isNavigating}
                                                    className="w-full justify-start px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 transition-all duration-200 cursor-pointer group rounded-lg"
                                                    role="menuitem"
                                                >
                                                    <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200 flex-shrink-0" />
                                                    <span className="font-medium truncate">{isNavigating ? 'Navigating...' : 'Go to Admin Panel'}</span>
                                                </Button>
                                            </div>
                                        )}
                                        
                                        <div className="px-1">
                                            <Button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    // Add profile functionality here
                                                }}
                                                variant="ghost"
                                                size="sm"
                                                className="w-full px-3 justify-start py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center space-x-3 transition-all duration-200 cursor-pointer group rounded-lg"
                                                role="menuitem"
                                            >
                                                <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                                                <span className="font-medium truncate">Profile Settings</span>
                                            </Button>
                                        </div>
                                    
                                        
                                        <div className="border-t border-gray-100 my-1 mx-2"></div>
                                        
                                        <div className="px-1">
                                            <Button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    handleLogout();
                                                }}
                                                variant="ghost"
                                                size="sm"
                                                loading={isLoggingOut}
                                                disabled={isLoggingOut}
                                                className="w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-3 transition-all duration-200 cursor-pointer group rounded-lg"
                                                role="menuitem"
                                            >
                                                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                                                <span className="font-medium truncate">{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={() => router.visit('/login')}
                                variant="success"
                                className="flex items-center space-x-2"
                            >
                                <User className="w-4 h-4" />
                                <span>Login</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PageHeader;
