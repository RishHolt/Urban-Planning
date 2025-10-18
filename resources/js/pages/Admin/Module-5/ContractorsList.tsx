import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import CreateContractorModal from './CreateContractorModal';
import EditContractorModal from './EditContractorModal';
import { 
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Star,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Contractor {
  id: number;
  company_name: string;
  contact_person: string;
  contact_number: string;
  email: string;
  address: string;
  business_permit_number: string;
  tin_number: string;
  rating: number;
  total_projects_completed: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface FilterOptions {
  status: string;
  rating: string;
}

const ContractorsList = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    rating: 'all'
  });
  const [selectedContractors, setSelectedContractors] = useState<number[]>([]);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);

  useEffect(() => {
    loadContractors();
  }, [searchTerm, filters]);

  const loadContractors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.rating !== 'all') params.append('rating', filters.rating);

      const response = await fetch(`/api/infrastructure/contractors?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setContractors(result.data || []);
      }
    } catch (error) {
      console.error('Error loading contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${
              i < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleContractorSelection = (contractorId: number) => {
    setSelectedContractors(prev => 
      prev.includes(contractorId) 
        ? prev.filter(id => id !== contractorId)
        : [...prev, contractorId]
    );
  };

  const selectAllContractors = () => {
    setSelectedContractors(contractors.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedContractors([]);
  };

  const canDelete = (contractor: Contractor) => {
    return contractor.total_projects_completed === 0;
  };

  // Modal handlers
  const handleCreateContractor = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditContractor = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setIsEditModalOpen(true);
  };

  const handleCreateSuccess = (newContractor: Contractor) => {
    setContractors(prev => [newContractor, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleEditSuccess = (updatedContractor: Contractor) => {
    setContractors(prev => prev.map(c => c.id === updatedContractor.id ? updatedContractor : c));
    setIsEditModalOpen(false);
    setEditingContractor(null);
  };

  const handleDeleteContractor = async (contractorId: number) => {
    if (!confirm('Are you sure you want to delete this contractor?')) return;
    
    try {
      const response = await fetch(`/api/infrastructure/contractors/${contractorId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setContractors(prev => prev.filter(c => c.id !== contractorId));
      } else {
        alert('Error deleting contractor');
      }
    } catch (error) {
      console.error('Error deleting contractor:', error);
      alert('Error deleting contractor');
    }
  };

  return (
    <div className="space-y-6">
      <Head title="Contractors" />
      
      {/* Page Header */}
      <div className="flex-shrink-0 mb-4 pb-2">
        <div className="flex justify-between items-start">
          <Header 
            variant="secondary"
            title="Contractors"
            subtext="Manage contractor information and performance."
          />
          
          <div className="flex items-center space-x-3">
            <Button variant="outlined" onClick={loadContractors} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreateContractor}>
              <Plus className="w-4 h-4" />
              Add Contractor
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search contractors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value as string }))}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            placeholder="Filter by status"
          />
          
          <Select
            value={filters.rating}
            onChange={(value) => setFilters(prev => ({ ...prev, rating: value as string }))}
            options={[
              { value: 'all', label: 'All Ratings' },
              { value: '5', label: '5 Stars' },
              { value: '4', label: '4+ Stars' },
              { value: '3', label: '3+ Stars' },
              { value: '2', label: '2+ Stars' },
              { value: '1', label: '1+ Stars' }
            ]}
            placeholder="Filter by rating"
          />
        </div>
      </Card>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : contractors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contractors Found</h3>
            <p className="text-gray-600">
              No contractors match your current filters.
            </p>
          </div>
        ) : (
          contractors.map((contractor) => (
            <Card key={contractor.id} className="relative">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedContractors.includes(contractor.id)}
                      onChange={() => toggleContractorSelection(contractor.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(contractor.status)}
                    <div className="flex items-center space-x-1">
                      <Button variant="outlined" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="sm"
                        onClick={() => handleEditContractor(contractor)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {canDelete(contractor) && (
                        <Button 
                          variant="outlined" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteContractor(contractor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {contractor.company_name}
                  </h3>
                  <p className="text-sm text-gray-600">{contractor.contact_person}</p>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{contractor.contact_number}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{contractor.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{contractor.address}</span>
                  </div>
                </div>

                {/* Performance */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Rating</p>
                    {renderStars(contractor.rating)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Projects Completed</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {contractor.total_projects_completed}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Business Permit</p>
                      <p className="text-sm text-gray-900">{contractor.business_permit_number}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Performance</span>
                    <div className="flex items-center space-x-1">
                      {contractor.rating >= 4 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : contractor.rating >= 3 ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`font-medium ${
                        contractor.rating >= 4 ? 'text-green-600' : 
                        contractor.rating >= 3 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {contractor.rating >= 4 ? 'Excellent' : 
                         contractor.rating >= 3 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Bulk Actions */}
      {selectedContractors.length > 0 && (
        <Card className="mt-6" padding="lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedContractors.length} contractor(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outlined" size="sm">
                Export Selected
              </Button>
              <Button variant="outlined" size="sm">
                Activate Selected
              </Button>
              <Button variant="outlined" size="sm">
                Deactivate Selected
              </Button>
              <Button variant="outlined" size="sm" className="text-red-600">
                Delete Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contractors</p>
              <p className="text-2xl font-bold text-gray-900">{contractors.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {contractors.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Rated (4+)</p>
              <p className="text-2xl font-bold text-gray-900">
                {contractors.filter(c => c.rating >= 4).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {contractors.reduce((sum, c) => sum + c.total_projects_completed, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <CreateContractorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditContractorModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingContractor(null);
        }}
        onSuccess={handleEditSuccess}
        contractor={editingContractor}
      />
    </div>
  );
};

// Add default layout for persistent sidebar/topnav
ContractorsList.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default ContractorsList;
