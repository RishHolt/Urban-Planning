import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Download,
  MoreVertical,
  Calendar,
  User,
  MapPin,
  DollarSign,
  FileText,
  Building2
} from 'lucide-react';
import { Button, Card, Badge, Input, Select } from '../../../components';
import AppLayout from '../../../layouts/AppLayout';
import Swal from 'sweetalert2';

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

const BuildingReviewList: React.FC = () => {
  const [applications, setApplications] = useState<ZoningApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ZoningApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('technical_review');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch applications from API
  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      // Handle special filter cases
      if (statusFilter === 'unpaid') {
        params.append('payment_status', 'pending');
      } else if (statusFilter === 'pending_document_review') {
        params.append('status', 'technical_review');
        params.append('has_pending_documents', 'true');
      } else if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (paymentFilter !== 'all') params.append('payment_status', paymentFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/zoning/applications?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
        setFilteredApplications(result.data);
      } else {
        throw new Error('API returned error');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications. Please try again.');
      // Fallback to empty array on error
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // Refetch data when filters change
  useEffect(() => {
    loadApplications();
  }, [searchQuery, statusFilter, paymentFilter]);

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
      case 'initial_review': return <AlertCircle className="w-4 h-4" />;
      case 'technical_review': return <Building2 className="w-4 h-4" />;
      case 'awaiting_approval': return <CheckCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'requires_changes': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    return status === 'confirmed' ? 'success' : 'warning';
  };

  const handleViewDetails = (application: ZoningApplication) => {
    router.visit(`/building/review/${application.id}`);
  };

  const handleStatusUpdate = (applicationId: number, newStatus: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus as any, reviewed_at: new Date().toISOString() }
          : app
      )
    );
  };

  const columns = [
    {
      key: 'application_number',
      label: 'Application #',
      render: (value: any) => (
        <span className="font-medium text-blue-600">{value}</span>
      )
    },
    {
      key: 'first_name', // Use a key that exists in the interface
      label: 'Applicant',
      render: (value: any, app: ZoningApplication) => (
        <div>
          <div className="font-medium">{app.first_name} {app.last_name}</div>
          <div className="text-sm text-gray-500">{app.type_of_applicant}</div>
        </div>
      )
    },
    {
      key: 'project_type',
      label: 'Project Type',
      render: (value: any) => (
        <Badge variant="default" size="sm">{value}</Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any) => (
        <Badge 
          variant={getStatusVariant(value) as any}
          size="sm"
          className="flex items-center space-x-1"
        >
          {getStatusIcon(value)}
          <span className="capitalize">{value.replace('_', ' ')}</span>
        </Badge>
      )
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (value: any) => (
        <Badge 
          variant={getPaymentStatusVariant(value) as any}
          size="sm"
        >
          {value === 'confirmed' ? 'Confirmed' : 'Pending'}
        </Badge>
      )
    },
    {
      key: 'total_fee',
      label: 'Total Fee',
      render: (value: string | number) => (
        <span className="font-medium">₱{parseFloat(value.toString()).toFixed(2)}</span>
      )
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (value: any) => (
        <div className="text-sm">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-gray-500">{new Date(value).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      key: 'technical_staff',
      label: 'Assigned To',
      render: (staff: any) => (
        staff ? (
          <div className="text-sm">
            <div className="font-medium">{staff.name}</div>
            <div className="text-gray-500">{staff.role}</div>
          </div>
        ) : (
          <span className="text-gray-400">Unassigned</span>
        )
      )
    },
    {
      key: 'id', // Use a key that exists in the interface
      label: 'Actions',
      render: (value: number, app: ZoningApplication) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(app)}
            icon={<Eye className="w-4 h-4" />}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<MoreVertical className="w-4 h-4" />}
          >
            More
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <AppLayout>
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as string)}
              options={[
                { value: 'technical_review', label: 'Technical Review' },
                { value: 'all', label: 'All Status' },
                { value: 'unpaid', label: 'Unpaid' },
                { value: 'pending_document_review', label: 'Pending Document Review' },
                { value: 'pending', label: 'Pending' },
                { value: 'initial_review', label: 'Initial Review' },
                { value: 'awaiting_approval', label: 'Awaiting Approval' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'requires_changes', label: 'Requires Changes' }
              ]}
            />
            <Select
              value={paymentFilter}
              onChange={(value) => setPaymentFilter(value as string)}
              options={[
                { value: 'all', label: 'All Payments' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'pending', label: 'Pending' }
              ]}
            />
            <Button 
              variant="outlined" 
              icon={<Download className="w-4 h-4" />}
              onClick={() => loadApplications()}
            >
              Refresh
            </Button>
            <Button variant="outlined" icon={<Download className="w-4 h-4" />}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading applications</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <Button 
              variant="outlined" 
              size="sm" 
              onClick={() => loadApplications()}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Applications Table */}
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? 
                        column.render(application[column.key as keyof ZoningApplication] as any, application) : 
                        String(application[column.key as keyof ZoningApplication] || '')
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredApplications.length === 0 && !error && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </Card>

      </div>
    </AppLayout>
  );
};

export default BuildingReviewList;
