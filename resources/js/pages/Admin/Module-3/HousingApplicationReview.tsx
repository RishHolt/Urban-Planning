import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Input from '../../../components/Input';
// Label component not available, using HTML label instead
import TextArea from '../../../components/TextArea';
import Select from '../../../components/Select';
import { 
  ArrowLeft,
  FileText, 
  Download,
  Eye,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Building,
  Shield,
  History,
  Upload,
  Send,
  Flag,
  Settings,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Calendar as CalendarIcon,
  Camera,
  FileImage,
  MessageSquare
} from 'lucide-react';
import Swal from 'sweetalert2';

interface HouseholdMember {
  id: number;
  name: string;
  relation: string;
  birthdate: string;
  id_type: string;
  id_number: string;
}

interface Document {
  id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  verification_status: string;
  verified_by?: {
    name: string;
  };
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
}

interface Inspection {
  id: number;
  scheduled_date: string;
  inspection_date?: string;
  status: string;
  report?: string;
  photos?: string[];
  notes?: string;
  dwelling_conditions?: any;
  occupancy_verified?: boolean;
  inspector: {
    name: string;
  };
}

interface Action {
  id: number;
  action: string;
  old_status?: string;
  new_status?: string;
  reason?: string;
  note?: string;
  actor: {
    name: string;
  };
  created_at: string;
}

interface HousingApplication {
  id: number;
  application_number: string;
  status: string;
  submitted_at: string;
  approved_at?: string;
  rejected_at?: string;
  
  // Personal Information
  full_name: string;
  birthdate: string;
  gender: string;
  civil_status: string;
  national_id: string;
  mobile: string;
  email: string;
  preferred_contact: string;
  
  // Household
  household_size: number;
  household_members: HouseholdMember[];
  
  // Address & Location
  current_address: string;
  latitude: number | null;
  longitude: number | null;
  years_at_address: number;
  barangay: string;
  
  // Socioeconomic
  employment_status: string;
  employer_name: string;
  monthly_income: number;
  income_type: string;
  other_income_sources: string;
  total_household_income: number;
  
  // Current Housing
  housing_type: string;
  rooms: number | null;
  floor_area: number | null;
  occupancy_density: number | null;
  
  // Assistance Requested
  program_type: string;
  requested_units: number;
  preferred_project: string;
  
  // Staff Assignment
  assigned_staff?: {
    name: string;
  };
  inspector?: {
    name: string;
  };
  
  // Decision
  rejection_reason?: string;
  approval_notes?: string;
  offer_details?: string;
  
  // Documents
  documents: Document[];
  
  // Inspections
  inspections: Inspection[];
  
  // Actions/History
  actions: Action[];
  
  created_at: string;
}

