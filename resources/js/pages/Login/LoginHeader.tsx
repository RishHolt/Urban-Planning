import React, { useState, useEffect } from 'react';
import LogoImage from '../../assets/Logo.svg';

const LoginHeader: React.FC = () => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        
        return date.toLocaleDateString('en-US', options).toUpperCase();
    };

    return (
        <header className="py-2 z-10 bg-background border-b-2 border-accent">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <img src={LogoImage} alt="GSM Logo" className="h-10 w-auto" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold" style={{ fontWeight: 700 }}>
                            <span className="brand-go">Go</span><span className="brand-serve">Serve</span><span className="brand-ph">PH</span>
                        </h1>
                    </div>
                    <div className="text-right">
                        <div className="text-sm">
                            <div id="currentDateTime" className="font-semibold">
                                {formatDateTime(currentDateTime)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default LoginHeader;
