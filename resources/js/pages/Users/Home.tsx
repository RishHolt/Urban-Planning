import React, { useState, useEffect } from 'react';
import { MapPin, Clock, MessageCircle, X } from 'lucide-react';
import { useAppearance } from '../../hooks/use-appearance';
import { router } from '@inertiajs/react';
import { apiService, type User as ApiUser } from '../../lib/api';
import { Button, PageHeader } from '../../components';
import BackgroundImage from '../../assets/Background.png';
import { ZoningClearanceModal } from './Services';

const Home: React.FC = () => {
    const { appearance, updateAppearance } = useAppearance();
    const theme = appearance;
    const toggleTheme = () => updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [userData, setUserData] = useState<ApiUser | null>(null);
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
    }, []);

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

    const handleUserDataChange = (user: ApiUser | null) => {
        setUserData(user);
    };

    const handleLogout = () => {
        // This is called by PageHeader after logout is complete
        console.log('Logout completed');
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Navigation Bar */}
            <PageHeader 
                userData={userData}
                onUserDataChange={handleUserDataChange}
                onLogout={handleLogout}
            />

            {/* Hero Section */}
            <div 
                className="relative flex items-center justify-center min-h-screen"
            >
                {/* Background Image */}
                <img 
                    src={BackgroundImage}
                    alt="Caloocan City Background"
                    className="absolute inset-0 w-full h-full object-cover z-1"
                />
                <div className="absolute inset-0 bg-black/50 z-2"></div>
                <div className="relative z-3 flex flex-col items-center justify-center text-center text-white px-4 mx-auto">
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