const HousingApplicationReview = ({ applicationId }: { applicationId: number }) => {
  const [application, setApplication] = useState<HousingApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Action states
  const [requestInfoMessage, setRequestInfoMessage] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectorId, setInspectorId] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Check if all documents are verified
  const allDocumentsVerified = application?.documents?.every(doc => doc.verification_status === 'verified') || false;

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/housing/applications/${applicationId}`);
      const result = await response.json();
      
      if (result.success) {
        setApplication(result.data);
      }
    } catch (error) {
      console.error('Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, data?: any) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/housing/applications/${applicationId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        await Swal.fire({
          title: 'Success',
          text: result.message || 'Action completed successfully',
          icon: 'success'
        });
        loadApplication();
      } else {
        throw new Error(result.message || 'Action failed');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      await Swal.fire({
        title: 'Error',
        text: `Failed to ${action}. Please try again.`,
        icon: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };


  const handleRequestInfo = () => {
    if (!requestInfoMessage.trim()) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please enter a message for the applicant.',
        icon: 'warning'
      });
      return;
    }
    handleAction('request-info', {
      message: requestInfoMessage,
      required_documents: requiredDocuments
    });
  };

  const handleScheduleInspection = () => {
    if (!inspectionDate || !inspectorId) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please select inspection date and inspector.',
        icon: 'warning'
      });
      return;
    }
    handleAction('schedule-inspection', {
      scheduled_date: inspectionDate,
      inspector_id: inspectorId
    });
  };

  const handleApprove = () => {
    if (!approvalNotes.trim()) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please enter approval notes.',
        icon: 'warning'
      });
      return;
    }
    handleAction('approve', {
      approval_notes: approvalNotes,
      offer_details: ''
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please enter rejection reason.',
        icon: 'warning'
      });
      return;
    }
    handleAction('reject', {
      rejection_reason: rejectionReason
    });
  };

  const handleVerifyDocument = (documentId: number, status: 'verified' | 'rejected', reason?: string) => {
    handleAction('verify-document', {
      document_id: documentId,
      verification_status: status,
      rejection_reason: reason
    });
  };

  const handleStartReview = () => {
    handleAction('start-review', {});
  };

  const handleApproveApplication = () => {
    handleAction('approve', {
      approval_notes: 'Application approved after document verification'
    });
  };

  const handleDownloadDocument = async (documentId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/housing/documents/${documentId}/download`);
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
      await Swal.fire({
        title: 'Error',
        text: 'Failed to download document',
        icon: 'error'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
      submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
      document_verification: { label: 'Document Verification', color: 'bg-orange-100 text-orange-800' },
      field_inspection: { label: 'Field Inspection', color: 'bg-purple-100 text-purple-800' },
      final_review: { label: 'Final Review', color: 'bg-indigo-100 text-indigo-800' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      info_requested: { label: 'Info Requested', color: 'bg-amber-100 text-amber-800' },
      on_hold: { label: 'On Hold', color: 'bg-slate-100 text-slate-800' },
      appeal: { label: 'Appeal', color: 'bg-pink-100 text-pink-800' },
      withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
      offer_issued: { label: 'Offer Issued', color: 'bg-emerald-100 text-emerald-800' },
      beneficiary_assigned: { label: 'Beneficiary Assigned', color: 'bg-teal-100 text-teal-800' },
      closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'draft':
        return <FileText className="w-5 h-5 text-gray-600" />;
      case 'submitted':
      case 'document_verification':
      case 'field_inspection':
      case 'final_review':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'info_requested':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    const types = {
      government_id: 'Government ID',
      income_proof: 'Income Proof',
      residency_proof: 'Residency Proof',
      family_composition: 'Family Composition',
      affidavit_non_ownership: 'Affidavit of Non-Ownership',
      senior_pwd_id: 'Senior/PWD ID',
      solo_parent_id: 'Solo Parent ID',
      ofw_docs: 'OFW Documents',
      land_title: 'Land Title',
      eviction_proof: 'Eviction Proof',
      barangay_endorsement: 'Barangay Endorsement',
      employment_cert: 'Employment Certificate'
    };
    return types[type as keyof typeof types] || type;
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'submitted':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'document_verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'document_rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'inspection_scheduled':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'inspection_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'info_requested':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'withdrawn':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Head title="Application Review" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!application) {
    return (
      <AppLayout>
        <Head title="Application Not Found" />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Not Found</h3>
            <p className="text-gray-600 mb-6">
              The requested application could not be found.
            </p>
            <Link href="/housing/applications">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Applications
              </Button>
            </Link>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title={`Review ${application.application_number}`} />
      
      <div className="h-full flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="flex-shrink-0 flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.visit('/housing/applications')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">{application.application_number}</h1>
              <p className="text-gray-600">{application.full_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={getStatusBadge(application.status).props.className.includes('green') ? 'success' : 'warning'}>
              {getStatusIcon(application.status)}
              <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
            </Badge>
            <Badge variant="info">
              <User className="w-4 h-4 mr-1" />
              Housing Office
            </Badge>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-6">
            {/* Left Panel - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Information */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Application Information</h3>
                </div>
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Personal Information</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900">{application.full_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                        <p className="text-gray-900">{formatDate(application.birthdate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Gender</label>
                        <p className="text-gray-900 capitalize">{application.gender}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Civil Status</label>
                        <p className="text-gray-900 capitalize">{application.civil_status.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Mobile</label>
                        <p className="text-gray-900 flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{application.mobile || 'Not provided'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900 flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{application.email || 'Not provided'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Household Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Household Information</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Household Size</label>
                        <p className="text-gray-900">{application.household_size} members</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Total Income</label>
                        <p className="text-gray-900">{formatCurrency(application.total_household_income)}</p>
                      </div>
                    </div>
                    
                    {application.household_members.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Household Members</h4>
                        {application.household_members.map((member) => (
                          <div key={member.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Name:</span>
                                <p className="text-gray-900">{member.name}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">Relation:</span>
                                <p className="text-gray-900 capitalize">{member.relation.replace('_', ' ')}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">Birth Date:</span>
                                <p className="text-gray-900">{formatDate(member.birthdate)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Address Information</span>
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Current Address</label>
                        <p className="text-gray-900">{application.current_address}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Barangay</label>
                          <p className="text-gray-900">{application.barangay}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Years at Address</label>
                          <p className="text-gray-900">{application.years_at_address} years</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Socioeconomic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Socioeconomic Information</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Employment Status</label>
                        <p className="text-gray-900 capitalize">{application.employment_status.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Employer</label>
                        <p className="text-gray-900">{application.employer_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Monthly Income</label>
                        <p className="text-gray-900">{formatCurrency(application.monthly_income)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Income Type</label>
                        <p className="text-gray-900 capitalize">{application.income_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    {application.other_income_sources && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700">Other Income Sources</label>
                        <p className="text-gray-900">{application.other_income_sources}</p>
                      </div>
                    )}
                  </div>

                  {/* Current Housing */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Home className="w-5 h-5" />
                      <span>Current Housing</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Housing Type</label>
                        <p className="text-gray-900 capitalize">{application.housing_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Program Type</label>
                        <p className="text-gray-900 capitalize">{application.program_type.replace('_', ' ')}</p>
                      </div>
                      {application.rooms && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Number of Rooms</label>
                          <p className="text-gray-900">{application.rooms}</p>
                        </div>
                      )}
                      {application.floor_area && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Floor Area</label>
                          <p className="text-gray-900">{application.floor_area} sqm</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </Card>

              {/* Documents */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                </div>
                  {application.documents.length === 0 ? (
                    <p className="text-gray-500">No documents uploaded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {application.documents.map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{getDocumentTypeLabel(document.document_type)}</p>
                              <p className="text-sm text-gray-500">{document.file_name}</p>
                              {document.verified_at && (
                                <p className="text-xs text-gray-400">
                                  Verified by {document.verified_by?.name} on {formatDate(document.verified_at)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getVerificationStatusColor(document.verification_status)}>
                              {document.verification_status}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(`/api/housing/documents/${document.id}/view`, '_blank')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadDocument(document.id, document.file_name)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {document.verification_status === 'pending' && application.status === 'document_verification' && application.assigned_staff && (
                              <div className="flex space-x-1">
                                <Button 
                                  variant="success"
                                  size="sm" 
                                  onClick={() => {
                                    const remarks = prompt('Verification remarks (optional):');
                                    handleVerifyDocument(document.id, 'verified', remarks || undefined);
                                  }}
                                  disabled={actionLoading}
                                  icon={<CheckCircle className="w-4 h-4" />}
                                >
                                  Verify
                                </Button>
                                <Button 
                                  variant="danger"
                                  size="sm" 
                                  onClick={() => {
                                    const reason = prompt('Rejection reason:');
                                    if (reason) handleVerifyDocument(document.id, 'rejected', reason);
                                  }}
                                  disabled={actionLoading}
                                  icon={<XCircle className="w-4 h-4" />}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </Card>

              {/* Inspections */}
              {application.inspections.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <Camera className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Field Inspections</h3>
                  </div>
                    <div className="space-y-4">
                      {application.inspections.map((inspection) => (
                        <div key={inspection.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                Scheduled: {formatDate(inspection.scheduled_date)}
                              </span>
                            </div>
                            <Badge className={getVerificationStatusColor(inspection.status)}>
                              {inspection.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Inspector: {inspection.inspector.name}</p>
                            {inspection.inspection_date && (
                              <p>Completed: {formatDate(inspection.inspection_date)}</p>
                            )}
                          </div>
                          {inspection.report && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Report:</p>
                              <p className="text-sm text-gray-600">{inspection.report}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                </Card>
              )}

              {/* Application History */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <History className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Application History</h3>
                </div>
                  {application.actions.length === 0 ? (
                    <p className="text-gray-500">No history available.</p>
                  ) : (
                    <div className="space-y-4">
                      {application.actions.map((action) => (
                        <div key={action.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getActionIcon(action.action)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">
                                {action.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {formatDate(action.created_at)}
                              </span>
                            </div>
                            {action.note && (
                              <p className="text-sm text-gray-600 mt-1">{action.note}</p>
                            )}
                            {action.actor && (
                              <p className="text-xs text-gray-500 mt-1">
                                by {action.actor.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </Card>
            </div>

            {/* Right Panel - Actions & Info */}
            <div className="space-y-6">
              {/* Workflow Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Actions</h3>
                <div className="space-y-3">
                  {application.status === 'submitted' && (
                    <Button 
                      variant="primary" 
                      className="w-full" 
                      icon={<FileText className="w-4 h-4" />}
                      onClick={handleStartReview}
                      disabled={actionLoading}
                    >
                      Start Review
                    </Button>
                  )}
                  
                  {application.status === 'document_verification' && (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 p-3 bg-yellow-50 rounded-lg">
                        <p className="font-medium">Document Verification in Progress</p>
                        <p>All documents must be verified before approval.</p>
                      </div>
                      {allDocumentsVerified && (
                        <Button 
                          variant="primary" 
                          className="w-full" 
                          icon={<CheckCircle className="w-4 h-4" />}
                          onClick={handleApproveApplication}
                          disabled={actionLoading}
                        >
                          Approve Application
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {application.status === 'field_inspection' && (
                    <Button 
                      variant="primary" 
                      className="w-full" 
                      icon={<Calendar className="w-4 h-4" />}
                      disabled
                    >
                      Awaiting Inspection Report
                    </Button>
                  )}
                  
                  {application.status === 'final_review' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="approvalNotes" className="block text-sm font-medium text-gray-700">Approval Notes</label>
                        <TextArea
                          id="approvalNotes"
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          placeholder="Enter approval notes..."
                          rows={3}
                        />
                        <Button 
                          variant="primary" 
                          className="w-full" 
                          icon={<CheckCircle className="w-4 h-4" />}
                          onClick={handleApprove}
                          disabled={actionLoading || !approvalNotes.trim()}
                        >
                          Approve Application
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                        <TextArea
                          id="rejectionReason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter rejection reason..."
                          rows={3}
                        />
                        <Button 
                          variant="danger" 
                          className="w-full" 
                          icon={<XCircle className="w-4 h-4" />}
                          onClick={handleReject}
                          disabled={actionLoading || !rejectionReason.trim()}
                        >
                          Reject Application
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {application.status === 'approved' && (
                    <Button 
                      variant="success" 
                      className="w-full" 
                      icon={<CheckCircle className="w-4 h-4" />}
                      disabled
                    >
                      Application Approved
                    </Button>
                  )}
                  
                  {application.status === 'rejected' && (
                    <Button 
                      variant="danger" 
                      className="w-full" 
                      icon={<XCircle className="w-4 h-4" />}
                      disabled
                    >
                      Application Rejected
                    </Button>
                  )}
                </div>
              </Card>

              {/* Application Status Timeline */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Submitted</div>
                      <div className="text-sm text-gray-600">
                        {formatDate(application.submitted_at || application.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  
                  {application.approved_at && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Approved</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(application.approved_at)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {application.rejected_at && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Rejected</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(application.rejected_at)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Staff Assignment */}
              {(application.assigned_staff || application.inspector) && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Assignment</h3>
                  <div className="space-y-3">
                    {application.assigned_staff && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Assigned Staff</label>
                        <p className="text-gray-900">{application.assigned_staff.name}</p>
                      </div>
                    )}
                    {application.inspector && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Inspector</label>
                        <p className="text-gray-900">{application.inspector.name}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HousingApplicationReview;
