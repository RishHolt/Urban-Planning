import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button, Input, Checkbox } from '../../components';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RegistrationData) => void;
}

interface RegistrationData {
    firstName: string;
    lastName: string;
    middleName: string;
    suffix: string;
    birthdate: string;
    regEmail: string;
    mobile: string;
    address: string;
    houseNumber: string;
    street: string;
    barangay: string;
    regPassword: string;
    confirmPassword: string;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [formData, setFormData] = useState<RegistrationData>({
        firstName: '',
        lastName: '',
        middleName: '',
        suffix: '',
        birthdate: '',
        regEmail: '',
        mobile: '',
        address: '',
        houseNumber: '',
        street: '',
        barangay: '',
        regPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [noMiddleName, setNoMiddleName] = useState(false);
    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isOpen]);

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

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            regPassword: value
        }));

        // Update password checks
        setPasswordChecks({
            length: value.length >= 10,
            upper: /[A-Z]/.test(value),
            lower: /[a-z]/.test(value),
            number: /\d/.test(value),
            special: /[^A-Za-z0-9]/.test(value)
        });

        // Clear errors
        if (errors.regPassword) {
            setErrors(prev => ({
                ...prev,
                regPassword: ''
            }));
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            confirmPassword: value
        }));

        // Clear errors
        if (errors.confirmPassword) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: ''
            }));
        }
    };

    const handleNoMiddleNameChange = (checked: boolean) => {
        setNoMiddleName(checked);
        if (checked) {
            setFormData(prev => ({
                ...prev,
                middleName: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Required fields
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!noMiddleName && !formData.middleName.trim()) newErrors.middleName = 'Middle name is required';
        if (!formData.birthdate) newErrors.birthdate = 'Birthdate is required';
        if (!formData.regEmail.trim()) newErrors.regEmail = 'Email is required';
        if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.houseNumber.trim()) newErrors.houseNumber = 'House number is required';
        if (!formData.street.trim()) newErrors.street = 'Street is required';
        if (!formData.barangay.trim()) newErrors.barangay = 'Barangay is required';

        // Email validation
        if (formData.regEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.regEmail)) {
            newErrors.regEmail = 'Please enter a valid email address';
        }

        // Mobile validation (Philippine format)
        if (formData.mobile && !/^09\d{9}$/.test(formData.mobile)) {
            newErrors.mobile = 'Please enter a valid Philippine mobile number (09XXXXXXXXX)';
        }

        // Password validation
        const allPasswordChecks = Object.values(passwordChecks).every(check => check);
        if (!formData.regPassword) {
            newErrors.regPassword = 'Password is required';
        } else if (!allPasswordChecks) {
            newErrors.regPassword = 'Password does not meet requirements';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.regPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Agreement validation
        if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms of Use';
        if (!agreePrivacy) newErrors.agreePrivacy = 'You must agree to the Privacy Policy';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-20 px-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full form-compact max-h-[80vh] overflow-y-auto">
                <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-200 z-10 -mx-6 px-6 py-3 text-center">
                    <h2 className="text-xl md:text-2xl font-semibold text-secondary">Create your GoServePH account</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">
                                First Name<span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                error={errors.firstName}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                Last Name<span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                error={errors.lastName}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                Middle Name<span className="text-red-500 ml-1" style={{ display: noMiddleName ? 'none' : 'inline' }}>*</span>
                            </label>
                            <Input
                                type="text"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleInputChange}
                                error={errors.middleName}
                                disabled={noMiddleName}
                                required={!noMiddleName}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <div className="mt-2">
                                <Checkbox
                                    checked={noMiddleName}
                                    onChange={handleNoMiddleNameChange}
                                    label="No middle name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Suffix</label>
                            <Input
                                type="text"
                                name="suffix"
                                value={formData.suffix}
                                onChange={handleInputChange}
                                placeholder="Jr., Sr., III (optional)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                Birthdate<span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                type="date"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleInputChange}
                                error={errors.birthdate}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                Email Address<span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                type="email"
                                name="regEmail"
                                value={formData.regEmail}
                                onChange={handleInputChange}
                                error={errors.regEmail}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                Mobile Number<span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                error={errors.mobile}
                                placeholder="09XXXXXXXXX"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">
                                Address<span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                error={errors.address}
                                placeholder="Lot/Unit, Building, Subdivision"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                House #<span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                type="text"
                                name="houseNumber"
                                value={formData.houseNumber}
                                onChange={handleInputChange}
                                error={errors.houseNumber}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                Street<span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleInputChange}
                                error={errors.street}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">
                                Barangay<span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                type="text"
                                name="barangay"
                                value={formData.barangay}
                                onChange={handleInputChange}
                                error={errors.barangay}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                Password<span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="regPassword"
                                    value={formData.regPassword}
                                    onChange={handlePasswordChange}
                                    error={errors.regPassword}
                                    minLength={10}
                                    required
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 transition-colors"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <ul className="text-xs text-gray-600 mt-2 space-y-1">
                                <li className={`flex items-center ${passwordChecks.length ? 'text-green-600' : ''}`}>
                                    <CheckCircle size={12} className={`mr-2 ${passwordChecks.length ? 'text-green-600' : 'text-gray-400'}`} />
                                    At least 10 characters
                                </li>
                                <li className={`flex items-center ${passwordChecks.upper ? 'text-green-600' : ''}`}>
                                    <CheckCircle size={12} className={`mr-2 ${passwordChecks.upper ? 'text-green-600' : 'text-gray-400'}`} />
                                    Has uppercase letter
                                </li>
                                <li className={`flex items-center ${passwordChecks.lower ? 'text-green-600' : ''}`}>
                                    <CheckCircle size={12} className={`mr-2 ${passwordChecks.lower ? 'text-green-600' : 'text-gray-400'}`} />
                                    Has lowercase letter
                                </li>
                                <li className={`flex items-center ${passwordChecks.number ? 'text-green-600' : ''}`}>
                                    <CheckCircle size={12} className={`mr-2 ${passwordChecks.number ? 'text-green-600' : 'text-gray-400'}`} />
                                    Has a number
                                </li>
                                <li className={`flex items-center ${passwordChecks.special ? 'text-green-600' : ''}`}>
                                    <CheckCircle size={12} className={`mr-2 ${passwordChecks.special ? 'text-green-600' : 'text-gray-400'}`} />
                                    Has a special character
                                </li>
                            </ul>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                Confirm Password<span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    error={errors.confirmPassword}
                                    minLength={10}
                                    required
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 transition-colors"
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="g-recaptcha" data-sitekey="YOUR_RECAPTCHA_SITE_KEY">
                            <div className="bg-gray-100 border border-gray-300 rounded p-4 text-center text-gray-500">
                                reCAPTCHA placeholder
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center text-sm">
                            <Checkbox
                                checked={agreeTerms}
                                onChange={setAgreeTerms}
                                error={errors.agreeTerms}
                            />
                            <span className="ml-2">
                                I have read, understood, and agreed to the
                            </span>
                        </div>
                        <div className="flex items-center text-sm">
                            <Checkbox
                                checked={agreePrivacy}
                                onChange={setAgreePrivacy}
                                error={errors.agreePrivacy}
                            />
                            <span className="ml-2">
                                I have read, understood, and agreed to the
                            </span>
                        </div>
                        <p className="text-xs text-gray-600">
                            By clicking on the register button below, I hereby agree to both the Terms of Use and Data Privacy Policy
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-secondary text-white px-4 py-2 rounded-lg"
                        >
                            Register
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationModal;
