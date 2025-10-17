import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Building, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Edit,
  Calendar,
  DollarSign,
  Home,
  ChevronRight,
  Eye,
  Upload,
  Send,
  RotateCcw,
  History,
  CreditCard,
  Users
} from 'lucide-react';
import { 
  Button, 
  Card, 
  Badge, 
  LocationViewer, 
  LocationPicker,
  Input,
  TextArea,
  Select,
  Modal
} from '../../../components';
import AppLayout from '../../../layouts/AppLayout';
import Swal from 'sweetalert2';

interface Document {
  id: number;
  document_type: string;
  document_category: 'initial_review' | 'technical_review';
  file_name: string;
  file_path: string;
  file_type: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: {
    id: number;
    name: string;
  };
  reviewed_at?: string;
  review_remarks?: string;
  file_url: string;
  document_type_display: string;
  created_at?: string;
}

interface ZoningApplication {
  id: number;
  application_number: string;
  status: 'pending' | 'initial_review' | 'technical_review' | 'awaiting_approval' | 'approved' | 'rejected' | 'requires_changes';
  created_at: string;
  reviewed_at?: string;
  assigned_staff?: {
    id: string;
    name: string;
    role: string;
  };
  technical_staff?: {
    id: string;
    name: string;
    role: string;
  };
  technical_review_started?: boolean;
  forwarded_to_technical_at?: string;
  returned_from_technical_at?: string;
  
  // Personal Information
  first_name: string;
  last_name: string;
  address: string;
  contact_number: string;
  business_name: string;
  email: string;
  type_of_applicant: string;

  // Project Details
  project_description: string;
  project_type: string;
  project_location: string;
  total_lot_area_sqm: string;
  total_floor_area_sqm: string;

  // Location
  latitude?: string;
  longitude?: string;
  location_confirmed_at?: string;

  // Land Ownership
  land_ownership: string;
  name_of_owner?: string;
  tct_no: string;
  tax_declaration_no: string;
  lot_block_survey_no: string;
  barangay_clearance_id: string;

  // Payment Information
  or_reference_number?: string;
  or_date?: string;
  payment_status: 'pending' | 'confirmed';

  // Fees
  application_fee: string;
  base_fee: string;
  processing_fee: string;
  total_fee: string;

  // Documents and History
  documents: Document[];
  history: ApplicationHistory[];
}

interface ApplicationHistory {
  id: number;
  action: string;
  old_value?: string;
  new_value?: string;
  remarks?: string;
  performed_by?: {
    id: number;
    name: string;
  };
  created_at: string;
}

