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
  ChevronRight
} from 'lucide-react';
import { 
  Button, 
  Card, 
  Badge, 
  LocationViewer, 
  LocationPicker
} from '../../../components';
import AppLayout from '../../../layouts/AppLayout';

interface ZoningApplication {
  id: number;
  application_number: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_changes';
  created_at: string;
  reviewed_at?: string;
  assigned_staff?: {
    id: string;
    name: string;
    role: string;
  };
  
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
  or_date: string;
  payment_status: 'pending' | 'confirmed';

  // Fees
  application_fee: string;
  base_fee: string;
  processing_fee: string;
  total_fee: string;

  // Additional
  additional_notes?: string;
}

interface ZoningApplicationDetailsProps {
  applicationId: number;
}

const ZoningApplicationDetails: React.FC<ZoningApplicationDetailsProps> = ({ applicationId }) => {
  const [application, setApplication] = useState<ZoningApplication | null>(null);
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

  useEffect(() => {
    loadApplication();
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

  const handleRejectApplication = async () => {
    if (!rejectionRemarks.trim()) {
      alert('Please provide rejection remarks');
      return;
    }

    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          rejection_remarks: rejectionRemarks.trim(),
          reviewed_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        setApplication(prev => prev ? {
          ...prev,
          status: 'rejected',
          additional_notes: rejectionRemarks.trim(),
          reviewed_at: new Date().toISOString()
        } : null);
        setIsRejecting(false);
        setRejectionRemarks('');
        alert('Application rejected successfully');
      } else {
        throw new Error('Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application. Please try again.');
    }
  };

  const handleApproveApplication = async () => {
    try {
      const response = await fetch(`/api/zoning/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        setApplication(prev => prev ? {
          ...prev,
          status: 'approved',
          reviewed_at: new Date().toISOString()
        } : null);
        alert('Application approved successfully');
      } else {
        throw new Error('Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application. Please try again.');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'under_review': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'requires_changes': return 'warning';
      default: return 'info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'under_review': return <AlertCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'requires_changes': return <Edit className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    return status === 'confirmed' ? 'success' : 'warning';
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
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={getStatusVariant(application.status)}>
              {getStatusIcon(application.status)}
              <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
            </Badge>
            <Badge variant={getPaymentStatusVariant(application.payment_status)}>
              Payment {application.payment_status}
            </Badge>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-6">
        {/* Left Panel - Main Content */}
        <div className="lg:col-span-2 space-y-6">
            {/* Application Header */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{application.application_number}</h1>
                  <p className="text-gray-600 mt-1">{application.project_type} Project</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Submitted on {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    ₱{parseFloat(application.total_fee).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">Total Fee</p>
                </div>
              </div>
            </Card>

            {/* Applicant Information */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Applicant Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                  <p className="text-gray-900">{application.address}</p>
                </div>
                {application.business_name && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Business Name</label>
                    <p className="text-gray-900">{application.business_name}</p>
                  </div>
                )}
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
                    
                    {/* Zone Validation Summary */}
                    {zoneValidation && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            zoneValidation.isValid ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800">
                              Zone Validation: {zoneValidation.isValid ? 'Valid' : 'Invalid'}
                            </p>
                            {zoneValidation.zoneInfo && (
                              <div className="mt-1 text-xs text-blue-600">
                                <p>Zone: {zoneValidation.zoneInfo.zone?.name}</p>
                                <p>Zone Type: {zoneValidation.zoneInfo.zoneType?.name}</p>
                                <p>Project Type: {application.project_type}</p>
                              </div>
                            )}
                          </div>
                        </div>
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

            {/* Land Ownership */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Home className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Land Ownership</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Ownership Type</label>
                  <p className="text-gray-900">{application.land_ownership}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Name of Owner</label>
                  <p className="text-gray-900">{application.name_of_owner}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">TCT Number</label>
                  <p className="text-gray-900">{application.tct_no}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Tax Declaration No.</label>
                  <p className="text-gray-900">{application.tax_declaration_no}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Lot/Block/Survey No.</label>
                  <p className="text-gray-900">{application.lot_block_survey_no}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Barangay Clearance ID</label>
                  <p className="text-gray-900">{application.barangay_clearance_id}</p>
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">OR Reference Number</label>
                  <p className="text-gray-900">{application.or_reference_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">OR Date</label>
                  <p className="text-gray-900">{new Date(application.or_date).toLocaleDateString()}</p>
                </div>
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Fee Breakdown</h4>
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
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Actions & Info */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  className="w-full" 
                  icon={<CheckCircle className="w-4 h-4" />}
                  onClick={handleApproveApplication}
                  disabled={application?.status === 'approved' || application?.status === 'rejected'}
                >
                  Approve Application
                </Button>
                
                <Button 
                  variant="outlined" 
                  className="w-full" 
                  icon={<XCircle className="w-4 h-4" />}
                  onClick={() => setIsRejecting(true)}
                  disabled={application?.status === 'approved' || application?.status === 'rejected'}
                >
                  Reject Application
                </Button>
                
                <Button variant="outlined" className="w-full" icon={<Edit className="w-4 h-4" />}>
                  Request Changes
                </Button>
                <Button variant="outlined" className="w-full" icon={<User className="w-4 h-4" />}>
                  Assign Staff
                </Button>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                    <p className="text-xs text-gray-500">{new Date(application.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {application.reviewed_at && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Application Reviewed</p>
                      <p className="text-xs text-gray-500">{new Date(application.reviewed_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {application.assigned_staff && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Assigned to Staff</p>
                      <p className="text-xs text-gray-500">{application.assigned_staff.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Documents */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Proof of Ownership</span>
                  <Button variant="ghost" size="sm" icon={<Download className="w-3 h-3" />}>
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Site Development Plan</span>
                  <Button variant="ghost" size="sm" icon={<Download className="w-3 h-3" />}>
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Vicinity Map</span>
                  <Button variant="ghost" size="sm" icon={<Download className="w-3 h-3" />}>
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Building Plan</span>
                  <Button variant="ghost" size="sm" icon={<Download className="w-3 h-3" />}>
                    Download
                  </Button>
                </div>
              </div>
            </Card>

            {/* Additional Notes */}
            {application.additional_notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                <p className="text-gray-700 text-sm">{application.additional_notes}</p>
              </Card>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {isRejecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Application</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide detailed remarks for rejecting this application.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Remarks *
              </label>
              <textarea
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
                placeholder="Enter detailed reason for rejection..."
                required
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outlined"
                onClick={() => {
                  setIsRejecting(false);
                  setRejectionRemarks('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRejectApplication}
                disabled={!rejectionRemarks.trim()}
              >
                Reject Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ZoningApplicationDetails;
