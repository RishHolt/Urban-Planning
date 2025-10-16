import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import LoginHeader from './LoginHeader';
import LoginFooter from './LoginFooter';
import LoginForm from './LoginForm';
import RegistrationModal from './RegistrationModal';
import OTPModal from './OTPModal';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';
import BackgroundImage from '../../assets/Background.png';
import { apiService, type User } from '../../lib/api';

const LoginPage: React.FC = () => {
    const [showRegistration, setShowRegistration] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [currentEmail, setCurrentEmail] = useState<string>('');
    const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);

    // Generate mock OTP
    const generateMockOTP = (): string => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Check if OTP is expired
    const isOTPExpired = (): boolean => {
        if (!otpExpiry) return true;
        return new Date() > otpExpiry;
    };


    const handleLogin = async (email: string, password: string) => {
        setIsLoading(true);
        setLoginError('');

        try {
            const response = await apiService.login({ email, password });
            
            if (response.success) {
                setCurrentEmail(email);
                const expiryDate = new Date(response.expires_at || '');
                setOtpExpiry(expiryDate);
                
                // Log the OTP to console for demo purposes
                console.log(`🔐 OTP for ${email}: ${response.otp_code} (expires at ${response.expires_at})`);
                
                setShowOTP(true);
            } else {
                setLoginError(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
        }

        setIsLoading(false);
    };

    const handleGoogleLogin = () => {
        console.log('Google login initiated...');
    };

    const handleRegistration = (data: any) => {
        console.log('Registration data:', data);
        setShowRegistration(false);
    };

    const handleOTPVerify = async (otp: string): Promise<boolean> => {
        // Check if OTP is expired
        if (isOTPExpired()) {
            console.log('❌ OTP verification failed: OTP expired');
            return false;
        }

        try {
            const response = await apiService.verifyOtp({ 
                email: currentEmail, 
                otp_code: otp 
            });
            
            if (response.success && response.user) {
                console.log('✅ OTP verified successfully:', otp);
                setShowOTP(false);
                setCurrentEmail('');
                setOtpExpiry(null);
                
                // Store user data in localStorage for frontend use
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // All users go to the citizen portal (landing page)
                console.log('🏠 Redirecting user to citizen portal');
                router.visit('/');
                
                return true;
            } else {
                console.log('❌ OTP verification failed:', response.message);
                return false;
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            return false;
        }
    };

    const handleOTPResend = async () => {
        try {
            const response = await apiService.resendOtp({ email: currentEmail });
            
            if (response.success) {
                setOtpExpiry(new Date(response.expires_at || ''));
                
                // Log the new OTP to console for demo purposes
                console.log(`🔄 New OTP: ${response.otp_code} (expires at ${response.expires_at})`);
            } else {
                console.error('Failed to resend OTP:', response.message);
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
        }
    };

    return (
        <div className="relative flex flex-col bg-white min-h-screen">
            {/* Background Image */}
            <img 
                src={BackgroundImage}
                alt="Background"
                className="z-1 fixed inset-0 w-full h-full opacity-25 object-cover pointer-events-none"
            />

            <LoginHeader />

            {/* Return Button */}
            <div className="z-10 relative mx-auto px-6 pt-4 container">
                <button
                    onClick={() => {
                        // Clear any stored user data when going back to services
                        localStorage.removeItem('user');
                        console.log('🧹 Cleared user data when navigating back to services');
                        // Force a hard refresh to ensure the Home page re-checks authentication
                        window.location.href = '/';
                    }}
                    className="flex items-center space-x-2 bg-white/90 hover:bg-white text-gray-800 hover:text-gray-900 px-4 py-2 rounded-lg shadow-lg transition-all duration-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to Services</span>
                </button>
            </div>

            <main className="z-10 relative flex-1 mx-auto px-6 pt-4 pb-12 container">
                <div className="items-center gap-12 grid lg:grid-cols-2">
                    <div className="mt-2 lg:text-left text-center">
                        <h2 className="flex flex-col font-bold text-4xl lg:text-5xl">
                            <span className="animated-gradient">Abot-Kamay mo</span>
                            <span className="animated-gradient">ang Serbisyong Publiko!</span>
                        </h2>
                    </div>

                    <LoginForm
                        onSubmit={handleLogin}
                        onRegisterClick={() => setShowRegistration(true)}
                        onGoogleLogin={handleGoogleLogin}
                        isLoading={isLoading}
                        error={loginError}
                    />
                </div>
            </main>

            <LoginFooter
                onTermsClick={() => setShowTerms(true)}
                onPrivacyClick={() => setShowPrivacy(true)}
            />

            <RegistrationModal
                isOpen={showRegistration}
                onClose={() => setShowRegistration(false)}
                onSubmit={handleRegistration}
            />

            <OTPModal
                isOpen={showOTP}
                onClose={() => setShowOTP(false)}
                onVerify={handleOTPVerify}
                onResend={handleOTPResend}
            />

            <TermsModal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
            />

            <PrivacyModal
                isOpen={showPrivacy}
                onClose={() => setShowPrivacy(false)}
            />

            {/* Custom CSS for animations and effects */}
            <style>{`
                .animated-gradient {
                    color: #4A90E2;
                    font-family: inherit;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    background: linear-gradient(90deg, #357ABD, #4A90E2 40%, #45a049 60%, #4CAF50);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    position: relative;
                    background-size: 200% 200%;
                    animation: gradientShift 6s ease-in-out infinite;
                    text-shadow: 0 2px 12px rgba(74, 144, 226, 0.25);
                }
                
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                .form-compact {
                    font-size: 0.9rem;
                }
                
                .form-compact input {
                    padding: 0.5rem 0.75rem;
                    font-size: 0.9rem;
                }
                
                .form-compact button {
                    padding: 0.6rem 0.875rem;
                    font-size: 0.9rem;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
                    border: none;
                    color: white;
                }
                
                .btn-primary:hover {
                    box-shadow: 0 20px 40px -10px rgba(74, 144, 226, 0.4);
                }
                
                .social-btn {
                    transition: all 0.3s ease;
                }
                
                .social-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .brand-go {
                    color: #4A90E2;
                }
                
                .brand-serve {
                    color: #4CAF50;
                }
                
                .brand-ph {
                    color: #4A90E2;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
