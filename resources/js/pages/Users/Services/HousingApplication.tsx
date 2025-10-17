import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Check, Upload, AlertCircle, FileText, Eye, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle as AlertCircleIcon, MapPin, Plus, Trash2 } from 'lucide-react';
import { Timeline, Input, Select, TextArea, Button, Card, PageHeader, Modal, LocationPicker } from '../../../components';
import { apiService, type User as ApiUser } from '../../../lib/api';
import Swal from 'sweetalert2';

interface FamilyMember {
  name: string;
  relationship: string;
  age: number;
  occupation: string;
  monthlyIncome: number;
}

interface HousingFormData {
  // Personal Info
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  civilStatus: string;
  contactNumber: string;
  email: string;
  currentAddress: string;
  lengthOfResidency: string;
  barangay: string;
  district: string;
  
  // Family Composition
  familyMembers: FamilyMember[];
  totalHouseholdMembers: number;
  totalHouseholdIncome: number;
  
  // Housing Situation
  housingStatus: string;
  monthlyRent: string;
  landlordName: string;
  lengthOfStay: string;
  reasonForApplication: string;
  inDangerZone: boolean;
  
  // Employment
  employmentStatus: string;
  employerName: string;
  monthlyIncome: string;
  otherIncome: string;
  
  // Documents
  proofOfIncome: File | null;
  residencyCertificate: File | null;
  validIds: File | null;
  birthCertificates: File | null;
  marriageCertificate: File | null;
  noPropertyCertificate: File | null;
  housingProof: File | null;
  employmentCertificate: File | null;
  utilityBills: File | null;
  communityTaxCert: File | null;
  familyPhoto: File | null;
  
  // Declaration
  dataPrivacyConsent: boolean;
  declarationAccepted: boolean;
  penaltyAcknowledgment: boolean;
  signatureFile: File | null;
}

