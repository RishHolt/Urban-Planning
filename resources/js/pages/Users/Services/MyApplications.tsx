import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Calendar, User, FileText, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
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


const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
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

  // Helper function to convert snake_case to camelCase
  const toCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(item => toCamelCase(item));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = toCamelCase(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  };

  // Load applications
  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        // Fetch from API
        const response = await fetch('/api/zoning/applications', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          // Transform snake_case to camelCase for frontend
          const transformedApps = result.data.map((app: any) => ({
            id: app.id?.toString(),
            applicationNumber: app.application_number,
            status: app.status,
            submittedAt: app.created_at,
            reviewedAt: app.reviewed_at,
            assignedStaff: app.assigned_staff,
            
            // Personal Information
            firstName: app.first_name,
            lastName: app.last_name,
            address: app.address,
            contactNumber: app.contact_number,
            businessName: app.business_name,
            email: app.email,
            typeOfApplicant: app.type_of_applicant,

            // Project Details
            projectDescription: app.project_description,
            projectType: app.project_type,
            projectLocation: app.project_location,
            totalLotAreaSqm: app.total_lot_area_sqm,
            totalFloorAreaSqm: app.total_floor_area_sqm,

            // Land Ownership
            landOwnership: app.land_ownership,
            nameOfOwner: app.name_of_owner,
            tctNo: app.tct_no,
            taxDeclarationNo: app.tax_declaration_no,
            lotBlockSurveyNo: app.lot_block_survey_no,
            barangayClearanceId: app.barangay_clearance_id,

            // Documents - check if documents array exists
            documentsSubmitted: {
              siteDevelopmentPlan: app.documents?.some((d: any) => d.document_type === 'site_development_plan') || false,
              vicinityMap: app.documents?.some((d: any) => d.document_type === 'vicinity_map') || false,
              buildingPlan: app.documents?.some((d: any) => d.document_type === 'building_plan') || false,
              environmentalClearance: app.documents?.some((d: any) => d.document_type === 'environmental_clearance') || false,
              dpwhClearance: app.documents?.some((d: any) => d.document_type === 'dpwh_clearance') || false,
              subdivisionPermit: app.documents?.some((d: any) => d.document_type === 'subdivision_permit') || false,
              businessPermit: app.documents?.some((d: any) => d.document_type === 'business_permit') || false,
              fireSafetyClearance: app.documents?.some((d: any) => d.document_type === 'fire_safety_clearance') || false
            },
            additionalNotes: app.additional_notes,

            // Payment Information
            orReferenceNumber: app.or_reference_number,
            orDate: app.or_date,
            paymentStatus: app.payment_status,

            // Declaration
            declarationAccepted: true,

            // Fees
            fees: {
              applicationFee: parseFloat(app.application_fee || '0'),
              baseFee: parseFloat(app.base_fee || '0'),
              processingFee: parseFloat(app.processing_fee || '0'),
              total: parseFloat(app.total_fee || '0')
            }
          }));

          setApplications(transformedApps);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        // Keep empty array on error
        setApplications([]);
        
        // Fallback to mock data for demo - remove this in production
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
        
        setApplications(mockApplications);
      } finally {
        setLoading(false);
      }
    };

    // Only load if user is authenticated
    if (userData !== null) {
      loadApplications();
    } else {
      setLoading(false);
    }
  }, [userData]);

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

  const handleViewDetails = (application: Application) => {
    router.visit(`/my-applications/${application.id}`);
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
                onClick={() => router.visit('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Landing Page</span>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-2">Track the status of your zoning clearance applications</p>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-600 mb-6">You haven't submitted any zoning clearance applications yet.</p>
              <Button 
                onClick={() => router.visit('/zoning-clearance/apply')}
                variant="success"
              >
                Submit New Application
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((application) => (
                <Card key={application.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(application)}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">#{application.applicationNumber}</h3>
                      <p className="text-sm text-gray-500">{application.projectType}</p>
                    </div>
                    <Badge 
                      variant={getStatusVariant(application.status) as any}
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      {getStatusIcon(application.status)}
                      <span className="capitalize">{application.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-2">{application.projectDescription}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(application.submittedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm">
                      {application.paymentStatus === 'confirmed' ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span>Payment Confirmed</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-yellow-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Payment Pending</span>
                        </div>
                      )}
                    </div>
                    {application.assignedStaff && (
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-2" />
                        {application.assignedStaff.name}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Fee</span>
                      <span className="font-semibold text-gray-900">₱{application.fees.total.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default MyApplications;
