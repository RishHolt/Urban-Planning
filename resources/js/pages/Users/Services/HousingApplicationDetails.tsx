import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { TextArea } from '@/components/TextArea';
import { 
  ArrowLeft,
  FileText, 
  Upload, 
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
  Plus,
  X
} from 'lucide-react';
import Swal from '@/components/Swal';

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
  score: number | null;
  submitted_at: string;
  eligibility_checked_at?: string;
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
  
  // Eligibility & Decision
  eligibility_passed: boolean | null;
  eligibility_notes?: string;
  rejection_reason?: string;
  approval_notes?: string;
  offer_details?: string;
  
  // Documents
  documents: Document[];
  
  // Actions/History
  actions: Action[];
  
  created_at: string;
}

const HousingApplicationDetails = ({ applicationId }: { applicationId: number }) => {
  const [application, setApplication] = useState<HousingApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newDocument, setNewDocument] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

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

  const handleFileUpload = async () => {
    if (!newDocument || !documentType) {
      await Swal.fire({
        title: 'Missing Information',
        text: 'Please select a file and document type.',
        icon: 'warning'
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', newDocument);
      formData.append('document_type', documentType);

      const response = await fetch(`/api/housing/applications/${applicationId}/documents`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        await Swal.fire({
          title: 'Document Uploaded',
          text: 'Your document has been uploaded successfully.',
          icon: 'success'
        });
        setNewDocument(null);
        setDocumentType('');
        loadApplication();
      } else {
        throw new Error(result.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      await Swal.fire({
        title: 'Upload Failed',
        text: 'Failed to upload document. Please try again.',
        icon: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleWithdraw = async () => {
    const result = await Swal.fire({
      title: 'Withdraw Application',
      text: 'Are you sure you want to withdraw this application? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, withdraw',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/housing/applications/${applicationId}/withdraw`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          }
        });

        const result = await response.json();
        
        if (result.success) {
          await Swal.fire({
            title: 'Application Withdrawn',
            text: 'Your application has been withdrawn successfully.',
            icon: 'success'
          });
          loadApplication();
        } else {
          throw new Error(result.message || 'Failed to withdraw application');
        }
      } catch (error) {
        console.error('Error withdrawing application:', error);
        await Swal.fire({
          title: 'Withdrawal Failed',
          text: 'Failed to withdraw application. Please try again.',
          icon: 'error'
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
      submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
      eligibility_check: { label: 'Eligibility Check', color: 'bg-yellow-100 text-yellow-800' },
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
      case 'eligibility_check':
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
      case 'eligibility_checked':
        return <Shield className="w-4 h-4 text-yellow-600" />;
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
        <Head title="Application Details" />
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
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Not Found</h3>
              <p className="text-gray-600 mb-6">
                The requested application could not be found.
              </p>
              <Link href="/my-housing-applications">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Applications
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title={`Application ${application.application_number}`} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/my-housing-applications">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{application.application_number}</h1>
                <p className="text-gray-600">{application.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(application.status)}
              {getStatusBadge(application.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Application Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        {application.household_members.map((member, index) => (
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

                  {/* Eligibility Score */}
                  {application.score !== null && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Eligibility Score</span>
                      </h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-800">Score: {application.score}%</span>
                          <span className="text-sm text-blue-600">
                            {application.eligibility_passed ? 'Eligible' : 'Not Eligible'}
                          </span>
                        </div>
                        <Progress value={application.score} className="h-2" />
                        {application.eligibility_notes && (
                          <p className="text-sm text-blue-700 mt-2">{application.eligibility_notes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Decision Information */}
                  {(application.approval_notes || application.rejection_reason) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Decision Information</span>
                      </h3>
                      {application.approval_notes && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">Approval Notes</h4>
                          <p className="text-green-700">{application.approval_notes}</p>
                        </div>
                      )}
                      {application.rejection_reason && (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-medium text-red-800 mb-2">Rejection Reason</h4>
                          <p className="text-red-700">{application.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Documents</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.documents.length === 0 ? (
                    <p className="text-gray-500">No documents uploaded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {application.documents.map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload New Document */}
                  {application.status === 'info_requested' && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Upload Additional Document</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                          <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Select document type</option>
                            <option value="government_id">Government ID</option>
                            <option value="income_proof">Income Proof</option>
                            <option value="residency_proof">Residency Proof</option>
                            <option value="family_composition">Family Composition</option>
                            <option value="affidavit_non_ownership">Affidavit of Non-Ownership</option>
                            <option value="senior_pwd_id">Senior/PWD ID</option>
                            <option value="solo_parent_id">Solo Parent ID</option>
                            <option value="ofw_docs">OFW Documents</option>
                            <option value="land_title">Land Title</option>
                            <option value="eviction_proof">Eviction Proof</option>
                            <option value="barangay_endorsement">Barangay Endorsement</option>
                            <option value="employment_cert">Employment Certificate</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                          <input
                            type="file"
                            onChange={(e) => setNewDocument(e.target.files?.[0] || null)}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <Button 
                          onClick={handleFileUpload} 
                          disabled={!newDocument || !documentType || uploading}
                          className="w-full"
                        >
                          {uploading ? 'Uploading...' : 'Upload Document'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Application History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="w-5 h-5" />
                    <span>Application History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    {getStatusIcon(application.status)}
                    <div className="mt-2">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span>{formatDate(application.submitted_at || application.created_at)}</span>
                    </div>
                    {application.eligibility_checked_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Eligibility Checked:</span>
                        <span>{formatDate(application.eligibility_checked_at)}</span>
                      </div>
                    )}
                    {application.approved_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approved:</span>
                        <span>{formatDate(application.approved_at)}</span>
                      </div>
                    )}
                    {application.rejected_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rejected:</span>
                        <span>{formatDate(application.rejected_at)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Assignment */}
              {(application.assigned_staff || application.inspector) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Assignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {application.status === 'draft' && (
                    <Button className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Continue Application
                    </Button>
                  )}
                  
                  {['draft', 'submitted', 'eligibility_check'].includes(application.status) && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleWithdraw}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Withdraw Application
                    </Button>
                  )}
                  
                  {application.status === 'rejected' && (
                    <Button className="w-full">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      File Appeal
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HousingApplicationDetails;
