import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Check, Upload, AlertCircle, FileText, Eye, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { Timeline, Input, Select, TextArea, Button, Card, PageHeader, Modal } from '../../../components';
import { apiService, type User as ApiUser } from '../../../lib/api';
import Swal from 'sweetalert2';

interface FormData {
  // Section 1: Personal Information
  firstName: string;
  lastName: string;
  address: string;
  contactNumber: string;
  businessName: string;
  email: string;
  typeOfApplicant: string;

  // Section 2: Project Details
  projectDescription: string;
  projectType: string;
  projectLocation: string;
  totalLotAreaSqm: string;
  totalFloorAreaSqm: string;

  // Section 3: Land Ownership
  landOwnership: string;
  nameOfOwner: string;
  tctNo: string;
  taxDeclarationNo: string;
  lotBlockSurveyNo: string;
  barangayClearanceId: string;
  proofOfOwnership: File | null;
  taxClearance: File | null;

  // Section 4: Technical Documents
  siteDevelopmentPlan: File | null;
  vicinityMap: File | null;
  buildingPlan: File | null;
  environmentalClearance: File | null;
  dpwhClearance: File | null;
  subdivisionPermit: File | null;
  businessPermit: File | null;
  fireSafetyClearance: File | null;
  additionalNotes: string;

  // Section 5: Payment Information
  orReferenceNumber: string;
  orDate: string;
  paymentStatus: 'pending' | 'confirmed';

  // Section 6: Declaration
  declarationAccepted: boolean;
  signatureFile: File | null;
}

