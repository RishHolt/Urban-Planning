import React, { useState } from 'react';
import { X, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../../../components';
import { router } from '@inertiajs/react';

interface ZoningClearanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ZoningClearanceModal: React.FC<ZoningClearanceModalProps> = ({
    isOpen,
    onClose
}) => {
    const [expandedSections, setExpandedSections] = useState({
        applicationForm: false,
        locationMap: false,
        lotPlan: false,
        tct: false,
        contractLease: false,
        barangayClearance: false,
        taxClearance: false,
        buildingPlans: false,
        environmentalCompliance: false,
        dpwhClearance: false,
        subdivisionPermit: false,
        businessPermit: false,
        fireSafetyClearance: false
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
                <div className="bg-green-600 text-white p-4 rounded-t-xl flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Zoning Clearance Application</h2>
                                <p className="text-green-100 text-sm">Requirements for business and building permits</p>
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
                            Obtain zoning clearance for business operations or building construction. Available to property owners, business operators, and developers in Caloocan City.
                        </p>
                    </div>

                    {/* Requirements List */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <FileText className="w-5 h-5 text-green-600" />
                            <h3 className="text-lg font-bold text-gray-800">REQUIRED DOCUMENTS</h3>
                        </div>
                        
                        <div className="space-y-2">
                            {[
                                { 
                                    key: 'locationMap', 
                                    title: 'Location Map / Vicinity Sketch',
                                    description: 'Showing lot boundaries, adjacent streets, and nearby landmarks'
                                },
                                { 
                                    key: 'lotPlan', 
                                    title: 'Lot Plan / Site Development Plan',
                                    description: 'Signed and sealed by a licensed Geodetic or Civil Engineer'
                                },
                                { 
                                    key: 'tct', 
                                    title: 'Transfer Certificate of Title (TCT) or Tax Declaration',
                                    description: 'Proof of land ownership or right to use'
                                },
                                { 
                                    key: 'contractLease', 
                                    title: 'Contract of Lease / Deed of Sale / Authorization',
                                    description: 'If applicant is not the property owner'
                                },
                                { 
                                    key: 'barangayClearance', 
                                    title: 'Barangay Clearance',
                                    description: 'Certifying that the project is within the jurisdiction and has no objections. Click here to apply for barangay clearance.'
                                },
                                { 
                                    key: 'taxClearance', 
                                    title: 'Tax Clearance / Latest Real Property Tax Receipt',
                                    description: 'Proof that property taxes are paid'
                                },
                                { 
                                    key: 'buildingPlans', 
                                    title: 'Building Plans or Sketch Plans',
                                    description: 'For structures or development projects'
                                },
                                { 
                                    key: 'environmentalCompliance', 
                                    title: 'Environmental Compliance Certificate (ECC) or Certificate of Non-Coverage (CNC) - (If applicable)',
                                    description: 'from DENR'
                                },
                                { 
                                    key: 'dpwhClearance', 
                                    title: 'DPWH or Road Right-of-Way Clearance - (if applicable)',
                                    description: 'For properties near national roads'
                                },
                                { 
                                    key: 'subdivisionPermit', 
                                    title: 'Subdivision / Development Permit',
                                    description: 'For subdivision or housing projects'
                                },
                                { 
                                    key: 'businessPermit', 
                                    title: 'Business Permit (if existing establishment)',
                                    description: 'For expansion or renovation applications'
                                },
                                { 
                                    key: 'fireSafetyClearance', 
                                    title: 'Fire Safety Clearance - (if applicable)',
                                    description: 'From BFP'
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
                                                {req.key === 'barangayClearance' ? (
                                                    <>
                                                        Certifying that the project is within the jurisdiction and has no objections.{' '}
                                                        <button 
                                                            className="text-green-600 hover:text-green-700 underline font-medium"
                                                            onClick={() => {
                                                                // Navigate to barangay clearance application (placeholder)
                                                                alert('Barangay clearance application page will be implemented soon');
                                                            }}
                                                        >
                                                            Click here to apply for barangay clearance
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
                                <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                <p className="text-xs text-gray-700">
                                    <strong>Complete Application:</strong> Fill out all required fields. Incomplete applications will be automatically rejected.
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                <p className="text-xs text-gray-700">
                                    <strong>Valid Authorization:</strong> Only property owners or authorized representatives may submit applications.
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                <p className="text-xs text-gray-700">
                                    <strong>Document Upload:</strong> Upload clear, legible copies. Low-quality images may lead to rejection.
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                <p className="text-xs text-gray-700">
                                    <strong>Processing:</strong> Applications are processed automatically. Manual interventions cannot be accommodated.
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
                            router.visit('/my-applications');
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
                                router.visit('/zoning-clearance/apply');
                            }}
                            variant="success"
                            size="md"
                        >
                            Apply Now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZoningClearanceModal;