const HousingApplication: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [residencyCertificateValidating, setResidencyCertificateValidating] = useState(false);
  const [residencyCertificateValid, setResidencyCertificateValid] = useState<boolean | null>(null);
  const [residencyCertificateDetails, setResidencyCertificateDetails] = useState<any>(null);
  const [userData, setUserData] = useState<ApiUser | null>(null);

  const [formData, setFormData] = useState<HousingFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    age: 0,
    civilStatus: '',
    contactNumber: '',
    email: '',
    currentAddress: '',
    lengthOfResidency: '',
    barangay: '',
    district: '',
    familyMembers: [],
    totalHouseholdMembers: 0,
    totalHouseholdIncome: 0,
    housingStatus: '',
    monthlyRent: '',
    landlordName: '',
    lengthOfStay: '',
    reasonForApplication: '',
    inDangerZone: false,
    employmentStatus: '',
    employerName: '',
    monthlyIncome: '',
    otherIncome: '',
    proofOfIncome: null,
    residencyCertificate: null,
    validIds: null,
    birthCertificates: null,
    marriageCertificate: null,
    noPropertyCertificate: null,
    housingProof: null,
    employmentCertificate: null,
    utilityBills: null,
    communityTaxCert: null,
    familyPhoto: null,
    dataPrivacyConsent: false,
    declarationAccepted: false,
    penaltyAcknowledgment: false,
    signatureFile: null
  });

  const timelineSteps = [
    { id: 1, title: 'Personal Information', description: 'Basic applicant details' },
    { id: 2, title: 'Family Composition', description: 'Household members' },
    { id: 3, title: 'Current Housing Situation', description: 'Housing status and needs' },
    { id: 4, title: 'Income & Employment', description: 'Financial information' },
    { id: 5, title: 'Document Upload', description: 'Required documents' },
    { id: 6, title: 'Declaration', description: 'Agreement & signature' },
    { id: 7, title: 'Review & Submit', description: 'Final review and submission' }
  ];

  // Auto-fill user data on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!localUser || !localUser.id) {
          // Not logged in - redirect to login
          Swal.fire({
            title: 'Login Required',
            text: 'Please log in to submit a housing application.',
            icon: 'warning',
            confirmButtonText: 'Go to Login'
          }).then(() => {
            router.visit('/');
          });
          return;
        }
        
        // User is logged in - fetch and auto-fill details
        try {
          const response = await apiService.getCurrentUser();
          if (response.success && response.user) {
            setUserData(response.user);
            // Auto-fill user details from profile
            setFormData(prev => ({
              ...prev,
              firstName: response.user?.first_name || '',
              lastName: response.user?.last_name || '',
              email: response.user?.email || '',
              currentAddress: response.user?.address || '',
              contactNumber: response.user?.phone || ''
            }));
          } else {
            localStorage.removeItem('user');
            Swal.fire({
              title: 'Session Expired',
              text: 'Please log in again to continue.',
              icon: 'warning',
              confirmButtonText: 'Go to Login'
            }).then(() => {
              router.visit('/');
            });
          }
        } catch (error) {
          localStorage.removeItem('user');
          Swal.fire({
            title: 'Authentication Error',
            text: 'Please log in again to continue.',
            icon: 'error',
            confirmButtonText: 'Go to Login'
          }).then(() => {
            router.visit('/');
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'An error occurred. Please try again.',
          icon: 'error',
          confirmButtonText: 'Go to Login'
        }).then(() => {
          router.visit('/');
        });
      }
    };

    checkAuthStatus();
  }, []);

  // Calculate age from date of birth
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age }));
    }
  }, [formData.dateOfBirth]);

  // Calculate total household income
  useEffect(() => {
    const familyIncome = formData.familyMembers.reduce((sum, member) => sum + member.monthlyIncome, 0);
    const applicantIncome = parseFloat(formData.monthlyIncome || '0') + parseFloat(formData.otherIncome || '0');
    const totalIncome = familyIncome + applicantIncome;
    
    setFormData(prev => ({ 
      ...prev, 
      totalHouseholdIncome: totalIncome,
      totalHouseholdMembers: formData.familyMembers.length + 1 // +1 for applicant
    }));
  }, [formData.familyMembers, formData.monthlyIncome, formData.otherIncome]);

  // Residency certificate validation with debounce
  useEffect(() => {
    if (!formData.residencyCertificate) {
      setResidencyCertificateValid(null);
      setResidencyCertificateDetails(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      validateResidencyCertificate(formData.residencyCertificate);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.residencyCertificate]);

  const validateResidencyCertificate = async (certificate: File | null) => {
    if (!certificate) return;
    
    setResidencyCertificateValidating(true);
    try {
      // Simulate validation - replace with actual API call
      const response = await fetch(`/api/barangay-clearance/validate/${certificate.name}`);
      const data = await response.json();
      
      if (response.ok) {
        setResidencyCertificateValid(true);
        setResidencyCertificateDetails(data);
      } else {
        setResidencyCertificateValid(false);
        setResidencyCertificateDetails(null);
      }
    } catch (error) {
      setResidencyCertificateValid(false);
      setResidencyCertificateDetails(null);
    } finally {
      setResidencyCertificateValidating(false);
    }
  };

  const handleInputChange = (field: keyof HousingFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof HousingFormData, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      name: '',
      relationship: '',
      age: 0,
      occupation: '',
      monthlyIncome: 0
    };
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, newMember]
    }));
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const removeFamilyMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index)
    }));
  };

  // Helper function to convert camelCase to snake_case
  const toSnakeCase = (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  };

  const validateCurrentStep = (): boolean => {
    // Disabled for testing - always return true
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => Math.min(prev + 1, 7));
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
      
      // Transform and add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        // Convert camelCase to snake_case
        const snakeKey = toSnakeCase(key);
        
        if (value instanceof File) {
          formDataToSend.append(snakeKey, value);
        } else if (typeof value === 'boolean') {
          formDataToSend.append(snakeKey, value.toString());
        } else if (Array.isArray(value)) {
          formDataToSend.append(snakeKey, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(snakeKey, value.toString());
        }
      });

      const response = await fetch('/api/housing/applications', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Show success message with application number
        Swal.fire({
          title: 'Application Submitted Successfully!',
          html: `
            <div class="text-left">
              <p class="mb-2"><strong>Application Number:</strong> ${result.data.application_number}</p>
              <hr class="my-3"/>
              <p class="font-semibold mb-2">Next Steps:</p>
              <ol class="list-decimal list-inside text-sm space-y-1">
                <li>Wait for initial screening and qualification assessment</li>
                <li>You will receive email notification on application status</li>
                <li>If qualified, attend scheduled interview and document verification</li>
                <li>Wait for housing unit assignment based on availability</li>
              </ol>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'View My Applications',
          allowOutsideClick: false,
          width: '600px'
        }).then(() => {
          router.visit('/my-housing-applications');
        });
      } else {
        const error = await response.json();
        console.error('Submission error:', error);
        Swal.fire({
          title: 'Submission Failed',
          text: error.message || 'Failed to submit application. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      Swal.fire({
        title: 'Error',
        text: 'An unexpected error occurred. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
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
                label="Middle Name"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
                placeholder="Enter your middle name"
              />
              <Input
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                required
              />
              <Input
                label="Date of Birth *"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                required
              />
              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                disabled
              />
              <Select
                label="Civil Status *"
                value={formData.civilStatus}
                onChange={(value) => handleInputChange('civilStatus', value as string)}
                options={[
                  { value: '', label: 'Select civil status...' },
                  { value: 'Single', label: 'Single' },
                  { value: 'Married', label: 'Married' },
                  { value: 'Widowed', label: 'Widowed' },
                  { value: 'Divorced', label: 'Divorced' },
                  { value: 'Separated', label: 'Separated' }
                ]}
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
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                required
              />
              <Input
                label="Current Address *"
                value={formData.currentAddress}
                onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                placeholder="Enter your complete current address"
                required
              />
              <Input
                label="Length of Residency in Caloocan *"
                value={formData.lengthOfResidency}
                onChange={(e) => handleInputChange('lengthOfResidency', e.target.value)}
                placeholder="e.g., 5 years, 2 months"
                required
              />
              <Input
                label="Barangay *"
                value={formData.barangay}
                onChange={(e) => handleInputChange('barangay', e.target.value)}
                placeholder="Enter your barangay"
                required
              />
              <Input
                label="District *"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                placeholder="Enter your district"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Family Composition</h3>
            <p className="text-sm text-gray-600 mb-4">
              List all family members living in your household (excluding yourself).
            </p>
            
            <div className="space-y-4">
              {formData.familyMembers.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800">Family Member {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFamilyMember(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name *"
                      value={member.name}
                      onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                      placeholder="Enter full name"
                    />
                    <Select
                      label="Relationship *"
                      value={member.relationship}
                      onChange={(value) => updateFamilyMember(index, 'relationship', value as string)}
                      options={[
                        { value: '', label: 'Select relationship...' },
                        { value: 'Spouse', label: 'Spouse' },
                        { value: 'Child', label: 'Child' },
                        { value: 'Parent', label: 'Parent' },
                        { value: 'Sibling', label: 'Sibling' },
                        { value: 'Other', label: 'Other' }
                      ]}
                    />
                    <Input
                      label="Age *"
                      type="number"
                      value={member.age}
                      onChange={(e) => updateFamilyMember(index, 'age', parseInt(e.target.value) || 0)}
                      placeholder="Enter age"
                    />
                    <Input
                      label="Occupation *"
                      value={member.occupation}
                      onChange={(e) => updateFamilyMember(index, 'occupation', e.target.value)}
                      placeholder="Enter occupation"
                    />
                    <Input
                      label="Monthly Income *"
                      type="number"
                      value={member.monthlyIncome}
                      onChange={(e) => updateFamilyMember(index, 'monthlyIncome', parseFloat(e.target.value) || 0)}
                      placeholder="Enter monthly income"
                    />
                  </div>
                </div>
              ))}
              
              <Button
                variant="outlined"
                onClick={addFamilyMember}
                className="w-full"
                icon={<Plus className="w-4 h-4" />}
              >
                Add Family Member
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Household Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Household Members:</span>
                  <span className="font-medium ml-2">{formData.totalHouseholdMembers}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Monthly Income:</span>
                  <span className="font-medium ml-2">₱{formData.totalHouseholdIncome.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Housing Situation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Current Housing Status *"
                value={formData.housingStatus}
                onChange={(value) => handleInputChange('housingStatus', value as string)}
                options={[
                  { value: '', label: 'Select housing status...' },
                  { value: 'Renter', label: 'Renter' },
                  { value: 'Informal Settler', label: 'Informal Settler' },
                  { value: 'Living with relatives', label: 'Living with relatives' },
                  { value: 'Sharer', label: 'Sharer' },
                  { value: 'Homeless', label: 'Homeless' }
                ]}
                required
              />
              {formData.housingStatus === 'Renter' && (
                <Input
                  label="Monthly Rent *"
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                  placeholder="Enter monthly rent amount"
                />
              )}
              {formData.housingStatus === 'Renter' && (
                <Input
                  label="Landlord/Owner Name"
                  value={formData.landlordName}
                  onChange={(e) => handleInputChange('landlordName', e.target.value)}
                  placeholder="Enter landlord/owner name"
                />
              )}
              <Input
                label="Length of Stay at Current Address *"
                value={formData.lengthOfStay}
                onChange={(e) => handleInputChange('lengthOfStay', e.target.value)}
                placeholder="e.g., 3 years, 6 months"
                required
              />
              <div className="md:col-span-2">
                <TextArea
                  label="Reason for Application *"
                  value={formData.reasonForApplication}
                  onChange={(e) => handleInputChange('reasonForApplication', e.target.value)}
                  rows={4}
                  placeholder="Please explain why you need housing assistance..."
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.inDangerZone}
                    onChange={(e) => handleInputChange('inDangerZone', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Is your current dwelling located in a danger zone or high-risk area?
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Income & Employment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Employment Status *"
                value={formData.employmentStatus}
                onChange={(value) => handleInputChange('employmentStatus', value as string)}
                options={[
                  { value: '', label: 'Select employment status...' },
                  { value: 'Employed', label: 'Employed' },
                  { value: 'Self-employed', label: 'Self-employed' },
                  { value: 'Unemployed', label: 'Unemployed' },
                  { value: 'Retired', label: 'Retired' }
                ]}
                required
              />
              {(formData.employmentStatus === 'Employed' || formData.employmentStatus === 'Self-employed') && (
                <Input
                  label="Employer/Business Name *"
                  value={formData.employerName}
                  onChange={(e) => handleInputChange('employerName', e.target.value)}
                  placeholder="Enter employer or business name"
                />
              )}
              <Input
                label="Monthly Income *"
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                placeholder="Enter your monthly income"
                required
              />
              <Input
                label="Other Sources of Income"
                type="number"
                value={formData.otherIncome}
                onChange={(e) => handleInputChange('otherIncome', e.target.value)}
                placeholder="Enter other income sources"
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Income Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Your Monthly Income:</span>
                  <span className="font-medium ml-2">₱{parseFloat(formData.monthlyIncome || '0').toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Other Income:</span>
                  <span className="font-medium ml-2">₱{parseFloat(formData.otherIncome || '0').toFixed(2)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Total Household Income:</span>
                  <span className="font-medium ml-2">₱{formData.totalHouseholdIncome.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Upload</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'proofOfIncome', label: 'Proof of Income *', required: true },
                { key: 'residencyCertificate', label: 'Certificate of Residency *', required: true },
                { key: 'validIds', label: 'Valid Government-issued IDs *', required: true },
                { key: 'birthCertificates', label: 'Birth Certificates (PSA) *', required: true },
                { key: 'marriageCertificate', label: 'Marriage Certificate (PSA)', required: false },
                { key: 'noPropertyCertificate', label: 'Certificate of No Property Holdings *', required: true },
                { key: 'housingProof', label: 'Proof of Current Housing Situation *', required: true },
                { key: 'employmentCertificate', label: 'Employment Certificate *', required: true },
                { key: 'utilityBills', label: 'Latest Utility Bills *', required: true },
                { key: 'communityTaxCert', label: 'Community Tax Certificate *', required: true },
                { key: 'familyPhoto', label: '2x2 Family Photos *', required: true }
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(key as keyof HousingFormData, e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    required={required}
                  />
                  {key === 'residencyCertificate' && (
                    <div className="mt-2">
                      {residencyCertificateValidating && (
                        <div className="flex items-center text-blue-600 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Validating...
                        </div>
                      )}
                      {residencyCertificateValid === true && (
                        <div className="flex items-center text-green-600 text-sm">
                          <Check className="w-4 h-4 mr-2" />
                          Valid certificate
                        </div>
                      )}
                      {residencyCertificateValid === false && (
                        <div className="flex items-center text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Invalid certificate
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
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
                  I agree to comply with all applicable laws, rules, and regulations governing housing beneficiary applications.
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.dataPrivacyConsent}
                      onChange={(e) => handleInputChange('dataPrivacyConsent', e.target.checked)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I consent to the collection, processing, and use of my personal data in accordance with the Data Privacy Act of 2012.
                    </span>
                  </label>
                  
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.declarationAccepted}
                      onChange={(e) => handleInputChange('declarationAccepted', e.target.checked)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I hereby certify that the information above is true and correct and agree to the terms and conditions.
                    </span>
                  </label>
                  
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.penaltyAcknowledgment}
                      onChange={(e) => handleInputChange('penaltyAcknowledgment', e.target.checked)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I acknowledge that providing false information may result in disqualification and legal penalties.
                    </span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature / e-Signature (PDF) *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('signatureFile', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Review & Submit</h3>
            
            {/* Personal Information Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-600">Name:</span> <span className="font-medium">{formData.firstName} {formData.middleName} {formData.lastName}</span></div>
                <div><span className="text-gray-600">Age:</span> <span className="font-medium">{formData.age}</span></div>
                <div><span className="text-gray-600">Civil Status:</span> <span className="font-medium">{formData.civilStatus}</span></div>
                <div><span className="text-gray-600">Contact:</span> <span className="font-medium">{formData.contactNumber}</span></div>
                <div><span className="text-gray-600">Email:</span> <span className="font-medium">{formData.email}</span></div>
                <div><span className="text-gray-600">Barangay:</span> <span className="font-medium">{formData.barangay}</span></div>
              </div>
            </div>

            {/* Family Composition Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Family Composition</h4>
              <div className="text-sm mb-2">
                <span className="text-gray-600">Total Household Members:</span> <span className="font-medium">{formData.totalHouseholdMembers}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Total Monthly Income:</span> <span className="font-medium">₱{formData.totalHouseholdIncome.toFixed(2)}</span>
              </div>
            </div>

            {/* Housing Situation Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Housing Situation</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-600">Status:</span> <span className="font-medium">{formData.housingStatus}</span></div>
                {formData.monthlyRent && <div><span className="text-gray-600">Monthly Rent:</span> <span className="font-medium">₱{formData.monthlyRent}</span></div>}
                <div><span className="text-gray-600">Length of Stay:</span> <span className="font-medium">{formData.lengthOfStay}</span></div>
                <div><span className="text-gray-600">Danger Zone:</span> <span className="font-medium">{formData.inDangerZone ? 'Yes' : 'No'}</span></div>
              </div>
            </div>

            {/* Documents Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Uploaded Documents</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(formData).map(([key, value]) => {
                  if (value instanceof File) {
                    return (
                      <div key={key}>
                        <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                        <span className="font-medium text-green-600 ml-2">✓ Uploaded</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">Final Review</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Please review all information carefully before submitting. Once submitted, you cannot make changes to your application.
                  </p>
                </div>
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
                onClick={() => router.visit('/my-housing-applications')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <FileText className="w-4 h-4" />
                <span>My Applications</span>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Housing Beneficiary Application</h1>
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

            {currentStep < 7 ? (
              <Button
                variant="primary"
                onClick={nextStep}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
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

export default HousingApplication;