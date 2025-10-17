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
  name_of_owner: string;
  tct_no: string;
  tax_declaration_no: string;
  lot_block_survey_no: string;
  barangay_clearance_id: string;

  // Payment Information
  or_reference_number: string;
  or_date?: string;
  payment_status: 'pending' | 'confirmed';

  // Fees
  application_fee: string;
  base_fee: string;
  processing_fee: string;
  total_fee: string;

  // Additional
  additional_notes?: string;
  
  // Documents
  documents?: Document[];
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

interface ZoningApplicationDetailsProps {
  applicationId: number;
}

const ZoningApplicationDetails: React.FC<ZoningApplicationDetailsProps> = ({ applicationId }) => {
  const [application, setApplication] = useState<ZoningApplication | null>(null);
  const [history, setHistory] = useState<ApplicationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editedLocation, setEditedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [zoneValidation, setZoneValidation] = useState<{
    isValid: boolean;
    zoneInfo: any;
  } | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardRemarks, setForwardRemarks] = useState('');
  const [showDocumentModal, setShowDocumentModal] = useState<Document | null>(null);
  const [documentRemarks, setDocumentRemarks] = useState('');
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');

  useEffect(() => {
    loadApplication();
    loadHistory();
  }, [applicationId]);



  const loadApplication = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch application');
      }
      
      const result = await response.json();
      if (result.success) {
        setApplication(result.data);
      } else {
        throw new Error('API returned error');
      }
    } catch (error) {
      console.error('Error loading application:', error);
      setError('Failed to load application. Please try again.');
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

  const handleStartInitialReview = async () => {
    console.log('Starting initial review for application:', applicationId);
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}/start-initial-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        await loadApplication();
        await loadHistory();
        Swal.fire({
          title: 'Success',
          text: 'Initial review started',
          icon: 'success',
          timer: 2000
        });
      } else {
        const result = await response.json();
        console.error('Error response:', result);
        throw new Error(result.message || 'Failed to start initial review');
      }
    } catch (error) {
      console.error('Error starting initial review:', error);
      Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to start initial review',
        icon: 'error'
      });
    }
  };

  const handleForwardToTechnical = async () => {
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}/forward-to-technical`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remarks: forwardRemarks
        })
      });

      if (response.ok) {
        await loadApplication();
        await loadHistory();
        setShowForwardModal(false);
        setForwardRemarks('');
        Swal.fire({
          title: 'Success',
          text: 'Application forwarded to technical review',
          icon: 'success',
          timer: 2000
        });
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Failed to forward application');
      }
    } catch (error) {
      console.error('Error forwarding application:', error);
      Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to forward application',
        icon: 'error'
      });
    }
  };

  const handleReturnToZoning = async () => {
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}/return-to-zoning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remarks: 'Technical review completed'
        })
      });

      if (response.ok) {
        await loadApplication();
        await loadHistory();
        Swal.fire({
          title: 'Success',
          text: 'Application returned to zoning for final approval',
          icon: 'success',
          timer: 2000
        });
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Failed to return application');
      }
    } catch (error) {
      console.error('Error returning application:', error);
      Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to return application',
        icon: 'error'
      });
    }
  };

  const handleApproveApplication = async () => {
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        await loadApplication();
        await loadHistory();
        // Show success modal with application number
        Swal.fire({
          title: 'Application Approved!',
          html: `<p>Zoning Clearance ID: <strong>${application?.application_number}</strong></p>`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: 'Error',
          text: errorData.message || 'Failed to approve application',
          icon: 'error'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to approve application',
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

  const handleDocumentAction = async (documentId: number, action: 'verify' | 'reject') => {
    try {
      const endpoint = action === 'verify' ? 'verify' : 'reject';
      const response = await fetch(`/api/zoning/applications/${applicationId}/documents/${documentId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remarks: documentRemarks
        })
      });

      if (response.ok) {
        await loadApplication();
        await loadHistory();
        setShowDocumentModal(null);
        setDocumentRemarks('');
        Swal.fire({
          title: 'Success',
          text: `Document ${action === 'verify' ? 'verified' : 'rejected'}`,
          icon: 'success',
          timer: 2000
        });
      } else {
        const result = await response.json();
        throw new Error(result.message || `Failed to ${action} document`);
      }
    } catch (error) {
      console.error(`Error ${action}ing document:`, error);
      Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : `Failed to ${action} document`,
        icon: 'error'
      });
    }
  };

  const handleReuploadDocument = async (documentId: number) => {
    if (!reuploadFile) {
      Swal.fire({
        title: 'Error',
        text: 'Please select a file to upload',
        icon: 'error'
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', reuploadFile);

      const response = await fetch(`/api/zoning/applications/${applicationId}/documents/${documentId}/reupload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await loadApplication();
        await loadHistory();
        setShowDocumentModal(null);
        setReuploadFile(null);
        Swal.fire({
          title: 'Success',
          text: 'Document re-uploaded successfully',
          icon: 'success',
          timer: 2000
        });
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Failed to re-upload document');
      }
    } catch (error) {
      console.error('Error re-uploading document:', error);
      Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to re-upload document',
        icon: 'error'
      });
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
        throw new Error('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to download document',
        icon: 'error'
      });
    }
  };

  const handleLocationEdit = () => {
    if (application) {
      setEditedLocation({
        lat: parseFloat(application.latitude || '0'),
        lng: parseFloat(application.longitude || '0')
      });
      setIsEditingLocation(true);
    }
  };

  const handleLocationConfirm = async () => {
    if (!application || !editedLocation) return;

    try {
      const response = await fetch(`/api/zoning/applications/${application.id}/confirm-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: editedLocation.lat,
          longitude: editedLocation.lng
        })
      });

      if (response.ok) {
        setApplication({
          ...application,
          latitude: editedLocation.lat.toString(),
          longitude: editedLocation.lng.toString(),
          location_confirmed_at: new Date().toISOString()
        });
        setIsEditingLocation(false);
        setEditedLocation(null);
      } else {
        throw new Error('Failed to confirm location');
      }
    } catch (error) {
      console.error('Error confirming location:', error);
      setError('Failed to confirm location. Please try again.');
    }
  };

  const handleLocationCancel = () => {
    setIsEditingLocation(false);
    setEditedLocation(null);
  };

  const handleZoneValidation = (isValid: boolean, zoneInfo: any) => {
    setZoneValidation({ isValid, zoneInfo });
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

  const getGroupADocuments = () => {
    return application?.documents?.filter(doc => doc.document_category === 'initial_review') || [];
  };

  const getGroupBDocuments = () => {
    return application?.documents?.filter(doc => doc.document_category === 'technical_review') || [];
  };

  const canForwardToTechnical = () => {
    const groupADocs = getGroupADocuments();
    return groupADocs.length > 0 && groupADocs.every(doc => doc.verification_status === 'approved');
  };

  const canReturnToZoning = () => {
    const groupBDocs = getGroupBDocuments();
    return groupBDocs.length > 0 && groupBDocs.every(doc => doc.verification_status === 'approved');
  };

  const getCurrentDepartment = () => {
    if (!application) return 'zoning';
    switch (application.status) {
      case 'pending':
      case 'initial_review':
      case 'awaiting_approval':
      case 'approved':
      case 'rejected':
        return 'zoning';
      case 'technical_review':
        return 'technical';
      case 'requires_changes':
        return 'citizen';
      default:
        return 'zoning';
    }
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
            <Button onClick={() => router.visit('/zoning/applications')}>
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
              onClick={() => router.visit('/zoning/applications')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">{application.application_number}</h1>
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
              {getCurrentDepartment()}
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

              {/* Group A Documents - Initial Review */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Group A Documents (Initial Review)</h3>
                  </div>
                  <Badge variant="info">Zoning Office</Badge>
                </div>
                <div className="space-y-3">
                  {getGroupADocuments().map((doc) => (
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
                        {doc.verification_status === 'pending' && application.status === 'initial_review' && application.assigned_staff && (
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
                        {/* Debug info - remove after testing */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-gray-500">
                            Debug: doc_status={doc.verification_status}, app_status={application.status}, assigned_staff={application.assigned_staff ? 'yes' : 'no'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-3">
                  {getGroupBDocuments().map((doc) => (
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
                        {doc.verification_status === 'pending' && application.status === 'technical_review' && application.technical_staff && (
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
                        {/* Debug info - remove after testing */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-gray-500">
                            Debug: doc_status={doc.verification_status}, app_status={application.status}, assigned_staff={application.assigned_staff ? 'yes' : 'no'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

              {/* Location Map */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Project Location</h3>
                  </div>
                  <div className="flex space-x-2">
                    {!isEditingLocation ? (
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={handleLocationEdit}
                        icon={<MapPin className="w-4 h-4" />}
                      >
                        {application.latitude && application.longitude ? 'Adjust Location' : 'Set Location'}
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleLocationConfirm}
                        >
                          Confirm Location
                        </Button>
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={handleLocationCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {application.latitude && application.longitude ? (
                  <div className="space-y-3">
                    {isEditingLocation && editedLocation ? (
                      <LocationPicker
                        initialLat={editedLocation.lat}
                        initialLng={editedLocation.lng}
                        onLocationSelect={(lat, lng) => setEditedLocation({lat, lng})}
                        height="400px"
                        showZones={true}
                        searchPlaceholder="Search for project location..."
                      />
                    ) : (
                      <LocationViewer
                        latitude={parseFloat(application.latitude)}
                        longitude={parseFloat(application.longitude)}
                        height="400px"
                        showPopup={true}
                        showZones={true}
                        projectType={application.project_type}
                        onZoneValidation={handleZoneValidation}
                        popupContent={`Project Location: ${application.project_location} (Lat: ${parseFloat(application.latitude).toFixed(6)}, Lng: ${parseFloat(application.longitude).toFixed(6)})`}
                      />
                    )}
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Coordinates:</span>
                        <div className="flex gap-4">
                          <span>Lat: {parseFloat(application.latitude).toFixed(6)}</span>
                          <span>Lng: {parseFloat(application.longitude).toFixed(6)}</span>
                        </div>
                      </div>
                      {application.location_confirmed_at && (
                        <div className="mt-2 text-xs text-green-600">
                          ✓ Location confirmed on {new Date(application.location_confirmed_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3">No location coordinates available</p>
                    <Button
                      variant="outlined"
                      onClick={handleLocationEdit}
                      icon={<MapPin className="w-4 h-4" />}
                    >
                      Set Location
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Panel - Actions & Info */}
            <div className="space-y-6">
              {/* Workflow Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Actions</h3>
                {/* Debug info - remove after testing */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                    Debug: status={application.status}, payment_status={application.payment_status}, assigned_staff={application.assigned_staff ? 'yes' : 'no'}
                  </div>
                )}
                <div className="space-y-3">
                  {application.status === 'pending' && application.payment_status === 'confirmed' && (
                    <Button 
                      variant="primary" 
                      className="w-full" 
                      icon={<Eye className="w-4 h-4" />}
                      onClick={handleStartInitialReview}
                    >
                      Start Initial Review
                    </Button>
                  )}
                  
                  {application.status === 'pending' && application.payment_status !== 'confirmed' && (
                    <Button 
                      variant="primary" 
                      className="w-full" 
                      disabled
                      icon={<Eye className="w-4 h-4" />}
                    >
                      Start Initial Review (Payment Required)
                    </Button>
                  )}
                  
                  
                  {application.status === 'initial_review' && application.assigned_staff && !canForwardToTechnical() && (
                    <Button 
                      variant="primary" 
                      className="w-full" 
                      disabled
                      icon={<Clock className="w-4 h-4" />}
                    >
                      Pending Review
                    </Button>
                  )}
                  
                  {application.status === 'initial_review' && canForwardToTechnical() && (
                    <Button 
                      variant="primary" 
                      className="w-full" 
                      icon={<Send className="w-4 h-4" />}
                      onClick={() => setShowForwardModal(true)}
                    >
                      Pass for Technical Review
                    </Button>
                  )}
                  
                  {application.status === 'technical_review' && (
                    <Button 
                      disabled 
                      className="w-full"
                    >
                      Awaiting Technical Review
                    </Button>
                  )}
                  
                  {application.status === 'awaiting_approval' && (
                    <Button 
                      variant="primary" 
                      className="w-full" 
                      icon={<CheckCircle className="w-4 h-4" />}
                      onClick={handleApproveApplication}
                    >
                      Approve Application
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
                  {history.map((item) => (
                    <div key={item.id} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {item.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                            <strong>Document:</strong> {item.new_value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        )}
                        
                        {/* Show status change details */}
                        {item.action === 'status_changed' && item.old_value && item.new_value && (
                          <p className="text-sm text-gray-700 mt-1">
                            <strong>Status:</strong> {item.old_value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} → {item.new_value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                  ))}
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
      </div>

      {/* Forward to Technical Modal */}
      <Modal
        isOpen={showForwardModal}
        onClose={() => setShowForwardModal(false)}
        title="Forward to Technical Review"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This application will be forwarded to the Building/Subdivision office for technical review of Group B documents.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <TextArea
              value={forwardRemarks}
              onChange={(e) => setForwardRemarks(e.target.value)}
              placeholder="Add any remarks for the technical review team..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outlined"
              onClick={() => setShowForwardModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleForwardToTechnical}
            >
              Forward Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document Modal */}
      <Modal
        isOpen={!!showDocumentModal}
        onClose={() => setShowDocumentModal(null)}
        title={showDocumentModal?.document_type_display || 'Document'}
      >
        {showDocumentModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={getDocumentStatusVariant(showDocumentModal.verification_status)}>
                {getDocumentStatusIcon(showDocumentModal.verification_status)}
                <span className="ml-1">{showDocumentModal.verification_status}</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadDocument(showDocumentModal.id, showDocumentModal.file_name)}
                icon={<Download className="w-4 h-4" />}
              >
                Download
              </Button>
            </div>
            
            {/* Document Preview */}
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
            
            {showDocumentModal.verification_status === 'rejected' && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Re-upload Document</h4>
                <input
                  type="file"
                  onChange={(e) => setReuploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="primary"
                  onClick={() => handleReuploadDocument(showDocumentModal.id)}
                  disabled={!reuploadFile}
                  icon={<Upload className="w-4 h-4" />}
                >
                  Re-upload
                </Button>
              </div>
            )}
            
            {showDocumentModal.verification_status === 'pending' && 
             ((application.status === 'initial_review' && application.assigned_staff) || 
              (application.status === 'technical_review' && application.technical_staff)) && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <TextArea
                    value={documentRemarks}
                    onChange={(e) => setDocumentRemarks(e.target.value)}
                    placeholder="Add remarks for this document..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="success"
                    onClick={() => {
                      setSelectedDocumentId(showDocumentModal.id);
                      setVerifyRemarks(documentRemarks);
                      setShowVerifyModal(true);
                    }}
                    icon={<CheckCircle className="w-4 h-4" />}
                  >
                    Verify
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setSelectedDocumentId(showDocumentModal.id);
                      setRejectRemarks(documentRemarks);
                      setShowRejectModal(true);
                    }}
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
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
    </AppLayout>
  );
};

export default ZoningApplicationDetails;