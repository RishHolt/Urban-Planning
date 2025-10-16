import React, { useState } from 'react';
import { X, FileText, Building, Briefcase, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../../../components';

interface ZoningClearanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ZoningClearanceModal: React.FC<ZoningClearanceModalProps> = ({
    isOpen,
    onClose
}) => {
    const [expandedSections, setExpandedSections] = useState({
        business: {
            lotPlan: false,
            leaseContract: false,
            tct: false,
            taxDeclaration: false,
            propertyTax: false,
            barangayClearance: false
        },
        building: {
            lotPlan: false,
            tct: false,
            taxDeclaration: false,
            propertyTax: false,
            constructionPermit: false,
            architecturalPlan: false
        }
    });

    const toggleSection = (category: 'business' | 'building', section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [section]: !(prev[category] as any)[section]
            }
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

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Business Requirements */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-3">
                                <Briefcase className="w-4 h-4 text-green-600" />
                                <h3 className="text-lg font-bold text-gray-800">BUSINESS</h3>
                            </div>
                            
                            <div className="space-y-2">
                                {[
                                    { 
                                        key: 'lotPlan', 
                                        title: 'Lot plan with vicinity map',
                                        description: 'Certified by Geodetic Engineer'
                                    },
                                    { 
                                        key: 'leaseContract', 
                                        title: 'Lease contract/consent',
                                        description: 'From property owner'
                                    },
                                    { 
                                        key: 'tct', 
                                        title: 'TCT (land title)',
                                        description: 'Certified true copy'
                                    },
                                    { 
                                        key: 'taxDeclaration', 
                                        title: 'Tax Declaration',
                                        description: 'Land/building from Assessor'
                                    },
                                    { 
                                        key: 'propertyTax', 
                                        title: 'Property tax receipts',
                                        description: 'Current year payment'
                                    },
                                    { 
                                        key: 'barangayClearance', 
                                        title: 'Barangay Clearance',
                                        description: 'From business location'
                                    }
                                ].map((req) => (
                                    <div key={req.key} className="bg-gray-50 border border-gray-200 rounded-lg">
                                        <button
                                            onClick={() => toggleSection('business', req.key)}
                                            className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-800">
                                                {req.title}
                                            </span>
                                            {expandedSections.business[req.key as keyof typeof expandedSections.business] ? (
                                                <ChevronUp className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                        {expandedSections.business[req.key as keyof typeof expandedSections.business] && (
                                            <div className="px-3 pb-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {req.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Building Requirements */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-3">
                                <Building className="w-4 h-4 text-green-600" />
                                <h3 className="text-lg font-bold text-gray-800">BUILDING</h3>
                            </div>
                            
                            <div className="space-y-2">
                                {[
                                    { 
                                        key: 'lotPlan', 
                                        title: 'Lot plan with vicinity map',
                                        description: 'Certified by Geodetic Engineer'
                                    },
                                    { 
                                        key: 'tct', 
                                        title: 'TCT (land title)',
                                        description: 'Certified true copy'
                                    },
                                    { 
                                        key: 'taxDeclaration', 
                                        title: 'Tax Declaration',
                                        description: 'Land/building from Assessor'
                                    },
                                    { 
                                        key: 'propertyTax', 
                                        title: 'Property tax receipts',
                                        description: 'Current year payment'
                                    },
                                    { 
                                        key: 'constructionPermit', 
                                        title: 'Construction Permit',
                                        description: 'From barangay'
                                    },
                                    { 
                                        key: 'architecturalPlan', 
                                        title: 'Architectural Plan',
                                        description: 'Site Development Plan (1 set)'
                                    }
                                ].map((req) => (
                                    <div key={req.key} className="bg-gray-50 border border-gray-200 rounded-lg">
                                        <button
                                            onClick={() => toggleSection('building', req.key)}
                                            className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-800">
                                                {req.title}
                                            </span>
                                            {expandedSections.building[req.key as keyof typeof expandedSections.building] ? (
                                                <ChevronUp className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                        {expandedSections.building[req.key as keyof typeof expandedSections.building] && (
                                            <div className="px-3 pb-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {req.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 flex-shrink-0">
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        size="md"
                    >
                        Other Services
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="success"
                        size="md"
                    >
                        Apply Now
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ZoningClearanceModal;
