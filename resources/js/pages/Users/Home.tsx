import React, { useState, useEffect } from 'react';
import { MapPin, Clock, MessageCircle, X, ChevronDown, ChevronUp, User, LogOut, Settings } from 'lucide-react';
import { useAppearance } from '../../hooks/use-appearance';
import { router } from '@inertiajs/react';
import { apiService, type User as ApiUser } from '../../lib/api';
import Swal from 'sweetalert2';
import { Button } from '../../components';
import BackgroundImage from '../../assets/Background.png';
import { ZoningClearanceModal } from './Services';

const Home: React.FC = () => {
    const { appearance, updateAppearance } = useAppearance();
    const theme = appearance;
    const toggleTheme = () => updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userData, setUserData] = useState<ApiUser | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isZoningModalOpen, setIsZoningModalOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'bot',
            message: 'Hello! I\'m your virtual assistant. How can I help you with government services today?',
            timestamp: new Date()
        }
    ]);

    // Get user data on component mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            // Skip auth check if we're in the process of logging out
            if (isLoggingOut) {
                console.log('⏸️ Skipping auth check - user is logging out');
                return;
            }

            try {
                // First check if there's user data in localStorage
                const localUser = JSON.parse(localStorage.getItem('user') || '{}');
                
                if (localUser && localUser.id) {
                    // If there's local user data, verify with server
                    try {
                        const response = await apiService.getCurrentUser();
                        if (response.success && response.user) {
                            console.log('✅ User authenticated with server:', response.user);
                            setUserData(response.user);
                        } else {
                            // Server says not authenticated, clear local data
                            console.log('❌ Server authentication failed, clearing local data');
                            localStorage.removeItem('user');
                            setUserData(null);
                        }
                    } catch (error) {
                        // Server error, clear local data
                        console.log('❌ Server error, clearing local data:', error);
                        localStorage.removeItem('user');
                        setUserData(null);
                    }
                } else {
                    // No local user data
                    console.log('🔍 No local user data found');
                    setUserData(null);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setUserData(null);
            }
        };

        checkAuthStatus();
    }, [isLoggingOut]);

    // Listen for storage changes (when user logs out from another tab/window)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user' && e.newValue === null) {
                console.log('🧹 User data cleared from another tab/window');
                setUserData(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

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

    const services = [
        {
            id: 1,
            title: 'Zoning Clearance Application',
            description: 'Apply for zoning clearance for business or building permits',
            icon: '/images/services/BCID.png',
            color: 'bg-green-100',
            textColor: 'text-green-800',
            borderColor: 'border-green-200'
        },
        {
            id: 2,
            title: 'Feedback and Grievance Portal',
            description: 'Submit feedback and report concerns',
            icon: '/images/services/FGP.png',
            color: 'bg-blue-100',
            textColor: 'text-blue-800',
            borderColor: 'border-blue-200'
        },
        {
            id: 3,
            title: 'Public Consultation and Survey Tools',
            description: 'Participate in community surveys and consultations',
            icon: '/images/services/PCST.png',
            color: 'bg-purple-100',
            textColor: 'text-purple-800',
            borderColor: 'border-purple-200'
        },
        {
            id: 4,
            title: 'AICS - Assistance to Individuals in Crisis Situation',
            description: 'Financial assistance for individuals in crisis',
            icon: '/images/services/aim.png',
            color: 'bg-orange-100',
            textColor: 'text-orange-800',
            borderColor: 'border-orange-200'
        },
        {
            id: 5,
            title: 'CCSWDD - Social Welfare Services',
            description: 'Social welfare and development programs',
            icon: '/images/services/ccswdd.jpg',
            color: 'bg-pink-100',
            textColor: 'text-pink-800',
            borderColor: 'border-pink-200'
        },
        {
            id: 6,
            title: 'OSCA/PDAO/Livelihood Programs',
            description: 'Senior citizen and PWD services, livelihood support',
            icon: '/images/services/osca.jpg',
            color: 'bg-indigo-100',
            textColor: 'text-indigo-800',
            borderColor: 'border-indigo-200'
        }
    ];

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        const newMessage = {
            id: chatMessages.length + 1,
            type: 'user' as const,
            message: chatMessage,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, newMessage]);
        setChatMessage('');

        // Simulate bot response
        setTimeout(() => {
            const botResponse = {
                id: chatMessages.length + 2,
                type: 'bot' as const,
                message: 'Thank you for your message. Our team will get back to you soon. Is there anything else I can help you with?',
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, botResponse]);
        }, 1000);
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
        setUserData(null);
        setIsProfileOpen(false);
        
        // Reset logout flag after a short delay
        setTimeout(() => {
            setIsLoggingOut(false);
        }, 1000);
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Navigation Bar */}
            <header className="py-2 bg-primary border-b-2 border-accent sticky top-0" style={{ zIndex: 10000 }}>
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
                                                        className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 transition-all duration-200 cursor-pointer group rounded-lg"
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
                                                    className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center space-x-3 transition-all duration-200 cursor-pointer group rounded-lg"
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

            {/* Hero Section */}
            <div 
                className="relative flex items-center justify-center"
                style={{ 
                    minHeight: '300px'
                }}
            >
                {/* Background Image */}
                <img 
                    src={BackgroundImage}
                    alt="Caloocan City Background"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <div className="relative z-20 flex flex-col items-center justify-center text-center text-white px-4 mx-auto">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        Welcome to Caloocan City
                    </h1>
                    <p className="text-xl md:text-2xl lg:text-3xl mb-10 max-w-2xl mx-auto leading-relaxed">
                        Your Gateway to Government Services
                    </p>
                    <Button 
                        onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                        variant="outlined" 
                        size="lg"
                        className="bg-white text-green-600 px-10 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                        Explore Services
                    </Button>
                </div>
            </div>

            {/* Services Section */}
            <section id="services" className="py-12 sm:py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className={`text-3xl font-bold mb-6 sm:mb-8 text-center ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                        Our Services
                    </h2>
                    
                    {/* Service Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                onClick={() => {
                                    if (service.id === 1) {
                                        setIsZoningModalOpen(true);
                                    }
                                }}
                                className={`${service.color} ${service.borderColor} border-2 rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out transform`}
                            >
                                <div className="p-6 flex flex-col items-center flex-grow">
                                    <img 
                                        src={service.icon} 
                                        alt={service.title}
                                        className="w-24 h-24 mb-4 object-contain"
                                    />
                                    <h3 className={`text-xl font-bold text-center mb-2 ${service.textColor}`}>
                                        {service.title}
                                    </h3>
                                    <p className={`text-center text-sm ${service.textColor} opacity-80`}>
                                        {service.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-800'} text-white py-12`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Contact Information */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                            <div className="space-y-2">
                                <p className="flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Caloocan City Hall, Metro Manila
                                </p>
                                <p className="flex items-center">
                                    <Clock className="w-5 h-5 mr-2" />
                                    Monday - Friday: 8:00 AM - 5:00 PM
                                </p>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                            <div className="space-y-2">
                                <a href="#services" className="block hover:text-gray-300 transition-colors">
                                    Our Services
                                </a>
                                <a href="#" className="block hover:text-gray-300 transition-colors">
                                    About Us
                                </a>
                                <a href="#" className="block hover:text-gray-300 transition-colors">
                                    Contact
                                </a>
                            </div>
                        </div>

                        {/* Dark Mode Toggle */}
                        <div className="flex flex-col items-end">
                            <h3 className="text-xl font-bold mb-4">Preferences</h3>
                            <Button
                                onClick={toggleTheme}
                                variant="ghost"
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                                    theme === 'dark' 
                                        ? 'bg-gray-700 hover:bg-gray-600' 
                                        : 'bg-gray-600 hover:bg-gray-500'
                                }`}
                            >
                                {theme === 'dark' ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <span>Light Mode</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                        <span>Dark Mode</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                        <p>&copy; 2024 Caloocan City Government. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Floating Chatbot */}
            <div className="fixed bottom-4 right-4 z-50">
                {/* Chat Toggle Button */}
                {!isChatOpen && (
                    <Button
                        onClick={() => setIsChatOpen(true)}
                        variant="success"
                        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-colors duration-200"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </Button>
                )}

                {/* Chat Window */}
                {isChatOpen && (
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-80 h-96 flex flex-col`}>
                        {/* Chat Header */}
                        <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                            <h3 className="font-semibold">Virtual Assistant</h3>
                            <Button
                                onClick={() => setIsChatOpen(false)}
                                variant="ghost"
                                className="text-white hover:text-gray-200 p-2"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs px-3 py-2 rounded-lg ${
                                            msg.type === 'user'
                                                ? 'bg-green-600 text-white'
                                                : theme === 'dark'
                                                ? 'bg-gray-700 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        <p className="text-sm">{msg.message}</p>
                                        <p className="text-xs opacity-70 mt-1">
                                            {msg.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleChatSubmit} className="p-4 border-t">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className={`flex-1 px-3 py-2 rounded-lg border ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-800'
                                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                                />
                                <Button
                                    type="submit"
                                    variant="success"
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                >
                                    Send
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Zoning Clearance Modal */}
            <ZoningClearanceModal
                isOpen={isZoningModalOpen}
                onClose={() => setIsZoningModalOpen(false)}
            />
        </div>
    );
};

export default Home;
