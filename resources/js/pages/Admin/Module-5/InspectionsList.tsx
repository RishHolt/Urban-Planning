import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { 
  ClipboardCheck,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  Calendar,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface Inspection {
  id: number;
  inspection_number: string;
  project_id: number;
  project_title: string;
  inspection_type: string;
  status: string;
  scheduled_date: string;
  completed_date?: string;
  inspector_name: string;
  findings: string;
  recommendations: string;
  passed: boolean;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInspections, setSelectedInspections] = useState<number[]>([]);

  useEffect(() => {
    loadInspections();
  }, [searchTerm, filters, currentPage]);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.inspector !== 'all') params.append('inspector', filters.inspector);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      params.append('page', currentPage.toString());

      const response = await fetch(`/api/infrastructure/inspections?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setInspections(result.data.data || []);
        setTotalPages(result.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error loading inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportInspections = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.inspector !== 'all') params.append('inspector', filters.inspector);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await fetch(`/api/infrastructure/inspections/export?${params.toString()}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `infrastructure-inspections-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting inspections:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getResultBadge = (passed: boolean) => {
    return passed ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Passed
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Failed
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return Clock;
      case 'in_progress': return ClipboardCheck;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'cancelled': return AlertTriangle;
      default: return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const getInspectionTypeLabel = (type: string) => {
    const types = {
      initial: 'Initial Inspection',
      progress: 'Progress Inspection',
      final: 'Final Inspection',
      quality: 'Quality Control',
      safety: 'Safety Inspection',
      compliance: 'Compliance Check'
    };
    return types[type as keyof typeof types] || type;
  };

  const toggleInspectionSelection = (inspectionId: number) => {
    setSelectedInspections(prev => 
      prev.includes(inspectionId) 
        ? prev.filter(id => id !== inspectionId)
        : [...prev, inspectionId]
    );
  };

  const selectAllInspections = () => {
    setSelectedInspections(inspections.map(i => i.id));
  };

  const clearSelection = () => {
    setSelectedInspections([]);
  };

  return (
    <div className="space-y-6">
      <Head title="Infrastructure Inspections" />
      
      {/* Page Header */}
      <div className="flex-shrink-0 mb-4 pb-2">
        <div className="flex justify-between items-start">
          <Header 
            variant="secondary"
            title="Infrastructure Inspections"
            subtext="Manage and monitor all infrastructure project inspections."
          />
          
          <div className="flex items-center space-x-3">
            <Button variant="outlined" onClick={loadInspections} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outlined" onClick={exportInspections}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={() => window.location.href = '/infrastructure/inspections?action=create'}>
              <Plus className="w-4 h-4" />
              New Inspection
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search inspections..."
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
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'failed', label: 'Failed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            placeholder="Filter by status"
          />
          
          <Select
            value={filters.type}
            onChange={(value) => setFilters(prev => ({ ...prev, type: value as string }))}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'initial', label: 'Initial Inspection' },
              { value: 'progress', label: 'Progress Inspection' },
              { value: 'final', label: 'Final Inspection' },
              { value: 'quality', label: 'Quality Control' },
              { value: 'safety', label: 'Safety Inspection' },
              { value: 'compliance', label: 'Compliance Check' }
            ]}
            placeholder="Filter by type"
          />
          
          <Select
            value={filters.inspector}
            onChange={(value) => setFilters(prev => ({ ...prev, inspector: value as string }))}
            options={[
              { value: 'all', label: 'All Inspectors' },
              { value: 'john_doe', label: 'John Doe' },
              { value: 'jane_smith', label: 'Jane Smith' },
              { value: 'mike_wilson', label: 'Mike Wilson' }
            ]}
            placeholder="Filter by inspector"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            type="date"
            placeholder="Scheduled Date From"
            value={filters.date_from}
            onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
          />
          <Input
            type="date"
            placeholder="Scheduled Date To"
            value={filters.date_to}
            onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
          />
        </div>
      </Card>

      {/* Inspections Table */}
      <Card title="Inspections" subtitle={`${inspections.length} inspections found`} padding="lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Inspections Found</h3>
            <p className="text-gray-600">
              No inspections match your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedInspections.length === inspections.length && inspections.length > 0}
                      onChange={selectedInspections.length === inspections.length ? clearSelection : selectAllInspections}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inspections.map((inspection) => {
                  const StatusIcon = getStatusIcon(inspection.status);
                  return (
                    <tr key={inspection.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedInspections.includes(inspection.id)}
                          onChange={() => toggleInspectionSelection(inspection.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <StatusIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {inspection.inspection_number}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {inspection.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {inspection.project_title}
                        </div>
                        <div className="text-sm text-gray-500">
                          Project #{inspection.project_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getInspectionTypeLabel(inspection.inspection_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(inspection.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {inspection.status === 'completed' ? getResultBadge(inspection.passed) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {inspection.inspector_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(inspection.scheduled_date)}
                        </div>
                        {inspection.completed_date && (
                          <div className="text-sm text-gray-500">
                            Completed: {formatDate(inspection.completed_date)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button variant="outlined" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outlined" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <Button
            variant="outlined"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedInspections.length > 0 && (
        <Card className="mt-6" padding="lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedInspections.length} inspection(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outlined" size="sm">
                Export Selected
              </Button>
              <Button variant="outlined" size="sm">
                Bulk Update Status
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Add default layout for persistent sidebar/topnav
InspectionsList.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default InspectionsList;
