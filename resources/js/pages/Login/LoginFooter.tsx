import React from 'react';
import { Facebook, Twitter } from 'lucide-react';

interface LoginFooterProps {
    onTermsClick: () => void;
    onPrivacyClick: () => void;
}

const LoginFooter: React.FC<LoginFooterProps> = ({ onTermsClick, onPrivacyClick }) => {
    return (
        <footer className="bg-primary text-white py-4 mt-8 z-10">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row justify-between items-center">
                    <div className="text-center lg:text-left mb-2 lg:mb-0">
                        <h3 className="text-lg font-bold mb-1">Government Services Management System</h3>
                        <p className="text-xs opacity-90">
                            For any inquiries, please call 122 or email helpdesk@gov.ph
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex space-x-3">
                            <button 
                                type="button" 
                                onClick={onTermsClick}
                                className="text-xs hover:underline"
                            >
                                TERMS OF SERVICE
                            </button>
                            <span>|</span>
                            <button 
                                type="button" 
                                onClick={onPrivacyClick}
                                className="text-xs hover:underline"
                            >
                                PRIVACY POLICY
                            </button>
                        </div>
                        <div className="flex space-x-2">
                            <a 
                                href="#" 
                                className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="text-white text-xs" size={12} />
                            </a>
                            <a 
                                href="#" 
                                className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="text-white text-xs" size={12} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default LoginFooter;
