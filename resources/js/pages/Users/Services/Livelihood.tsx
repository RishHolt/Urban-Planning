import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, MapPin, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppearance } from '../../../hooks/use-appearance';
import { router } from '@inertiajs/react';

const Livelihood: React.FC = () => {
    const { theme } = useAppearance();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleAccordion = (id: string) => {
        setExpandedItems(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const requirements = [
        {
            id: 'residency',
            title: 'Proof of Residency',
            content: 'Barangay certificate or any document proving residence in Caloocan City for at least 6 months.'
        },
        {
            id: 'income',
            title: 'Income Certificate',
            content: 'Certificate of income from employer or barangay captain, or affidavit of no income if unemployed.'
        },
        {
            id: 'valid-id',
            title: 'Valid Government ID',
            content: 'Any government-issued identification card (driver\'s license, passport, voter\'s ID, etc.).'
        },
        {
            id: 'application',
            title: 'Livelihood Application Form',
            content: 'Complete the livelihood program application form available at the Livelihood Office.'
        },
        {
            id: 'business-plan',
            title: 'Business Plan',
            content: 'Simple business plan or project proposal for the livelihood activity you want to pursue.'
        }
    ];

    const programs = [
        {
            title: 'Skills Training',
            description: 'Various skills training programs to enhance employability and entrepreneurship.',
            features: ['Cooking and food preparation', 'Sewing and tailoring', 'Computer literacy', 'Basic electronics', 'Beauty and wellness']
        },
        {
            title: 'Micro-Enterprise Development',
            description: 'Support for starting and managing small businesses.',
            features: ['Business planning assistance', 'Marketing support', 'Financial management training', 'Product development']
        },
        {
            title: 'Financial Assistance',
            description: 'Various forms of financial support for livelihood activities.',
            features: ['Seed capital assistance', 'Equipment loans', 'Raw materials support', 'Working capital loans']
        },
        {
            title: 'Market Linkages',
            description: 'Connecting beneficiaries to markets and business opportunities.',
            features: ['Market access support', 'Buyer connections', 'Trade fair participation', 'Online selling assistance']
        }
    ];

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Navigation */}
            <nav className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-teal-600'} shadow-lg`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.visit('/citizen')}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">Livelihood Programs</h1>
                                <p className="text-sm text-white opacity-90">Skills Training and Micro-Enterprise Development</p>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Service Overview */}
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-teal-50'} border border-teal-200 rounded-lg p-6 mb-8`}>
                    <h2 className="text-2xl font-bold text-teal-800 mb-4">Service Overview</h2>
                    <p className="text-gray-700 mb-4">
                        The Livelihood Programs provide comprehensive support for Caloocan City residents to develop 
                        skills, start micro-enterprises, and improve their economic well-being through various 
                        training programs, financial assistance, and market linkages.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm">Skills training programs</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm">Micro-enterprise support</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm">Financial assistance</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm">Market linkages</span>
                        </div>
                    </div>
                </div>

                {/* Programs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {programs.map((program, index) => (
                        <div key={index} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 border border-gray-200`}>
                            <h3 className="text-xl font-bold text-teal-800 mb-3">{program.title}</h3>
                            <p className="text-gray-600 mb-4">{program.description}</p>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Features:</h4>
                                <ul className="space-y-1">
                                    {program.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Requirements */}
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden border border-gray-200`}>
                        <div className="bg-teal-100 p-4 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-teal-800 text-center">Requirements</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2">
                                {requirements.map((req) => (
                                    <div key={req.id} className="border border-gray-200 rounded-lg">
                                        <button
                                            className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center"
                                            onClick={() => toggleAccordion(req.id)}
                                        >
                                            <span className="font-semibold text-gray-800">{req.title}</span>
                                            {expandedItems.includes(req.id) ? (
                                                <ChevronUp className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-600" />
                                            )}
                                        </button>
                                        {expandedItems.includes(req.id) && (
                                            <div className="p-3 bg-white">
                                                <p className="text-gray-700">{req.content}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* How to Apply */}
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden border border-gray-200`}>
                        <div className="bg-teal-100 p-4 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-teal-800 text-center">How to Apply</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        1
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-1">Visit Livelihood Office</h4>
                                        <p className="text-gray-600 text-sm">Go to the Livelihood Office at Caloocan City Hall.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        2
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-1">Choose Program</h4>
                                        <p className="text-gray-600 text-sm">Select the livelihood program that matches your interests and skills.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        3
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-1">Submit Application</h4>
                                        <p className="text-gray-600 text-sm">Submit your application form and all required documents.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        4
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-1">Assessment</h4>
                                        <p className="text-gray-600 text-sm">Livelihood officer will assess your application and business plan.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        5
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-1">Program Enrollment</h4>
                                        <p className="text-gray-600 text-sm">If approved, you will be enrolled in the chosen livelihood program.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mt-8`}>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-5 h-5 text-teal-600" />
                                <div>
                                    <p className="font-semibold">Address</p>
                                    <p className="text-gray-600">Livelihood Office<br />Caloocan City Hall, Metro Manila</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-teal-600" />
                                <div>
                                    <p className="font-semibold">Office Hours</p>
                                    <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-teal-600" />
                                <div>
                                    <p className="font-semibold">Phone</p>
                                    <p className="text-gray-600">(02) 8888-7890</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-teal-600" />
                                <div>
                                    <p className="font-semibold">Email</p>
                                    <p className="text-gray-600">livelihood@caloocan.gov.ph</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Livelihood;
