import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import CreateProjectModal from './CreateProjectModal';
import EditProjectModal from './EditProjectModal';
import { 
  Building2,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  MapPin,
  Calendar,
  DollarSign,
  HardHat,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface Project {
  id: number;
  project_number: string;
  title: string;
  project_type: 'general' | 'housing_related';
  category: string;
  status: string;
  estimated_budget: number;
  approved_budget?: number;
  progress_percentage: number;
  contractor?: {
    company_name: string;
  };
  start_date: string;
  completion_date: string;
  priority: string;
  address: string;
  barangay: string;
}

interface FilterOptions {
  status: string;
  type: string;
  category: string;
  contractor: string;
  date_from: string;
  date_to: string;
}

const ProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    type: 'all',
    category: 'all',
    contractor: 'all',
    date_from: '',
    date_to: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, [searchTerm, filters, currentPage]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.contractor !== 'all') params.append('contractor', filters.contractor);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      params.append('page', currentPage.toString());

      const response = await fetch(`/api/infrastructure/projects?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data.data || []);
        setTotalPages(result.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.contractor !== 'all') params.append('contractor', filters.contractor);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await fetch(`/api/infrastructure/projects/export?${params.toString()}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `infrastructure-projects-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting projects:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      proposal: { label: 'Proposal', color: 'bg-gray-100 text-gray-800' },
      budget_approval: { label: 'Budget Approval', color: 'bg-yellow-100 text-yellow-800' },
      bidding: { label: 'Bidding', color: 'bg-blue-100 text-blue-800' },
      construction: { label: 'Construction', color: 'bg-orange-100 text-orange-800' },
      inspection: { label: 'Inspection', color: 'bg-purple-100 text-purple-800' },
      handover: { label: 'Handover', color: 'bg-indigo-100 text-indigo-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.proposal;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
      high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
      critical: { label: 'Critical', color: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'proposal': return Clock;
      case 'budget_approval': return DollarSign;
      case 'bidding': return Building2;
      case 'construction': return HardHat;
      case 'inspection': return Eye;
      case 'handover': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getProjectTypeLabel = (type: string) => {
    return type === 'general' ? 'General' : 'Housing Related';
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      road: 'Road',
      bridge: 'Bridge',
      water: 'Water',
      sewage: 'Sewage',
      electrical: 'Electrical',
      building: 'Building',
      other: 'Other'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const canEdit = (status: string) => {
    return ['proposal', 'budget_approval'].includes(status);
  };

  const canDelete = (status: string) => {
    return ['proposal', 'cancelled'].includes(status);
  };

  const toggleProjectSelection = (projectId: number) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const selectAllProjects = () => {
    setSelectedProjects(projects.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedProjects([]);
  };

  // Modal handlers
  const handleCreateProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleCreateSuccess = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleEditSuccess = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`/api/infrastructure/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } else {
        alert('Error deleting project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  return (
    <div className="space-y-6">
      <Head title="Infrastructure Projects" />
      
      {/* Page Header */}
      <div className="flex-shrink-0 mb-4 pb-2">
        <div className="flex justify-between items-start">
          <Header 
            variant="secondary"
            title="Infrastructure Projects"
            subtext="Manage and monitor all infrastructure projects."
          />
          
          <div className="flex items-center space-x-3">
            <Button variant="outlined" onClick={loadProjects} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outlined" onClick={exportProjects}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={handleCreateProject}>
              <Plus className="w-4 h-4" />
              New Project
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
              placeholder="Search projects..."
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
              { value: 'proposal', label: 'Proposal' },
              { value: 'budget_approval', label: 'Budget Approval' },
              { value: 'bidding', label: 'Bidding' },
              { value: 'construction', label: 'Construction' },
              { value: 'inspection', label: 'Inspection' },
              { value: 'handover', label: 'Handover' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            placeholder="Filter by status"
          />
          
          <Select
            value={filters.type}
            onChange={(value) => setFilters(prev => ({ ...prev, type: value as string }))}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'general', label: 'General' },
              { value: 'housing_related', label: 'Housing Related' }
            ]}
            placeholder="Filter by type"
          />
          
          <Select
            value={filters.category}
            onChange={(value) => setFilters(prev => ({ ...prev, category: value as string }))}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'road', label: 'Road' },
              { value: 'bridge', label: 'Bridge' },
              { value: 'water', label: 'Water' },
              { value: 'sewage', label: 'Sewage' },
              { value: 'electrical', label: 'Electrical' },
              { value: 'building', label: 'Building' },
              { value: 'other', label: 'Other' }
            ]}
            placeholder="Filter by category"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            type="date"
            placeholder="Start Date From"
            value={filters.date_from}
            onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
          />
          <Input
            type="date"
            placeholder="Start Date To"
            value={filters.date_to}
            onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
          />
        </div>
      </Card>

      {/* Projects Table */}
      <Card className="mb-6" padding="lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600">
              No projects match your current filters.
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
                      checked={selectedProjects.length === projects.length && projects.length > 0}
                      onChange={selectedProjects.length === projects.length ? clearSelection : selectAllProjects}
                      className="rounded border-gray-300"
                    />
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
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contractor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => {
                  const StatusIcon = getStatusIcon(project.status);
                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => toggleProjectSelection(project.id)}
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
                              {project.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.project_number}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">{getCategoryLabel(project.category)}</span>
                              {getPriorityBadge(project.priority)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getProjectTypeLabel(project.project_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(project.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(project.estimated_budget)}
                        </div>
                        {project.approved_budget && (
                          <div className="text-sm text-gray-500">
                            Approved: {formatCurrency(project.approved_budget)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${project.progress_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{project.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {project.contractor?.company_name || 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(project.start_date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {formatDate(project.completion_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link href={`/infrastructure/projects/${project.id}`}>
                            <Button variant="outlined" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {canEdit(project.status) && (
                            <Button 
                              variant="outlined" 
                              size="sm"
                              onClick={() => handleEditProject(project)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete(project.status) && (
                            <Button 
                              variant="outlined" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
      {selectedProjects.length > 0 && (
        <Card className="mt-6" padding="lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedProjects.length} project(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outlined" size="sm">
                Export Selected
              </Button>
              <Button variant="outlined" size="sm">
                Bulk Update Status
              </Button>
              <Button variant="outlined" size="sm" className="text-red-600">
                Delete Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProject(null);
        }}
        onSuccess={handleEditSuccess}
        project={editingProject}
      />
    </div>
  );
};

// Add default layout for persistent sidebar/topnav
ProjectsList.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default ProjectsList;
