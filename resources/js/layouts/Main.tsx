import React from 'react';

interface MainProps {
    children: React.ReactNode;
}

const Main = ({ children }: MainProps) => {
    return (
        <div className="w-full bg-background p-6 overflow-y-auto text-primary min-h-screen">
            <div className="container mx-auto">
                <div className="bg-surface p-6 rounded-theme-lg shadow-theme-md">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Main;