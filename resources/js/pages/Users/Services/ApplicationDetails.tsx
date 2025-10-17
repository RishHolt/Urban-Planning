import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button, Card, PageHeader, Badge } from '../../../components';
import { apiService, type User as ApiUser } from '../../../lib/api';

interface Application {
  id: string;
  applicationNumber: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_changes';
  submittedAt: string;
  reviewedAt?: string;
  assignedStaff?: {
    id: string;
    name: string;
    role: string;
  };
  
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

  // Section 4: Technical Documents Status
  documentsSubmitted: {
    siteDevelopmentPlan: boolean;
    vicinityMap: boolean;
    buildingPlan: boolean;
    environmentalClearance: boolean;
    dpwhClearance: boolean;
    subdivisionPermit: boolean;
    businessPermit: boolean;
    fireSafetyClearance: boolean;
  };
  additionalNotes: string;

  // Section 5: Payment Information
  orReferenceNumber: string;
  orDate: string;
  paymentStatus: 'pending' | 'confirmed';

  // Section 6: Declaration (always true - no application without declaration)
  declarationAccepted?: boolean;

  // Calculated fields
  fees: {
    applicationFee: number;
    baseFee: number;
    processingFee: number;
    total: number;
  };
}

const ApplicationDetails: React.FC = () => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<ApiUser | null>(null);

  // Get user data on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (localUser && localUser.id) {
          try {
            const response = await apiService.getCurrentUser();
            if (response.success && response.user) {
              setUserData(response.user);
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

  // Load application data
  useEffect(() => {
    const loadApplication = async () => {
      setLoading(true);
      try {
        // Get application ID from URL
        const pathParts = window.location.pathname.split('/');
        const applicationId = pathParts[pathParts.length - 1];
        
        // Mock data for now - replace with actual API call
        const mockApplications: Application[] = [
          {
            id: '1',
            applicationNumber: 'ZC-2024-001',
            status: 'under_review',
            submittedAt: '2024-01-15T10:30:00Z',
            reviewedAt: '2024-01-16T14:20:00Z',
            assignedStaff: {
              id: 'staff1',
              name: 'John Smith',
              role: 'Zoning Officer'
            },
            
            // Personal Information
            firstName: 'Juan',
            lastName: 'Dela Cruz',
            address: '123 Main Street, Barangay 1, Caloocan City',
            contactNumber: '+63 912 345 6789',
            businessName: 'Dela Cruz Construction Corp.',
            email: 'juan.delacruz@email.com',
            typeOfApplicant: 'Corporation',

            // Project Details
            projectDescription: 'Construction of 3-story residential building with 6 units for family housing',
            projectType: 'Residential',
            projectLocation: '123 Main Street, Barangay 1, Caloocan City',
            totalLotAreaSqm: '200',
            totalFloorAreaSqm: '150',

            // Land Ownership
            landOwnership: 'Owned',
            nameOfOwner: 'Juan Dela Cruz',
            tctNo: 'TCT-123456',
            taxDeclarationNo: 'TD-789012',
            lotBlockSurveyNo: 'Lot 1, Block 2, Survey No. 345',
            barangayClearanceId: 'BC-2024-001',

            // Technical Documents Status
            documentsSubmitted: {
              siteDevelopmentPlan: true,
              vicinityMap: true,
              buildingPlan: true,
              environmentalClearance: false,
              dpwhClearance: false,
              subdivisionPermit: false,
              businessPermit: true,
              fireSafetyClearance: true
            },
            additionalNotes: 'Project includes parking area and garden space',

            // Payment Information
            orReferenceNumber: 'OR-2024-001234',
            orDate: '2024-01-15',
            paymentStatus: 'confirmed',

            // Declaration
            declarationAccepted: true, // All applications must have accepted declaration

            // Fees
            fees: {
              applicationFee: 250,
              baseFee: 400,
              processingFee: 450,
              total: 1100
            }
          },
          {
            id: '2',
            applicationNumber: 'ZC-2024-002',
            status: 'approved',
            submittedAt: '2024-01-10T09:15:00Z',
            reviewedAt: '2024-01-12T16:45:00Z',
            assignedStaff: {
              id: 'staff2',
              name: 'Maria Garcia',
              role: 'Senior Zoning Officer'
            },
            
            // Personal Information
            firstName: 'Maria',
            lastName: 'Santos',
            address: '456 Business Ave, Barangay 2, Caloocan City',
            contactNumber: '+63 917 234 5678',
            businessName: 'Santos Enterprises Inc.',
            email: 'maria.santos@email.com',
            typeOfApplicant: 'Corporation',

            // Project Details
            projectDescription: 'Commercial office building development with retail spaces on ground floor',
            projectType: 'Commercial',
            projectLocation: '456 Business Ave, Barangay 2, Caloocan City',
            totalLotAreaSqm: '500',
            totalFloorAreaSqm: '300',

            // Land Ownership
            landOwnership: 'Leased',
            nameOfOwner: 'ABC Property Management',
            tctNo: 'TCT-234567',
            taxDeclarationNo: 'TD-890123',
            lotBlockSurveyNo: 'Lot 3, Block 1, Survey No. 456',
            barangayClearanceId: 'BC-2024-002',

            // Technical Documents Status
            documentsSubmitted: {
              siteDevelopmentPlan: true,
              vicinityMap: true,
              buildingPlan: true,
              environmentalClearance: true,
              dpwhClearance: true,
              subdivisionPermit: false,
              businessPermit: true,
              fireSafetyClearance: true
            },
            additionalNotes: 'Includes 20 parking slots and elevator access',

            // Payment Information
            orReferenceNumber: 'OR-2024-001235',
            orDate: '2024-01-16',
            paymentStatus: 'confirmed',

            // Declaration
            declarationAccepted: true, // All applications must have accepted declaration

            // Fees
            fees: {
              applicationFee: 250,
              baseFee: 400,
              processingFee: 900,
              total: 1550
            }
          },
          {
            id: '3',
            applicationNumber: 'ZC-2024-003',
            status: 'requires_changes',
            submittedAt: '2024-01-20T11:00:00Z',
            reviewedAt: '2024-01-22T10:30:00Z',
            assignedStaff: {
              id: 'staff3',
              name: 'Robert Johnson',
              role: 'Zoning Inspector'
            },
            
            // Personal Information
            firstName: 'Robert',
            lastName: 'Johnson',
            address: '789 Industrial Blvd, Barangay 3, Caloocan City',
            contactNumber: '+63 918 345 6789',
            businessName: 'Johnson Logistics Corp.',
            email: 'robert.johnson@email.com',
            typeOfApplicant: 'Corporation',

            // Project Details
            projectDescription: 'Warehouse construction for logistics and distribution center',
            projectType: 'Industrial',
            projectLocation: '789 Industrial Blvd, Barangay 3, Caloocan City',
            totalLotAreaSqm: '1000',
            totalFloorAreaSqm: '500',

            // Land Ownership
            landOwnership: 'Owned',
            nameOfOwner: 'Robert Johnson',
            tctNo: 'TCT-345678',
            taxDeclarationNo: 'TD-901234',
            lotBlockSurveyNo: 'Lot 5, Block 4, Survey No. 567',
            barangayClearanceId: 'BC-2024-003',

            // Technical Documents Status
            documentsSubmitted: {
              siteDevelopmentPlan: true,
              vicinityMap: true,
              buildingPlan: false,
              environmentalClearance: true,
              dpwhClearance: false,
              subdivisionPermit: false,
              businessPermit: true,
              fireSafetyClearance: false
            },
            additionalNotes: 'Requires additional fire safety measures due to industrial nature',

            // Payment Information
            orReferenceNumber: 'OR-2024-001236',
            orDate: '2024-01-17',
            paymentStatus: 'pending',

            // Declaration
            declarationAccepted: true, // All applications must have accepted declaration

            // Fees
            fees: {
              applicationFee: 250,
              baseFee: 400,
              processingFee: 1500,
              total: 2150
            }
          }
        ];
        
        const foundApplication = mockApplications.find(app => app.id === applicationId);
        setApplication(foundApplication || null);
      } catch (error) {
        console.error('Error loading application:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, []);

  const handleUserDataChange = (user: ApiUser | null) => {
    setUserData(user);
  };

  const handleLogout = () => {
    console.log('Logout completed');
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'under_review': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'requires_changes': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'under_review': return <FileText className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'requires_changes': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          userData={userData}
          onUserDataChange={handleUserDataChange}
          onLogout={handleLogout}
        />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          userData={userData}
          onUserDataChange={handleUserDataChange}
          onLogout={handleLogout}
        />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <Card className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Not Found</h3>
              <p className="text-gray-600 mb-6">The requested application could not be found.</p>
              <Button 
                onClick={() => router.visit('/my-applications')}
                variant="primary"
              >
                Back to My Applications
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        userData={userData}
        onUserDataChange={handleUserDataChange}
        onLogout={handleLogout}
      />
      
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => router.visit('/my-applications')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to My Applications</span>
              </Button>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Application #{application.applicationNumber}</h1>
                <p className="text-gray-600 mt-2">{application.projectType} • {application.projectLocation}</p>
              </div>
              <Badge 
                variant={getStatusVariant(application.status) as any}
                size="lg"
                className="flex items-center space-x-2"
              >
                {getStatusIcon(application.status)}
                <span className="capitalize">{application.status.replace('_', ' ')}</span>
              </Badge>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Personal Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900 mt-1">{application.firstName} {application.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type of Applicant</label>
                  <p className="text-gray-900 mt-1">{application.typeOfApplicant}</p>
                </div>
                {application.businessName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Name</label>
                    <p className="text-gray-900 mt-1">{application.businessName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900 mt-1">{application.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Number</label>
                  <p className="text-gray-900 mt-1">{application.contactNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1">{application.email}</p>
                </div>
              </div>
            </Card>

            {/* Project Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Description</label>
                  <p className="text-gray-900 mt-1">{application.projectDescription}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Type</label>
                  <p className="text-gray-900 mt-1">{application.projectType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Location</label>
                  <p className="text-gray-900 mt-1">{application.projectLocation}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Lot Area</label>
                    <p className="text-gray-900 mt-1">{application.totalLotAreaSqm} sqm</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Floor Area</label>
                    <p className="text-gray-900 mt-1">{application.totalFloorAreaSqm} sqm</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Land Ownership Information */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Land Ownership Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Land Ownership</label>
                  <p className="text-gray-900 mt-1">{application.landOwnership}</p>
                </div>
                {application.landOwnership !== 'Owned' && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name of Owner</label>
                    <p className="text-gray-900 mt-1">{application.nameOfOwner}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">TCT No.</label>
                  <p className="text-gray-900 mt-1">{application.tctNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tax Declaration No.</label>
                  <p className="text-gray-900 mt-1">{application.taxDeclarationNo}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lot / Block / Survey No.</label>
                  <p className="text-gray-900 mt-1">{application.lotBlockSurveyNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Barangay Clearance ID</label>
                  <p className="text-gray-900 mt-1">{application.barangayClearanceId}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Technical Documents Status */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical Documents Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(application.documentsSubmitted).map(([key, submitted]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge 
                    variant={submitted ? 'success' : 'warning'}
                    size="sm"
                  >
                    {submitted ? 'Submitted' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
            {application.additionalNotes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Additional Notes</label>
                <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{application.additionalNotes}</p>
              </div>
            )}
          </Card>

          {/* Application Details */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted Date</label>
                  <p className="text-gray-900 mt-1">{new Date(application.submittedAt).toLocaleDateString()}</p>
                </div>
                {application.reviewedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reviewed Date</label>
                    <p className="text-gray-900 mt-1">{new Date(application.reviewedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {application.assignedStaff && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned Staff</label>
                    <p className="text-gray-900 mt-1">{application.assignedStaff.name}</p>
                    <p className="text-sm text-gray-500">{application.assignedStaff.role}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Fee Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Application Fee</span>
                <span className="font-medium">₱{application.fees.applicationFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fee (Verification + Inspection)</span>
                <span className="font-medium">₱{application.fees.baseFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee ({application.totalFloorAreaSqm} sqm × ₱3.00)</span>
                <span className="font-medium">₱{application.fees.processingFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Fee</span>
                  <span>₱{application.fees.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">OR Reference Number</label>
                <p className="text-gray-900 font-medium">{application.orReferenceNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">OR Date</label>
                <p className="text-gray-900 font-medium">{new Date(application.orDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Status</label>
                <div className="flex items-center space-x-2">
                  {application.paymentStatus === 'confirmed' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Confirmed</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">Pending</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {application.paymentStatus === 'pending' && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2" />
                  <p className="text-sm text-yellow-700">
                    Payment verification is pending. The treasury will verify your payment and update the status accordingly.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
