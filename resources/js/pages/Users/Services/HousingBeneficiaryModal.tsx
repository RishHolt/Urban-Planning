import React, { useState } from 'react';
import { X, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../../../components';
import { router } from '@inertiajs/react';

interface HousingBeneficiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HousingBeneficiaryModal: React.FC<HousingBeneficiaryModalProps> = ({
    isOpen,
    onClose
}) => {
    const [expandedSections, setExpandedSections] = useState({
        proofOfIncome: false,
        residencyCertificate: false,
        validIds: false,
        birthCertificates: false,
        marriageCertificate: false,
        noPropertyCertificate: false,
        housingProof: false,
        familyComposition: false,
        employmentCertificate: false,
        utilityBills: false,
        communityTaxCert: false,
        familyPhoto: false
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section as keyof typeof prev]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100000]">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col">
                {/* Header - Fixed */}
                <div className="bg-purple-600 text-white p-4 rounded-t-xl flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Housing Beneficiary Application</h2>
                                <p className="text-purple-100 text-sm">Socialized housing programs for qualified residents</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-transparent text-white hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Service Overview */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Service Overview</h3>
                        <p className="text-gray-600 text-sm">
                            Apply for socialized housing assistance and affordable housing programs. Available to qualified Caloocan City residents who meet income and residency requirements.
                        </p>
                    </div>

                    {/* Requirements List */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <h3 className="text-lg font-bold text-gray-800">REQUIRED DOCUMENTS</h3>
                        </div>
                        
                        <div className="space-y-2">
                            {[
                                { 
                                    key: 'proofOfIncome', 
                                    title: 'Proof of Income',
                                    description: 'Latest payslips, ITR, or Certificate of Indigency from Barangay'
                                },
                                { 
                                    key: 'residencyCertificate', 
                                    title: 'Certificate of Residency / Barangay Certificate',
                                    description: 'Certifying that the applicant is a resident of Caloocan City. Click here to apply for barangay certificate.'
                                },
                                { 
                                    key: 'validIds', 
                                    title: 'Valid Government-issued IDs',
                                    description: 'UMID, SSS, PhilHealth, Postal ID, Voter\'s ID, Driver\'s License, or Passport (applicant and spouse)'
                                },
                                { 
                                    key: 'birthCertificates', 
                                    title: 'Birth Certificates (PSA-authenticated)',
                                    description: 'PSA-authenticated birth certificates of applicant and all dependents'
                                },
                                { 
                                    key: 'marriageCertificate', 
                                    title: 'Marriage Certificate (PSA-authenticated)',
                                    description: 'If married - PSA-authenticated marriage certificate'
                                },
                                { 
                                    key: 'noPropertyCertificate', 
                                    title: 'Certificate of No Property Holdings',
                                    description: 'CENRO Certificate from Registry of Deeds proving no real property ownership'
                                },
                                { 
                                    key: 'housingProof', 
                                    title: 'Proof of Current Housing Situation',
                                    description: 'Rental contract, Kasunduan, or Barangay certification of current housing status'
                                },
                                { 
                                    key: 'familyComposition', 
                                    title: 'Family Composition Form',
                                    description: 'Complete list of all household members with names, ages, and relationships'
                                },
                                { 
                                    key: 'employmentCertificate', 
                                    title: 'Employment Certificate or Certificate of Unemployment',
                                    description: 'From employer or Barangay certification if unemployed'
                                },
                                { 
                                    key: 'utilityBills', 
                                    title: 'Latest Utility Bills',
                                    description: 'Electric and/or water bills under applicant\'s name (last 3 months)'
                                },
                                { 
                                    key: 'communityTaxCert', 
                                    title: 'Community Tax Certificate (Cedula)',
                                    description: 'Current year community tax certificate'
                                },
                                { 
                                    key: 'familyPhoto', 
                                    title: '2x2 ID Photos',
                                    description: 'Family photo - 4 copies (2x2 inches)'
                                }
                            ].map((req) => (
                                <div key={req.key} className="bg-gray-50 border border-gray-200 rounded-lg">
                                    <button
                                        onClick={() => toggleSection(req.key)}
                                        className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="text-sm font-medium text-gray-800">
                                            {req.title}
                                        </span>
                                        {expandedSections[req.key as keyof typeof expandedSections] ? (
                                            <ChevronUp className="w-4 h-4 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                        )}
                                    </button>
                                    {expandedSections[req.key as keyof typeof expandedSections] && (
                                        <div className="px-3 pb-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-600 mt-1">
                                                {req.key === 'residencyCertificate' ? (
                                                    <>
                                                        Certifying that the applicant is a resident of Caloocan City.{' '}
                                                        <button 
                                                            className="text-purple-600 hover:text-purple-700 underline font-medium"
                                                            onClick={() => {
                                                                // Navigate to barangay certificate application (placeholder)
                                                                alert('Barangay certificate application page will be implemented soon');
                                                            }}
                                                        >
                                                            Click here to apply for barangay certificate
                                                        </button>
                                                    </>
                                                ) : (
                                                    req.description
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reminders Section */}
                    <div className="border border-gray-300 rounded-lg p-4 mb-4">
                        <h4 className="text-md font-bold text-gray-800 mb-3">IMPORTANT REMINDERS</h4>
                        <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                <p className="text-xs text-gray-700">
                                    <strong>Complete Application:</strong> Fill out all required fields. Incomplete applications will be automatically rejected.
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                <p className="text-xs text-gray-700">
                                    <strong>Qualification Requirements:</strong> Only qualified beneficiaries may apply. Must meet income and residency requirements.
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                <p className="text-xs text-gray-700">
                                    <strong>Document Upload:</strong> Upload clear, legible copies. Poor quality images may lead to rejection.
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                <p className="text-xs text-gray-700">
                                    <strong>Processing:</strong> Applications are processed in order received. Processing time may vary depending on volume.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Fixed */}
                <div className="flex justify-between items-center p-4 border-t border-gray-200 flex-shrink-0">
                    <Button
                        onClick={() => {
                            onClose();
                            router.visit('/my-housing-applications');
                        }}
                        variant="ghost"
                        size="md"
                        className="text-gray-600 hover:text-gray-800"
                    >
                        My Applications
                    </Button>
                    <div className="flex space-x-3">
                        <Button
                            onClick={onClose}
                            variant="outlined"
                            size="md"
                        >
                            Other Services
                        </Button>
                        <Button
                            onClick={() => {
                                onClose();
                                router.visit('/housing/apply');
                            }}
                            variant="success"
                            size="md"
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            Apply Now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HousingBeneficiaryModal;
