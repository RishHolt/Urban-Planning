import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '../../components';

interface OTPModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (otp: string) => Promise<boolean>; // Return boolean to indicate success/failure
    onResend: () => void;
}

const OTPModal: React.FC<OTPModalProps> = ({
    isOpen,
    onClose,
    onVerify,
    onResend
}) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(true);
    const [error, setError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden');
            setOtp(['', '', '', '', '', '']);
            setError('');
            setResendTimer(0);
            setCanResend(true);
        } else {
            document.body.classList.remove('overflow-hidden');
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isOpen]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        if (resendTimer > 0) {
            timer = setTimeout(() => {
                setResendTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [resendTimer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleInputChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
        
        const newOtp = [...otp];
        digits.forEach((digit, index) => {
            if (index < 6) {
                newOtp[index] = digit;
            }
        });
        setOtp(newOtp);
        
        // Focus the next empty input or the last one
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        
        if (otpString.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }
        
        setError('');
        const isValid = await onVerify(otpString);
        if (!isValid) {
            setError('Invalid OTP. Please try again.');
        }
    };

    const handleResend = () => {
        onResend();
        setResendTimer(60); // 1 minute timer
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setError('');
        inputRefs.current[0]?.focus();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-semibold mb-2 text-center">Two-Factor Verification</h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                    Please check your registered email for your OTP.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-2 text-center">Enter OTP</label>
                        <div className="flex justify-center space-x-2" id="otpInputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                                    aria-label={`Digit ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                    
                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}
                    
                    <div className="flex justify-between items-center">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white"
                        >
                            Cancel
                        </Button>
                        <div className="space-x-2">
                            <Button
                                type="button"
                                onClick={handleResend}
                                disabled={!canResend}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RotateCcw size={16} className="mr-1" />
                                {canResend ? 'Resend OTP' : `Resend in ${formatTime(resendTimer)}`}
                            </Button>
                            <Button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-secondary text-white"
                            >
                                Verify
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OTPModal;
