import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Sidebar from './Sidebar';
import Topnav from './Topnav';
import Main from './Main';
import { Spinner, Button } from '../components';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = () => {
            const savedUser = localStorage.getItem('user');
            
            if (savedUser) {
                setIsLoading(false);
            } else {
                setIsLoading(false);
                // Redirect to login if no saved user
                router.visit('/');
            }
        };
        
        checkAuth();
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Spinner size="lg" label="Loading..." />
            </div>
        );
    }

    // Show login redirect if not authenticated
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please log in to access the dashboard</p>
                    <Button 
                        onClick={() => router.visit('/')}
                        variant="primary"
                    >
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Backdrop - Mobile only, when sidebar is open */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:relative
                inset-y-0 left-0
                z-40 lg:z-0
                w-72
                transform
                transition-all duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                lg:transition-all lg:duration-300 lg:ease-in-out
                ${!sidebarOpen ? 'lg:w-0 lg:overflow-hidden' : 'lg:w-72'}
                ${!sidebarOpen ? 'lg:opacity-0' : 'lg:opacity-100'}
            `}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Top Navigation */}
                <Topnav onToggleSidebar={toggleSidebar} />
                
                {/* Main Content */}
                <Main>
                    {children}
                </Main>
            </div>
        </div>
    );
};

export default AppLayout;