const BuildingReview: React.FC<{ applicationId: number }> = ({ applicationId }) => {
  const [application, setApplication] = useState<ZoningApplication | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState<Document | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    loadApplication();
    loadHistory();
  }, [applicationId]);

  const loadApplication = async () => {
    setLoading(true);
    setError(null);
    try {
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
        setApplication(result.data);
      } else {
        throw new Error(result.message || 'Application not found');
      }
    } catch (error) {
      console.error('Error loading application:', error);
      setError(error instanceof Error ? error.message : 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}/history`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setHistory(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handlePaymentToggle = async (confirm: boolean) => {
    try {
      const endpoint = confirm ? 'confirm' : 'unpay';
      const response = await fetch(`/api/zoning/applications/${applicationId}/payment/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        await loadApplication();
        await loadHistory();
        Swal.fire({
          title: 'Success',
          text: `Payment ${confirm ? 'confirmed' : 'set to pending'}`,
          icon: 'success',
          timer: 2000
        });
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update payment status',
        icon: 'error'
      });
    }
  };

  const handleVerifyDocument = async () => {
    if (!selectedDocumentId) return;
    
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}/documents/${selectedDocumentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remarks: verifyRemarks
        })
      });

      if (response.ok) {
        await loadApplication();
        await loadHistory();
        setShowVerifyModal(false);
        setVerifyRemarks('');
        setSelectedDocumentId(null);
        Swal.fire({
          title: 'Success',
          text: 'Document verified successfully',
          icon: 'success',
          timer: 2000
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: 'Error',
          text: errorData.message || 'Failed to verify document',
          icon: 'error'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to verify document',
        icon: 'error'
      });
    }
  };

  const handleRejectDocument = async () => {
    if (!selectedDocumentId) return;
    
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}/documents/${selectedDocumentId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remarks: rejectRemarks
        })
      });

      if (response.ok) {
        await loadApplication();
        await loadHistory();
        setShowRejectModal(false);
        setRejectRemarks('');
        setSelectedDocumentId(null);
        Swal.fire({
          title: 'Success',
          text: 'Document rejected successfully',
          icon: 'success',
          timer: 2000
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: 'Error',
          text: errorData.message || 'Failed to reject document',
          icon: 'error'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to reject document',
        icon: 'error'
      });
    }
  };

  const handleReturnToZoning = async () => {
    if (!application) return;

    setProcessingAction(true);
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}/return-to-zoning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        await loadApplication();
        await loadHistory();
        Swal.fire({
          title: 'Success',
          text: 'Application returned to zoning for final approval',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: 'Error',
          text: errorData.message || 'Failed to return to zoning',
          icon: 'error'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to return to zoning',
        icon: 'error'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleStartTechnicalReview = async () => {
    if (!application) return;

    setProcessingAction(true);
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}/start-technical-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        await loadApplication();
        await loadHistory();
        Swal.fire({
          title: 'Success',
          text: 'Technical review started successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: 'Error',
          text: errorData.message || 'Failed to start technical review',
          icon: 'error'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to start technical review',
        icon: 'error'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDownloadDocument = async (documentId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}/documents/${documentId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to download document',
        icon: 'error'
      });
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
      default: return 'info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'initial_review': return <Eye className="w-4 h-4" />;
      case 'technical_review': return <Building className="w-4 h-4" />;
      case 'awaiting_approval': return <CheckCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'requires_changes': return <Edit className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    return status === 'confirmed' ? 'success' : 'warning';
  };

  const getDocumentStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getGroupBDocuments = () => {
    return application?.documents?.filter(doc => doc.document_category === 'technical_review') || [];
  };

  const canReturnToZoning = () => {
    const groupBDocs = getGroupBDocuments();
    return groupBDocs.length > 0 && groupBDocs.every(doc => doc.verification_status === 'approved');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !application) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Application</h2>
            <p className="text-gray-600 mb-4">{error || 'Application not found'}</p>
            <Button onClick={() => router.visit('/zoning')}>
              Back to Applications
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="flex-shrink-0 flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.visit('/zoning')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{application.application_number}</h1>
              <p className="text-gray-600">{application.project_type} Project</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={getStatusVariant(application.status)}>
              {getStatusIcon(application.status)}
              <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
            </Badge>
            <Badge variant={getPaymentStatusVariant(application.payment_status)}>
              <CreditCard className="w-4 h-4 mr-1" />
              Payment {application.payment_status}
            </Badge>
            <Badge variant="info">
              <Users className="w-4 h-4 mr-1" />
              technical
            </Badge>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-6">
            {/* Left Panel - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Status Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
                    <p className="text-sm text-gray-600">Current payment status: {application.payment_status}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant={application.payment_status === 'confirmed' ? 'outlined' : 'primary'}
                      size="sm"
                      onClick={() => handlePaymentToggle(true)}
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Mark Paid
                    </Button>
                    <Button
                      variant={application.payment_status === 'pending' ? 'outlined' : 'danger'}
                      size="sm"
                      onClick={() => handlePaymentToggle(false)}
                      icon={<XCircle className="w-4 h-4" />}
                    >
                      Mark Unpaid
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Signature Section */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Applicant Information & Signature</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <p className="text-gray-900">{application.first_name} {application.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Type of Applicant</label>
                    <p className="text-gray-900">{application.type_of_applicant}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <p className="text-gray-900">{application.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
                    <p className="text-gray-900">{application.contact_number}</p>
                  </div>
                </div>
                
                {/* Signature File */}
                {application.documents?.find(doc => doc.document_type === 'signature_file') && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Digital Signature</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Signature File</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const sigDoc = application.documents?.find(doc => doc.document_type === 'signature_file');
                          if (sigDoc) {
                            handleDownloadDocument(sigDoc.id, sigDoc.file_name);
                          }
                        }}
                        icon={<Download className="w-4 h-4" />}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Project Information */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Building className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Project Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Project Type</label>
                    <p className="text-gray-900">{application.project_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Project Location</label>
                    <p className="text-gray-900">{application.project_location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Lot Area</label>
                    <p className="text-gray-900">{parseFloat(application.total_lot_area_sqm).toFixed(2)} sqm</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Floor Area</label>
                    <p className="text-gray-900">{parseFloat(application.total_floor_area_sqm).toFixed(2)} sqm</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Project Description</label>
                    <p className="text-gray-900">{application.project_description}</p>
                  </div>
                </div>
              </Card>


              {/* Land Ownership Section */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Home className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Land Ownership Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Land Ownership</label>
                    <p className="text-gray-900">{application.land_ownership}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Name of Owner</label>
                    <p className="text-gray-900">{application.name_of_owner || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">TCT No.</label>
                    <p className="text-gray-900">{application.tct_no}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tax Declaration No.</label>
                    <p className="text-gray-900">{application.tax_declaration_no}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Lot/Block/Survey No.</label>
                    <p className="text-gray-900">{application.lot_block_survey_no}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Barangay Clearance ID</label>
                    <p className="text-gray-900">{application.barangay_clearance_id}</p>
                  </div>
                </div>
              </Card>

              {/* Group B Documents - Technical Review */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Group B Documents (Technical Review)</h3>
                  </div>
                  <Badge variant="info">Building/Subdivision Office</Badge>
                </div>
                
          {/* Debug Information - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs">
              <div className="font-medium text-yellow-800 mb-1">Debug Info:</div>
              <div>Total documents: {application?.documents?.length || 0}</div>
              <div>Technical documents: {getGroupBDocuments().length}</div>
              <div>All document categories: {application?.documents?.map(doc => doc.document_category).join(', ') || 'None'}</div>
              <div>Status: {application?.status}</div>
              <div>Technical staff: {application?.technical_staff?.id ? 'Yes' : 'No'}</div>
              <div>Document statuses: {application?.documents?.map(doc => doc.verification_status).join(', ') || 'None'}</div>
            </div>
          )}
                
                <div className="space-y-3">
                  {getGroupBDocuments().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">No technical documents submitted</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Technical documents (Site Development Plan, Building Plan, etc.) will appear here once submitted by the applicant.
                      </p>
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-left">
                        <p className="text-xs font-medium text-blue-800 mb-1">Required Technical Documents:</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Site Development Plan</li>
                          <li>• Building Plan</li>
                          <li>• Subdivision Permit</li>
                          <li>• Fire Safety Clearance</li>
                          <li>• Vicinity Map</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    getGroupBDocuments().map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getDocumentStatusVariant(doc.verification_status)}>
                            {getDocumentStatusIcon(doc.verification_status)}
                            <span className="ml-1">{doc.verification_status}</span>
                          </Badge>
                          <span className="text-sm text-gray-700">{doc.document_type_display}</span>
                          {doc.reviewed_by && (
                            <span className="text-xs text-gray-500">
                              by {doc.reviewed_by.name}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc.id, doc.file_name)}
                            icon={<Download className="w-4 h-4" />}
                          >
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDocumentModal(doc)}
                            icon={<Eye className="w-4 h-4" />}
                          >
                            View
                          </Button>
                          {doc.verification_status === 'pending' && application.status === 'technical_review' && application.technical_staff?.id && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => {
                                  setSelectedDocumentId(doc.id);
                                  setVerifyRemarks('');
                                  setShowVerifyModal(true);
                                }}
                                icon={<CheckCircle className="w-4 h-4" />}
                              >
                                Verify
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedDocumentId(doc.id);
                                  setRejectRemarks('');
                                  setShowRejectModal(true);
                                }}
                                icon={<XCircle className="w-4 h-4" />}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* All Documents Section - For Reference */}
              {application?.documents && application.documents.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">All Submitted Documents</h3>
                    </div>
                    <Badge variant="default" size="sm">
                      {application.documents.length} documents
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {application.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={doc.document_category === 'technical_review' ? 'info' : 'default'} 
                            size="sm"
                          >
                            {doc.document_category === 'technical_review' ? 'Technical' : 'Initial'}
                          </Badge>
                          <span className="text-sm text-gray-700">{doc.document_type_display}</span>
                          <Badge variant={getDocumentStatusVariant(doc.verification_status)} size="sm">
                            {doc.verification_status}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc.id, doc.file_name)}
                            icon={<Download className="w-3 h-3" />}
                          >
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDocumentModal(doc)}
                            icon={<Eye className="w-3 h-3" />}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Panel - Actions & Info */}
            <div className="space-y-6">
              {/* Workflow Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Actions</h3>
                <div className="space-y-3">
                  {application.status === 'technical_review' && !application.technical_review_started && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleStartTechnicalReview}
                      disabled={processingAction}
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Start Technical Review
                    </Button>
                  )}
                  
                  {application.status === 'technical_review' && canReturnToZoning() && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleReturnToZoning}
                      disabled={processingAction}
                      icon={<RotateCcw className="w-4 h-4" />}
                    >
                      Pass to Zoning for Final Approval
                    </Button>
                  )}
                  
                  {application.status === 'technical_review' && !canReturnToZoning() && application.technical_review_started && (
                    <Button
                      variant="primary"
                      className="w-full"
                      disabled
                      icon={<Clock className="w-4 h-4" />}
                    >
                      Awaiting Document Review
                    </Button>
                  )}
                </div>
              </Card>

              {/* Application History */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <History className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Application History</h3>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {history && history.length > 0 ? (
                    history.map((item) => (
                      <div key={item.id} className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        </div>
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {item.action.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </p>
                            {item.action === 'document_verified' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                            )}
                            {item.action === 'document_rejected' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                              </span>
                            )}
                            {item.action === 'payment_confirmed' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <CreditCard className="w-3 h-3 mr-1" />
                                Payment Confirmed
                              </span>
                            )}
                            {item.action === 'status_changed' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Status Changed
                              </span>
                            )}
                            {item.action === 'forwarded_to_technical' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <Send className="w-3 h-3 mr-1" />
                                Forwarded to Technical
                              </span>
                            )}
                            {item.action === 'returned_to_zoning' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Returned to Zoning
                              </span>
                            )}
                            {item.action === 'approved' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approved
                              </span>
                            )}
                            {item.action === 'technical_review_started' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Building className="w-3 h-3 mr-1" />
                                Technical Review Started
                              </span>
                            )}
                          </div>
                          
                          {/* Show document type for document actions */}
                          {item.new_value && (item.action === 'document_verified' || item.action === 'document_rejected') && (
                            <p className="text-sm text-gray-700 mt-1">
                              <strong>Document:</strong> {item.new_value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </p>
                          )}
                          
                          {/* Show status change details */}
                          {item.action === 'status_changed' && item.old_value && item.new_value && (
                            <p className="text-sm text-gray-700 mt-1">
                              <strong>Status:</strong> {item.old_value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} → {item.new_value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </p>
                          )}
                          
                          {/* Show remarks */}
                          {item.remarks && (
                            <p className="text-xs text-gray-600 mt-1">
                              <strong>Remarks:</strong> {item.remarks}
                            </p>
                          )}
                          
                          {/* Show performed by and timestamp */}
                          <div className="flex items-center gap-4 mt-1">
                            {item.performed_by && (
                              <p className="text-xs text-gray-500">
                                by <span className="font-medium">{item.performed_by.name}</span>
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No history available</p>
                  )}
                </div>
              </Card>

              {/* Fee Information */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Fee Information</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application Fee</span>
                    <span className="font-medium">₱{parseFloat(application.application_fee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Fee</span>
                    <span className="font-medium">₱{parseFloat(application.base_fee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-medium">₱{parseFloat(application.processing_fee).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Fee</span>
                      <span>₱{parseFloat(application.total_fee).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Document Preview Modal */}
        <Modal
          isOpen={!!showDocumentModal}
          onClose={() => setShowDocumentModal(null)}
          title={showDocumentModal?.document_type_display || 'Document'}
        >
          {showDocumentModal && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{showDocumentModal.file_name}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(showDocumentModal.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                <Badge 
                  variant={getDocumentStatusVariant(showDocumentModal.verification_status)}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  {getDocumentStatusIcon(showDocumentModal.verification_status)}
                  <span className="capitalize">{showDocumentModal.verification_status}</span>
                </Badge>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                {showDocumentModal.file_type === 'pdf' ? (
                  <iframe
                    src={showDocumentModal.file_url}
                    className="w-full h-96 border-0"
                    title={showDocumentModal.file_name}
                  />
                ) : (
                  <img
                    src={showDocumentModal.file_url}
                    alt={showDocumentModal.file_name}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                )}
              </div>
              
              {showDocumentModal.review_remarks && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-1">Review Remarks</h4>
                  <p className="text-sm text-yellow-700">{showDocumentModal.review_remarks}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outlined"
                  onClick={() => setShowDocumentModal(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => window.open(showDocumentModal.file_url, '_blank')}
                >
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Verify Document Modal */}
        <Modal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          title="Verify Document"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please add any remarks for this document verification.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks (Optional)
              </label>
              <TextArea
                value={verifyRemarks}
                onChange={(e) => setVerifyRemarks(e.target.value)}
                placeholder="Add verification remarks..."
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outlined"
                onClick={() => setShowVerifyModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleVerifyDocument}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Verify Document
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reject Document Modal */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Reject Document"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide the reason for rejecting this document.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <TextArea
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="Please specify why this document is being rejected..."
                rows={3}
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outlined"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRejectDocument}
                disabled={!rejectRemarks.trim()}
                icon={<XCircle className="w-4 h-4" />}
              >
                Reject Document
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default BuildingReview;
               