import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import ScheduleInspectionModal from './ScheduleInspectionModal';
import EditInspectionModal from './EditInspectionModal';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  Plus,
  Edit,
  MapPin,
  Home
} from 'lucide-react';

interface Inspection {
  id: number;
  occupancy: {
    id: number;
    beneficiary_name: string;
    unit_identifier: string;
  };
  inspector?: {
    name: string;
  };
  inspection_date: string;
  inspection_type: string;
  status: string;
  findings?: string;
  violations?: string[];
  recommendations?: string;
  next_inspection_date?: string;
  created_at: string;
}

interface FilterOptions {
  status: string;
  type: string;
  inspector: string;
  date_from: string;
  date_to: string;
}

const InspectionsList = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    type: 'all',
    inspector: 'all',
    date_from: '',
    date_to: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);

  useEffect(() => {
    fetchInspections();
  }, [searchTerm, filters, currentPage]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        ...filters
      });

      const response = await fetch(`/api/occupancy/inspections?${params}`);
      const data = await response.json();

      if (data.success) {
        setInspections(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      inspector: 'all',
      date_from: '',
      date_to: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleScheduleSuccess = () => {
    fetchInspections();
  };

  const handleEditSuccess = () => {
    fetchInspections();
  };

  const handleEditClick = (inspection: Inspection) => {
    setEditingInspection(inspection);
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      routine: { color: 'bg-blue-100 text-blue-800', label: 'Routine' },
      complaint: { color: 'bg-red-100 text-red-800', label: 'Complaint' },
      move_in: { color: 'bg-green-100 text-green-800', label: 'Move-in' },
      move_out: { color: 'bg-gray-100 text-gray-800', label: 'Move-out' },
      compliance: { color: 'bg-purple-100 text-purple-800', label: 'Compliance' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.routine;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getViolationsCount = (violations?: string[]) => {
    return violations ? violations.length : 0;
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

  return (
    <AppLayout>
      <Head title="Occupancy Inspections" />
      
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex-shrink-0 mb-4 pb-2">
          <div className="flex justify-between items-start">
            <Header 
              variant="secondary"
              title="Occupancy Inspections"
              subtext="Schedule and manage housing occupancy inspections."
            />
            
            {/* Controls next to header */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outlined" 
                icon={<Download size={16} />}
              >
                Export
              </Button>
              <Button 
                icon={<Plus size={16} />}
                onClick={() => setShowScheduleModal(true)}
              >
                Schedule Inspection
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by beneficiary name, unit, or inspector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outlined"
              icon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'scheduled', label: 'Scheduled' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' }
                  ]}
                />

                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'routine', label: 'Routine' },
                    { value: 'complaint', label: 'Complaint' },
                    { value: 'move_in', label: 'Move-in' },
                    { value: 'move_out', label: 'Move-out' },
                    { value: 'compliance', label: 'Compliance' }
                  ]}
                />

                <Select
                  value={filters.inspector}
                  onChange={(e) => handleFilterChange('inspector', e.target.value)}
                  options={[
                    { value: 'all', label: 'All Inspectors' },
                    { value: '1', label: 'John Doe' },
                    { value: '2', label: 'Jane Smith' },
                    { value: '3', label: 'Mike Johnson' }
                  ]}
                />

                <Input
                  type="date"
                  placeholder="From Date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />

                <Input
                  type="date"
                  placeholder="To Date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Inspections Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Violations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inspections.length > 0 ? (
                  inspections.map((inspection) => (
                    <tr key={inspection.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Home className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {inspection.occupancy.beneficiary_name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {inspection.occupancy.unit_identifier}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(inspection.inspection_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(inspection.inspection_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <User className="w-4 h-4 mr-1" />
                          {inspection.inspector?.name || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(inspection.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {getViolationsCount(inspection.violations) > 0 ? (
                            <Badge className="bg-red-100 text-red-800">
                              {getViolationsCount(inspection.violations)} violations
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              No violations
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outlined"
                            size="sm"
                            icon={<Eye size={14} />}
                            onClick={() => window.location.href = `/occupancy/records/${inspection.occupancy.id}`}
                          >
                            View
                          </Button>
                          <Button
                            variant="outlined"
                            size="sm"
                            icon={<Edit size={14} />}
                            onClick={() => handleEditClick(inspection)}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No inspections found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by scheduling a new inspection.
                      </p>
                      <div className="mt-6">
                        <Button
                          icon={<Plus size={16} />}
                          onClick={() => setShowScheduleModal(true)}
                        >
                          Schedule Inspection
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outlined"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      variant="outlined"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outlined"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Modals */}
        <ScheduleInspectionModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={handleScheduleSuccess}
        />

        <EditInspectionModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingInspection(null);
          }}
          onSuccess={handleEditSuccess}
          inspection={editingInspection}
        />
      </div>
    </AppLayout>
  );
};

export default InspectionsList;
