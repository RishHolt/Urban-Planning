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
  Building2,
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  MapPin,
  HardHat,
  CheckCircle,
  Clock,
  AlertTriangle,
  Map,
  RefreshCw,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface PublicProject {
  id: number;
  project_number: string;
  title: string;
  description: string;
  project_type: 'general' | 'housing_related';
  category: string;
  status: string;
  address: string;
  barangay: string;
  start_date: string;
  completion_date: string;
  approved_budget: number;
  progress_percentage: number;
  priority: string;
  public_announcements: PublicAnnouncement[];
}

interface PublicAnnouncement {
  id: number;
  title: string;
  description: string;
  announcement_type: 'info' | 'warning' | 'closure' | 'delay' | 'update';
  published_date: string;
  effective_date?: string;
  end_date?: string;
}

const PublicProjectsList = () => {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    category: 'all',
    barangay: 'all',
    date_from: '',
    date_to: ''
  });
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadProjects();
  }, [searchTerm, filters, sortBy]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.barangay !== 'all') params.append('barangay', filters.barangay);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (sortBy !== 'latest') params.append('sort', sortBy);

      const response = await fetch(`/api/public/infrastructure/projects?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      budget_approval: { label: 'Planning', color: 'bg-blue-100 text-blue-800' },
      bidding: { label: 'Bidding Process', color: 'bg-yellow-100 text-yellow-800' },
      construction: { label: 'Under Construction', color: 'bg-orange-100 text-orange-800' },
      inspection: { label: 'Quality Inspection', color: 'bg-purple-100 text-purple-800' },
      handover: { label: 'Nearly Complete', color: 'bg-indigo-100 text-indigo-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.budget_approval;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'budget_approval': return Clock;
      case 'bidding': return Building2;
      case 'construction': return HardHat;
      case 'inspection': return Eye;
      case 'handover': return CheckCircle;
      case 'completed': return CheckCircle;
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getProjectTypeLabel = (type: string) => {
    return type === 'general' ? 'General Infrastructure' : 'Housing Related';
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

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'info': return Clock;
      case 'warning': return AlertTriangle;
      case 'closure': return AlertTriangle;
      case 'delay': return Clock;
      case 'update': return CheckCircle;
      default: return Clock;
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'closure': return 'text-red-600';
      case 'delay': return 'text-orange-600';
      case 'update': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'budget_high', label: 'Highest Budget' },
    { value: 'budget_low', label: 'Lowest Budget' },
    { value: 'status', label: 'By Status' },
    { value: 'location', label: 'By Location' }
  ];

  return (
    <div className="space-y-6">
      <Head title="Infrastructure Projects" />
      
      {/* Page Header */}
      <div className="flex-shrink-0 mb-4 pb-2">
        <div className="flex justify-between items-start">
          <Header 
            variant="secondary"
            title="Infrastructure Projects"
            subtext="View all ongoing and completed infrastructure projects in your area."
          />
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outlined" 
              onClick={() => window.location.href = '/infrastructure/public'}
            >
              <Map className="w-4 h-4" />
              Map View
            </Button>
            <Button variant="outlined" onClick={loadProjects} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="mb-6" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
              { value: 'budget_approval', label: 'Planning' },
              { value: 'bidding', label: 'Bidding Process' },
              { value: 'construction', label: 'Under Construction' },
              { value: 'inspection', label: 'Quality Inspection' },
              { value: 'handover', label: 'Nearly Complete' },
              { value: 'completed', label: 'Completed' }
            ]}
            placeholder="Filter by status"
          />
          
          <Select
            value={filters.type}
            onChange={(value) => setFilters(prev => ({ ...prev, type: value as string }))}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'general', label: 'General Infrastructure' },
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value as string)}
            options={sortOptions}
            placeholder="Sort by"
          />
        </div>
      </Card>

      {/* View Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {projects.length} project(s) found
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <Building2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
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
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const StatusIcon = getStatusIcon(project.status);
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <StatusIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {project.project_number}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Project Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{project.address}, {project.barangay}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{getCategoryLabel(project.category)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(project.start_date)} - {formatDate(project.completion_date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatCurrency(project.approved_budget)}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  {project.progress_percentage > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{project.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Public Announcements */}
                  {project.public_announcements && project.public_announcements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Announcements</h4>
                      <div className="space-y-2">
                        {project.public_announcements.slice(0, 2).map((announcement) => {
                          const AnnouncementIcon = getAnnouncementIcon(announcement.announcement_type);
                          return (
                            <div key={announcement.id} className="p-2 bg-gray-50 rounded text-xs">
                              <div className="flex items-start space-x-2">
                                <AnnouncementIcon className={`w-3 h-3 mt-0.5 ${getAnnouncementColor(announcement.announcement_type)}`} />
                                <div>
                                  <p className="font-medium text-gray-900">{announcement.title}</p>
                                  <p className="text-gray-600">{announcement.description}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Link href={`/infrastructure/public/projects/${project.id}`}>
                      <Button className="flex-1">
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card padding="lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
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
                            <div className="text-xs text-gray-500">
                              {getCategoryLabel(project.category)}
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
                          {project.address}
                        </div>
                        <div className="text-sm text-gray-500">
                          {project.barangay}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(project.approved_budget)}
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
                        <Link href={`/infrastructure/public/projects/${project.id}`}>
                          <Button variant="outlined" size="sm">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// Add default layout for persistent sidebar/topnav
PublicProjectsList.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default PublicProjectsList;