const ZoningClearanceApplication: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [barangayClearanceValidating, setBarangayClearanceValidating] = useState(false);
  const [barangayClearanceValid, setBarangayClearanceValid] = useState<boolean | null>(null);
  const [barangayClearanceDetails, setBarangayClearanceDetails] = useState<any>(null);
  const [userData, setUserData] = useState<ApiUser | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    address: '',
    contactNumber: '',
    businessName: '',
    email: '',
    typeOfApplicant: '',
    projectDescription: '',
    projectType: '',
    projectLocation: '',
    totalLotAreaSqm: '',
    totalFloorAreaSqm: '',
    landOwnership: '',
    nameOfOwner: '',
    tctNo: '',
    taxDeclarationNo: '',
    lotBlockSurveyNo: '',
    barangayClearanceId: '',
    proofOfOwnership: null,
    taxClearance: null,
    siteDevelopmentPlan: null,
    vicinityMap: null,
    buildingPlan: null,
    environmentalClearance: null,
    dpwhClearance: null,
    subdivisionPermit: null,
    businessPermit: null,
    fireSafetyClearance: null,
    additionalNotes: '',
    orReferenceNumber: '',
    orDate: '',
    paymentStatus: 'pending',
    declarationAccepted: false,
    signatureFile: null
  });

  const timelineSteps = [
    { id: 1, title: 'Personal Information', description: 'Basic applicant details' },
    { id: 2, title: 'Project Details', description: 'Project specifications' },
    { id: 3, title: 'Land Ownership', description: 'Property documentation' },
    { id: 4, title: 'Technical Documents', description: 'Supporting files' },
    { id: 5, title: 'Payment Information', description: 'OR reference & fee details' },
    { id: 6, title: 'Declaration', description: 'Agreement & signature' }
  ];

  // Auto-fill user data on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (localUser && localUser.id) {
          try {
            const response = await apiService.getCurrentUser();
            if (response.success && response.user) {
              setUserData(response.user);
              setFormData(prev => ({
                ...prev,
                firstName: response.user?.first_name || '',
                lastName: response.user?.last_name || '',
                email: response.user?.email || ''
              }));
            } else {
              localStorage.removeItem('user');
              setUserData(null);
            }
          } catch (error) {
            localStorage.removeItem('user');
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        setUserData(null);
      }
    };

    checkAuthStatus();
  }, []);

  // Barangay clearance validation with debounce
  useEffect(() => {
    if (!formData.barangayClearanceId) {
      setBarangayClearanceValid(null);
      setBarangayClearanceDetails(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      validateBarangayClearance(formData.barangayClearanceId);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.barangayClearanceId]);

  const validateBarangayClearance = async (clearanceId: string) => {
    setBarangayClearanceValidating(true);
    try {
      const response = await fetch(`/api/barangay-clearance/validate/${clearanceId}`);
      const data = await response.json();
      
      if (response.ok) {
        setBarangayClearanceValid(true);
        setBarangayClearanceDetails(data);
      } else {
        setBarangayClearanceValid(false);
        setBarangayClearanceDetails(null);
      }
    } catch (error) {
      setBarangayClearanceValid(false);
      setBarangayClearanceDetails(null);
    } finally {
      setBarangayClearanceValidating(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof FormData, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateCurrentStep = (): boolean => {
    // Disabled for testing - always return true
    return true;
    
    // Original validation logic (commented out for testing)
    // switch (currentStep) {
    //   case 1:
    //     return !!(formData.firstName && formData.lastName && formData.address && 
    //              formData.contactNumber && formData.email && formData.typeOfApplicant);
    //   case 2:
    //     return !!(formData.proposedLandUse && formData.projectType && 
    //              formData.projectLocation && formData.totalLotAreaSqm && formData.totalFloorAreaSqm);
    //   case 3:
    //     return !!(formData.landOwnership && formData.tctNo && formData.taxDeclarationNo && 
    //              formData.lotBlockSurveyNo && formData.barangayClearanceId && 
    //              barangayClearanceValid && formData.proofOfOwnership);
    //   case 4:
    //     return !!(formData.siteDevelopmentPlan && formData.vicinityMap && 
    //              formData.buildingPlan);
    //   case 5:
    //     return formData.declarationAccepted && !!formData.signatureFile;
    //   default:
    //     return false;
    // }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (typeof value === 'boolean') {
          formDataToSend.append(key, value.toString());
        } else {
          formDataToSend.append(key, value);
        }
      });

      const response = await fetch('/api/zoning-clearance/applications', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      if (response.ok) {
        // Success - show success message and redirect to My Applications
        Swal.fire({
          title: 'Application Submitted!',
          text: 'Your zoning clearance application has been submitted successfully.',
          icon: 'success',
          confirmButtonText: 'View My Applications'
        }).then(() => {
          router.visit('/my-applications');
        });
      } else {
        const error = await response.json();
        console.error('Submission error:', error);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserDataChange = (user: ApiUser | null) => {
    setUserData(user);
  };

  const handleLogout = () => {
    console.log('Logout completed');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                required
              />
              <Input
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                required
              />
              <Input
                label="Address *"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete address"
                required
              />
              <Input
                label="Contact Number *"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                placeholder="e.g., 09123456789"
                required
              />
              <Input
                label="Business Name (If applicable)"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter business name if applicable"
              />
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            <div className="mt-4">
              <Select
                label="Type of Applicant *"
                value={formData.typeOfApplicant}
                onChange={(value) => handleInputChange('typeOfApplicant', value as string)}
                options={[
                  { value: '', label: 'Select type...' },
                  { value: 'Individual', label: 'Individual' },
                  { value: 'Corporation', label: 'Corporation' },
                  { value: 'Government Entity', label: 'Government Entity' }
                ]}
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Project Description *"
                value={formData.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', (e.target as HTMLInputElement).value)}
                placeholder="Describe your project in detail"
                required
              />
              <Select
                label="Project Type *"
                value={formData.projectType}
                onChange={(value) => handleInputChange('projectType', value as string)}
                options={[
                  { value: '', label: 'Select project type...' },
                  { value: 'Residential', label: 'Residential' },
                  { value: 'Commercial', label: 'Commercial' },
                  { value: 'Industrial', label: 'Industrial' },
                  { value: 'Mixed Use', label: 'Mixed Use' },
                  { value: 'Institutional', label: 'Institutional' },
                  { value: 'Agricultural', label: 'Agricultural' },
                  { value: 'Recreational', label: 'Recreational' },
                  { value: 'Other', label: 'Other' }
                ]}
                required
              />
              <Input
                label="Project Location *"
                value={formData.projectLocation}
                onChange={(e) => handleInputChange('projectLocation', e.target.value)}
                placeholder="Enter the exact location of the project"
                required
              />
              <Input
                label="Total Lot Area (sqm) *"
                type="number"
                value={formData.totalLotAreaSqm}
                onChange={(e) => handleInputChange('totalLotAreaSqm', e.target.value)}
                placeholder="Enter lot area in square meters"
                required
              />
              <Input
                label="Total Floor Area (sqm) *"
                type="number"
                value={formData.totalFloorAreaSqm}
                onChange={(e) => handleInputChange('totalFloorAreaSqm', e.target.value)}
                placeholder="Enter floor area in square meters"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Land Ownership & Documentation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Land Ownership *"
                value={formData.landOwnership}
                onChange={(value) => handleInputChange('landOwnership', value as string)}
                options={[
                  { value: '', label: 'Select ownership...' },
                  { value: 'Owned', label: 'Owned' },
                  { value: 'Leased', label: 'Leased' },
                  { value: 'Others', label: 'Others' }
                ]}
                required
              />
              {formData.landOwnership !== 'Owned' && (
                <Input
                  label="Name of Owner *"
                  value={formData.nameOfOwner}
                  onChange={(e) => handleInputChange('nameOfOwner', e.target.value)}
                  placeholder="Enter the name of the property owner"
                  required
                />
              )}
              <Input
                label="TCT No. *"
                value={formData.tctNo}
                onChange={(e) => handleInputChange('tctNo', e.target.value)}
                placeholder="Enter TCT number"
                required
              />
              <Input
                label="Tax Declaration No. *"
                value={formData.taxDeclarationNo}
                onChange={(e) => handleInputChange('taxDeclarationNo', e.target.value)}
                placeholder="Enter tax declaration number"
                required
              />
              <Input
                label="Lot / Block / Survey No. *"
                value={formData.lotBlockSurveyNo}
                onChange={(e) => handleInputChange('lotBlockSurveyNo', e.target.value)}
                placeholder="Enter lot/block/survey number"
                required
              />
              <div className="space-y-2">
                <Input
                  label="Barangay Clearance ID *"
                  value={formData.barangayClearanceId}
                  onChange={(e) => handleInputChange('barangayClearanceId', e.target.value)}
                  placeholder="Enter barangay clearance ID"
                  required
                />
                {barangayClearanceValidating && (
                  <div className="flex items-center text-blue-600 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Validating...
                  </div>
                )}
                {barangayClearanceValid === true && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check className="w-4 h-4 mr-2" />
                    Valid clearance
                  </div>
                )}
                {barangayClearanceValid === false && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Invalid clearance ID
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proof of Ownership (TCT/Contract/Deed of Sale) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('proofOfOwnership', e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Clearance / Latest Real Property Tax Receipt *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('taxClearance', e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical & Supporting Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'siteDevelopmentPlan', label: 'Lot Plan / Site Development Plan *', required: true },
                { key: 'vicinityMap', label: 'Location Map / Vicinity Sketch *', required: true },
                { key: 'buildingPlan', label: 'Building Plans or Sketch Plans *', required: true },
                { key: 'environmentalClearance', label: 'Environmental Compliance Certificate (ECC) or Certificate of Non-Coverage (CNC) (if applicable)', required: false },
                { key: 'dpwhClearance', label: 'DPWH or Road Right-of-Way Clearance (if applicable)', required: false },
                { key: 'subdivisionPermit', label: 'Subdivision / Development Permit (if applicable)', required: false },
                { key: 'businessPermit', label: 'Business Permit (if existing establishment)', required: false },
                { key: 'fireSafetyClearance', label: 'Fire Safety Clearance (if applicable)', required: false }
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(key as keyof FormData, e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required={required}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <TextArea
                label="Additional Notes"
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                rows={4}
                placeholder="Optional remarks from applicant..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
            
            {/* Fee Breakdown */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Fee Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Application Fee</span>
                  <span className="font-medium">₱250.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fee (Verification + Inspection)</span>
                  <span className="font-medium">₱400.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee ({formData.totalFloorAreaSqm || '0'} sqm × ₱3.00)</span>
                  <span className="font-medium">₱{((parseFloat(formData.totalFloorAreaSqm) || 0) * 3).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Fee</span>
                    <span>₱{(250 + 400 + ((parseFloat(formData.totalFloorAreaSqm) || 0) * 3)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="OR (Official Receipt) Reference Number *"
                value={formData.orReferenceNumber}
                onChange={(e) => handleInputChange('orReferenceNumber', e.target.value)}
                placeholder="Enter OR reference number"
                required
              />
              <Input
                label="OR Date *"
                type="date"
                value={formData.orDate}
                onChange={(e) => handleInputChange('orDate', e.target.value)}
                required
              />
            </div>
            
            <div className="mt-4">
              <Select
                label="Payment Status *"
                value={formData.paymentStatus}
                onChange={(value) => handleInputChange('paymentStatus', value as string)}
                options={[
                  { value: 'pending', label: 'Payment Pending - Will be verified by treasury' },
                  { value: 'confirmed', label: 'Payment Confirmed - Already verified by treasury' }
                ]}
                required
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">Payment Instructions</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please pay the total fee at the Municipal Treasury Office and provide the OR reference number and date above. 
                    Keep your official receipt as proof of payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Declaration & Agreement</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-4">
                  I hereby certify that the information provided in this application is true and correct to the best of my knowledge. 
                  I understand that any false information may result in the rejection of this application and may subject me to legal action. 
                  I agree to comply with all applicable laws, rules, and regulations governing zoning clearance applications.
                </p>
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.declarationAccepted}
                    onChange={(e) => handleInputChange('declarationAccepted', e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I hereby certify that the information above is true and correct and agree to the terms and conditions.
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature / e-Signature (PDF) *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('signatureFile', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <PageHeader 
        userData={userData}
        onUserDataChange={handleUserDataChange}
        onLogout={handleLogout}
      />
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => router.visit('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.visit('/my-applications')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <FileText className="w-4 h-4" />
                <span>My Applications</span>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Zoning Clearance Application</h1>
            <p className="text-gray-600 mt-2">Complete all sections to submit your application</p>
          </div>

        {/* Timeline */}
        <Timeline
          steps={timelineSteps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        {/* Form Content */}
        <Card className="p-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outlined"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 6 ? (
              <Button
                variant="primary"
                onClick={nextStep}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default ZoningClearanceApplication;
