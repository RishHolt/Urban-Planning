import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import CreateOccupancyModal from './CreateOccupancyModal';
import EditOccupancyModal from './EditOccupancyModal';
import { 
  Building, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  MapPin,
  Users,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

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
  status: string;
  application?: {
    application_number: string;
  };
  created_at: string;
}

interface FilterOptions {
  status: string;
  program_type: string;
  barangay: string;
  date_from: string;
  date_to: string;
}

const OccupancyList = () => {
  const [occupancies, setOccupancies] = useState<OccupancyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    program_type: 'all',
    barangay: 'all',
    date_from: '',
    date_to: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOccupancy, setEditingOccupancy] = useState<OccupancyRecord | null>(null);

  useEffect(() => {
    fetchOccupancies();
  }, [searchTerm, filters, currentPage]);

  const fetchOccupancies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        ...filters
      });

      const response = await fetch(`/api/occupancy/records?${params}`);
      const data = await response.json();

      if (data.success) {
        setOccupancies(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error fetching occupancies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      program_type: 'all',
      barangay: 'all',
      date_from: '',
      date_to: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleCreateSuccess = () => {
    fetchOccupancies();
  };

  const handleEditSuccess = () => {
    fetchOccupancies();
  };

  const handleEditClick = (occupancy: OccupancyRecord) => {
    setEditingOccupancy(occupancy);
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      ended: { color: 'bg-gray-100 text-gray-800', label: 'Ended' },
      terminated: { color: 'bg-red-100 text-red-800', label: 'Terminated' },
      transferred: { color: 'bg-blue-100 text-blue-800', label: 'Transferred' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ended;
    
    return (
      <Badge className={config.color}>
        {config.label}
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      <Head title="Occupancy Records" />
      
      <div className="space-y-6 overflow-y-auto h-full pr-4">
        {/* Page Header */}
        <div className="flex-shrink-0 mb-4 pb-2">
          <div className="flex justify-between items-start">
            <Header 
              variant="secondary"
              title="Occupancy Records"
              subtext="Manage and track housing beneficiary occupancy records."
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
                onClick={() => setShowCreateModal(true)}
              >
                Add Occupancy
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
                  placeholder="Search by beneficiary name, unit, or address..."
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
                  onChange={(value) => handleFilterChange('status', String(value))}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'ended', label: 'Ended' },
                    { value: 'terminated', label: 'Terminated' },
                    { value: 'transferred', label: 'Transferred' }
                  ]}
                />

                <Select
                  value={filters.program_type}
                  onChange={(value) => handleFilterChange('program_type', String(value))}
                  options={[
                    { value: 'all', label: 'All Programs' },
                    { value: 'socialized_housing', label: 'Socialized Housing' },
                    { value: 'rental_subsidy', label: 'Rental Subsidy' },
                    { value: 'relocation', label: 'Relocation' }
                  ]}
                />

                <Select
                  value={filters.barangay}
                  onChange={(value) => handleFilterChange('barangay', String(value))}
                  options={[
                    { value: 'all', label: 'All Barangays' },
                    { value: 'Barangay 1', label: 'Barangay 1' },
                    { value: 'Barangay 2', label: 'Barangay 2' },
                    { value: 'Barangay 3', label: 'Barangay 3' }
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

        {/* Occupancy Records Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beneficiary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit/Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Household
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Move-in Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {occupancies.length > 0 ? (
                  occupancies.map((occupancy) => (
                    <tr key={occupancy.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {occupancy.beneficiary_name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {occupancy.contact_number}
                            </div>
                            {occupancy.email && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {occupancy.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {occupancy.unit_identifier}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {occupancy.barangay}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getProgramTypeBadge(occupancy.program_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="w-4 h-4 mr-1" />
                          {occupancy.household_size} members
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(occupancy.move_in_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(occupancy.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outlined"
                            size="sm"
                            icon={<Eye size={14} />}
                            onClick={() => window.location.href = `/occupancy/records/${occupancy.id}`}
                          >
                            View
                          </Button>
                          <Button
                            variant="outlined"
                            size="sm"
                            icon={<Edit size={14} />}
                            onClick={() => handleEditClick(occupancy)}
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
                      <Building className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No occupancy records</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new occupancy record.
                      </p>
                      <div className="mt-6">
                        <Button
                          icon={<Plus size={16} />}
                          onClick={() => setShowCreateModal(true)}
                        >
                          Add Occupancy
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
        <CreateOccupancyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />

        <EditOccupancyModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingOccupancy(null);
          }}
          onSuccess={handleEditSuccess}
          occupancy={editingOccupancy}
        />
      </div>
    </AppLayout>
  );
};

export default OccupancyList;
