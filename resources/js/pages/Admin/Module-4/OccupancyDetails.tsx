import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../../components/Card';
import Badge from '../../../components/Badge';
import EditOccupancyModal from './EditOccupancyModal';
import RecordMoveModal from './RecordMoveModal';
import TerminateOccupancyModal from './TerminateOccupancyModal';
import ScheduleInspectionModal from './ScheduleInspectionModal';
import { 
  ArrowLeft,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Home,
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  FileText,
  Download,
  History
} from 'lucide-react';
import Swal from 'sweetalert2';

interface OccupancyRecord {
  id: number;
  beneficiary_name: string;
  contact_number: string;
  email?: string;
  address: string;
  barangay: string;
  unit_identifier: string;
  program_type: string;
  household_size: number;
  move_in_date: string;
  move_out_date?: string;
  lease_start_date: string;
  lease_end_date?: string;
  status: string;
  termination_reason?: string;
  notes?: string;
  application?: {
    id: number;
    application_number: string;
    full_name: string;
  };
  inspections?: Array<{
    id: number;
    inspection_date: string;
    inspection_type: string;
    status: string;
    findings?: string;
    violations?: string[];
    recommendations?: string;
    inspector?: {
      name: string;
    };
  }>;
  actions?: Array<{
    id: number;
    action: string;
    old_status?: string;
    new_status?: string;
    reason?: string;
    note?: string;
    ip_address?: string;
    created_at: string;
    actor?: {
      name: string;
    };
  }>;
  created_at: string;
  updated_at: string;
}

