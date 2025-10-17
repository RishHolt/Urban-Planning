import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, FileText, Clock, CheckCircle, XCircle, AlertCircle, MapPin, Upload, Download, Eye } from 'lucide-react';
import { Button, Card, PageHeader, Badge, LocationViewer, Input, TextArea, Modal } from '../../../components';
import { apiService, type User as ApiUser } from '../../../lib/api';
import Swal from 'sweetalert2';

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  reviewRemarks?: string;
  documentCategory: 'initial_review' | 'technical_review';
  uploadedAt: string;
}

interface ApplicationHistory {
  id: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  remarks?: string;
  performedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Application {
  id: string;
  applicationNumber: string;
  status: 'pending' | 'initial_review' | 'technical_review' | 'awaiting_approval' | 'approved' | 'rejected' | 'requires_changes';
  submittedAt: string;
  reviewedAt?: string;
  assignedStaff?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  technicalStaff?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  forwardedToTechnicalAt?: string;
  returnedFromTechnicalAt?: string;
  
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
  
  // Location
  latitude?: string;
  longitude?: string;

  // Section 3: Land Ownership
  landOwnership: string;
  nameOfOwner: string;
  tctNo: string;
  taxDeclarationNo: string;
  lotBlockSurveyNo: string;
  barangayClearanceId: string;

  // Documents
  documents: Document[];

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

  // History
  history: ApplicationHistory[];
}

const ApplicationDetails: React.FC = () => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<ApiUser | null>(null);
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);
  const [reuploading, setReuploading] = useState(false);

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
        
        // Fetch from API
        const response = await fetch(`/api/zoning/applications/${applicationId}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch application');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          const app = result.data;
          
          // Transform snake_case to camelCase
          const transformedApp: Application = {
            id: app.id?.toString(),
            applicationNumber: app.application_number,
            status: app.status,
            submittedAt: app.created_at,
            reviewedAt: app.reviewed_at,
            assignedStaff: app.assigned_staff,
            technicalStaff: app.technical_staff,
            forwardedToTechnicalAt: app.forwarded_to_technical_at,
            returnedFromTechnicalAt: app.returned_from_technical_at,
            
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
            latitude: app.latitude,
            longitude: app.longitude,

            // Land Ownership
            landOwnership: app.land_ownership,
            nameOfOwner: app.name_of_owner,
            tctNo: app.tct_no,
            taxDeclarationNo: app.tax_declaration_no,
            lotBlockSurveyNo: app.lot_block_survey_no,
            barangayClearanceId: app.barangay_clearance_id,

            // Documents
            documents: app.documents?.map((doc: any) => ({
              id: doc.id?.toString(),
              documentType: doc.document_type,
              fileName: doc.file_name,
              filePath: doc.file_path,
              fileUrl: doc.file_url,
              verificationStatus: doc.verification_status,
              reviewedBy: doc.reviewed_by,
              reviewedAt: doc.reviewed_at,
              reviewRemarks: doc.review_remarks,
              documentCategory: doc.document_category,
              uploadedAt: doc.created_at
            })) || [],

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
            },

            // History
            history: app.history?.map((h: any) => ({
              id: h.id?.toString(),
              action: h.action,
              oldValue: h.old_value,
              newValue: h.new_value,
              remarks: h.remarks,
              performedBy: h.performed_by,
              createdAt: h.created_at
            })) || []
          };

          setApplication(transformedApp);
        } else {
          setApplication(null);
        }
      } catch (error) {
        console.error('Error loading application:', error);
        setApplication(null);
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

  const handleReuploadDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setShowReuploadModal(true);
  };

  const handleReuploadSubmit = async () => {
    if (!reuploadFile || !selectedDocumentId || !application) {
      return;
    }

    setReuploading(true);
    try {
      const formData = new FormData();
      formData.append('document', reuploadFile);

      const response = await fetch(`/api/zoning/applications/${application.id}/documents/${selectedDocumentId}/reupload`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to re-upload document');
      }

      const result = await response.json();
      
      if (result.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Document re-uploaded successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        
        // Reload application data
        window.location.reload();
      } else {
        throw new Error(result.message || 'Failed to re-upload document');
      }
    } catch (error) {
      console.error('Error re-uploading document:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to re-upload document. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setReuploading(false);
      setShowReuploadModal(false);
      setSelectedDocumentId(null);
      setReuploadFile(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'initial_review': return 'info';
      case 'technical_review': return 'info';
      case 'awaiting_approval': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'requires_changes': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'initial_review': return <FileText className="w-4 h-4" />;
      case 'technical_review': return <FileText className="w-4 h-4" />;
      case 'awaiting_approval': return <Clock className="w-4 h-4" />;
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

          {/* Location Map */}
          {application.latitude && application.longitude && (
            <Card className="p-6 mb-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Project Location</h3>
              </div>
              <LocationViewer
                latitude={parseFloat(application.latitude)}
                longitude={parseFloat(application.longitude)}
                height="400px"
                showPopup={true}
                showZones={true}
                projectType={application.projectType}
                popupContent={`Project Location: ${application.projectLocation}`}
              />
              <div className="mt-3 bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Coordinates:</span>
                  <div className="flex gap-4">
                    <span>Lat: {parseFloat(application.latitude).toFixed(6)}</span>
                    <span>Lng: {parseFloat(application.longitude).toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

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

          {/* Documents Section */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Submitted Documents</h3>
            
            {application.documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No documents submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {application.documents.map((document) => (
                  <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {document.documentType.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-sm text-gray-500">{document.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            document.verificationStatus === 'approved' ? 'success' :
                            document.verificationStatus === 'rejected' ? 'danger' : 'warning'
                          }
                          size="sm"
                        >
                          {document.verificationStatus === 'approved' ? 'Approved' :
                           document.verificationStatus === 'rejected' ? 'Rejected' : 'Pending'}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(document.fileUrl, '_blank')}
                            className="p-1"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/api/zoning/applications/${application.id}/documents/${document.id}/download`, '_blank')}
                            className="p-1"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {document.verificationStatus === 'rejected' && document.reviewRemarks && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-start">
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                            <p className="text-sm text-red-700 mt-1">{document.reviewRemarks}</p>
                            {document.reviewedBy && (
                              <p className="text-xs text-red-600 mt-1">
                                Reviewed by: {document.reviewedBy.firstName} {document.reviewedBy.lastName}
                              </p>
                            )}
                            {document.reviewedAt && (
                              <p className="text-xs text-red-600">
                                On: {new Date(document.reviewedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => handleReuploadDocument(document.id)}
                            className="text-red-700 border-red-300 hover:bg-red-50"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Re-upload Document
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {document.verificationStatus === 'approved' && document.reviewedBy && (
                      <div className="mt-2 text-xs text-gray-500">
                        Approved by: {document.reviewedBy.firstName} {document.reviewedBy.lastName}
                        {document.reviewedAt && (
                          <span> on {new Date(document.reviewedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {application.additionalNotes && (
              <div className="mt-6">
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
                    <p className="text-gray-900 mt-1">{application.assignedStaff.firstName} {application.assignedStaff.lastName}</p>
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

          {/* Application History */}
          {application.history && application.history.length > 0 && (
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Application History</h3>
              <div className="space-y-4">
                {application.history.map((historyItem) => (
                  <div key={historyItem.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {historyItem.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(historyItem.createdAt).toLocaleDateString()} {new Date(historyItem.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      {historyItem.oldValue && historyItem.newValue && (
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Changed from:</span> {historyItem.oldValue} 
                          <span className="mx-2">→</span>
                          <span className="font-medium">to:</span> {historyItem.newValue}
                        </div>
                      )}
                      {historyItem.remarks && (
                        <p className="mt-1 text-sm text-gray-600">{historyItem.remarks}</p>
                      )}
                      {historyItem.performedBy && (
                        <p className="mt-1 text-xs text-gray-500">
                          Performed by: {historyItem.performedBy.firstName} {historyItem.performedBy.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Re-upload Modal */}
          <Modal
            isOpen={showReuploadModal}
            onClose={() => setShowReuploadModal(false)}
            title="Re-upload Document"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please select a new file to replace the rejected document.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={(e) => setReuploadFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outlined"
                  onClick={() => setShowReuploadModal(false)}
                  disabled={reuploading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleReuploadSubmit}
                  disabled={!reuploadFile || reuploading}
                >
                  {reuploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