const OccupancyDetails = ({ occupancyId }: { occupancyId: number }) => {
  const [occupancy, setOccupancy] = useState<OccupancyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoveInModal, setShowMoveInModal] = useState(false);
  const [showMoveOutModal, setShowMoveOutModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showScheduleInspectionModal, setShowScheduleInspectionModal] = useState(false);

  useEffect(() => {
    fetchOccupancyDetails();
  }, [occupancyId]);

  const fetchOccupancyDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/occupancy/records/${occupancyId}`);
      const data = await response.json();

      if (data.success) {
        setOccupancy(data.data);
      } else {
        setError(data.message || 'Failed to load occupancy details');
      }
    } catch (error) {
      console.error('Error fetching occupancy details:', error);
      setError('Failed to load occupancy details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
      ended: { color: 'bg-gray-100 text-gray-800', label: 'Ended', icon: XCircle },
      terminated: { color: 'bg-red-100 text-red-800', label: 'Terminated', icon: AlertCircle },
      transferred: { color: 'bg-blue-100 text-blue-800', label: 'Transferred', icon: Building }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ended;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getProgramTypeBadge = (programType: string) => {
    const typeConfig = {
      socialized_housing: { color: 'bg-blue-100 text-blue-800', label: 'Socialized Housing' },
      rental_subsidy: { color: 'bg-green-100 text-green-800', label: 'Rental Subsidy' },
      relocation: { color: 'bg-purple-100 text-purple-800', label: 'Relocation' }
    };

    const config = typeConfig[programType as keyof typeof typeConfig] || typeConfig.socialized_housing;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getInspectionStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return Plus;
      case 'move_in': return Home;
      case 'move_out': return XCircle;
      case 'inspection': return ClipboardCheck;
      case 'terminated': return AlertCircle;
      case 'note_added': return FileText;
      default: return Building;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    fetchOccupancyDetails();
  };

  const handleDelete = async () => {
    if (!occupancy) return;

    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the occupancy record. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (confirmed.isConfirmed) {
      try {
        const response = await fetch(`/api/occupancy/records/${occupancy.id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'Occupancy record deleted successfully'
          });
          router.visit('/occupancy/records');
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || 'Failed to delete occupancy record'
          });
        }
      } catch (error) {
        console.error('Error deleting occupancy:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete occupancy record'
        });
      }
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !occupancy) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
            <p className="mt-1 text-sm text-gray-500">{error || 'Occupancy record not found'}</p>
            <div className="mt-6">
              <Button
                variant="outlined"
                onClick={() => router.visit('/occupancy/records')}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Records
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title={`Occupancy Details - ${occupancy.beneficiary_name}`} />
      
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex-shrink-0 mb-4 pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.visit('/occupancy/records')}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <div>
                <Header 
                  variant="secondary"
                  title={occupancy.beneficiary_name}
                  subtext={`Unit: ${occupancy.unit_identifier} • ${occupancy.barangay}`}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {getStatusBadge(occupancy.status)}
              <Button 
                variant="outlined" 
                icon={<Edit size={16} />}
                onClick={() => setShowEditModal(true)}
              >
                Edit
              </Button>
              <Button 
                variant="outlined" 
                icon={<ClipboardCheck size={16} />}
                onClick={() => setShowScheduleInspectionModal(true)}
              >
                Schedule Inspection
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Beneficiary Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Beneficiary Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-sm text-gray-900">{occupancy.beneficiary_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Number</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {occupancy.contact_number}
                    </p>
                  </div>
                  {occupancy.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {occupancy.email}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Household Size</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {occupancy.household_size} members
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-900 flex items-start">
                    <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                    {occupancy.address}, {occupancy.barangay}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Occupancy Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="w-5 h-5" />
                  <span>Occupancy Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Unit Identifier</label>
                    <p className="text-sm text-gray-900">{occupancy.unit_identifier}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Program Type</label>
                    <div className="mt-1">
                      {getProgramTypeBadge(occupancy.program_type)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Move-in Date</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(occupancy.move_in_date)}
                    </p>
                  </div>
                  {occupancy.move_out_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Move-out Date</label>
                      <p className="text-sm text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(occupancy.move_out_date)}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Lease Start</label>
                    <p className="text-sm text-gray-900">{formatDate(occupancy.lease_start_date)}</p>
                  </div>
                  {occupancy.lease_end_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Lease End</label>
                      <p className="text-sm text-gray-900">{formatDate(occupancy.lease_end_date)}</p>
                    </div>
                  )}
                </div>
                {occupancy.termination_reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Termination Reason</label>
                    <p className="text-sm text-gray-900">{occupancy.termination_reason}</p>
                  </div>
                )}
                {occupancy.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-sm text-gray-900">{occupancy.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Linked Application */}
            {occupancy.application && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Linked Application</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {occupancy.application.application_number}
                      </p>
                      <p className="text-sm text-blue-700">
                        {occupancy.application.full_name}
                      </p>
                    </div>
                    <Button variant="outlined" size="sm">
                      View Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inspection History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardCheck className="w-5 h-5" />
                  <span>Inspection History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {occupancy.inspections && occupancy.inspections.length > 0 ? (
                  <div className="space-y-4">
                    {occupancy.inspections.map((inspection) => (
                      <div key={inspection.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {inspection.inspection_type.replace('_', ' ').toUpperCase()}
                            </h4>
                            {getInspectionStatusBadge(inspection.status)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(inspection.inspection_date)}
                          </span>
                        </div>
                        {inspection.inspector && (
                          <p className="text-sm text-gray-600 mb-2">
                            Inspector: {inspection.inspector.name}
                          </p>
                        )}
                        {inspection.findings && (
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Findings:</strong> {inspection.findings}
                          </p>
                        )}
                        {inspection.violations && inspection.violations.length > 0 && (
                          <div className="mb-2">
                            <strong className="text-sm text-red-700">Violations:</strong>
                            <ul className="text-sm text-red-600 list-disc list-inside ml-2">
                              {inspection.violations.map((violation, index) => (
                                <li key={index}>{violation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {inspection.recommendations && (
                          <p className="text-sm text-gray-700">
                            <strong>Recommendations:</strong> {inspection.recommendations}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No inspections recorded</p>
                    <Button 
                      className="mt-4" 
                      variant="outlined"
                      icon={<Plus size={16} />}
                    >
                      Schedule Inspection
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Action Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {occupancy.actions && occupancy.actions.length > 0 ? (
                  <div className="space-y-4">
                    {occupancy.actions.map((action) => {
                      const ActionIcon = getActionIcon(action.action);
                      return (
                        <div key={action.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <ActionIcon className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {action.action.replace('_', ' ').toUpperCase()}
                            </p>
                            {action.note && (
                              <p className="text-sm text-gray-600">{action.note}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              {action.actor?.name || 'System'} • {formatDateTime(action.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No actions recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outlined"
                  icon={<Home size={16} />}
                  onClick={() => setShowMoveInModal(true)}
                >
                  Record Move-in
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outlined"
                  icon={<XCircle size={16} />}
                  onClick={() => setShowMoveOutModal(true)}
                >
                  Record Move-out
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outlined"
                  icon={<ClipboardCheck size={16} />}
                  onClick={() => setShowScheduleInspectionModal(true)}
                >
                  Schedule Inspection
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outlined"
                  icon={<AlertTriangle size={16} />}
                  onClick={() => setShowTerminateModal(true)}
                >
                  Terminate Occupancy
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outlined"
                  icon={<Download size={16} />}
                >
                  Export Details
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="danger"
                  icon={<Trash2 size={16} />}
                  onClick={handleDelete}
                >
                  Delete Record
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity Logs Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Activity Logs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {occupancy?.actions && occupancy.actions.length > 0 ? (
                  <div className="space-y-3">
                    {occupancy.actions.map((action) => (
                      <div key={action.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <History className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {action.action.replace('_', ' ').toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(action.created_at).toLocaleString()}
                            </p>
                          </div>
                          {action.reason && (
                            <p className="text-sm text-gray-600 mt-1">{action.reason}</p>
                          )}
                          {action.note && (
                            <p className="text-sm text-gray-500 mt-1 italic">"{action.note}"</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Status: {action.old_status || 'N/A'} → {action.new_status || 'N/A'}</span>
                            {action.ip_address && <span>IP: {action.ip_address}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No activity logs found for this occupancy record.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <EditOccupancyModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleRefresh}
          occupancy={occupancy}
        />

        <RecordMoveModal
          isOpen={showMoveInModal}
          onClose={() => setShowMoveInModal(false)}
          onSuccess={handleRefresh}
          occupancy={occupancy}
          mode="move-in"
        />

        <RecordMoveModal
          isOpen={showMoveOutModal}
          onClose={() => setShowMoveOutModal(false)}
          onSuccess={handleRefresh}
          occupancy={occupancy}
          mode="move-out"
        />

        <TerminateOccupancyModal
          isOpen={showTerminateModal}
          onClose={() => setShowTerminateModal(false)}
          onSuccess={handleRefresh}
          occupancy={occupancy}
        />

        <ScheduleInspectionModal
          isOpen={showScheduleInspectionModal}
          onClose={() => setShowScheduleInspectionModal(false)}
          onSuccess={handleRefresh}
          occupancy={occupancy}
        />
      </div>
    </AppLayout>
  );
};

export default OccupancyDetails;
