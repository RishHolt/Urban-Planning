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
  MapPin,
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  Building2,
  HardHat,
  CheckCircle,
  Clock,
  AlertTriangle,
  List,
  RefreshCw
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
  latitude: number;
  longitude: number;
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

const PublicInfrastructureMap = () => {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    category: 'all',
    barangay: 'all'
  });
  const [selectedProject, setSelectedProject] = useState<PublicProject | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]);
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    loadProjects();
  }, [searchTerm, filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.barangay !== 'all') params.append('barangay', filters.barangay);

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

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'budget_approval': return '#3B82F6'; // blue
      case 'bidding': return '#F59E0B'; // yellow
      case 'construction': return '#F97316'; // orange
      case 'inspection': return '#8B5CF6'; // purple
      case 'handover': return '#6366F1'; // indigo
      case 'completed': return '#10B981'; // green
      default: return '#6B7280'; // gray
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

  const filteredProjects = projects.filter(project => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return project.title.toLowerCase().includes(search) ||
             project.description.toLowerCase().includes(search) ||
             project.address.toLowerCase().includes(search) ||
             project.barangay.toLowerCase().includes(search);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Head title="Infrastructure Projects Map" />
      
      {/* Page Header */}
      <div className="flex-shrink-0 mb-4 pb-2">
        <div className="flex justify-between items-start">
          <Header 
            variant="secondary"
            title="Infrastructure Projects Map"
            subtext="View ongoing and completed infrastructure projects in your area."
          />
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outlined" 
              onClick={() => window.location.href = '/infrastructure/public/projects'}
            >
              <List className="w-4 h-4" />
              List View
            </Button>
            <Button variant="outlined" onClick={loadProjects} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
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
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <Card title="Project Locations" padding="lg">
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative">
              {/* Map placeholder - in real implementation, this would be a Leaflet map */}
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Map</h3>
                <p className="text-gray-600 mb-4">
                  This would display an interactive map with project markers
                </p>
                <div className="text-sm text-gray-500">
                  {filteredProjects.length} project(s) found
                </div>
              </div>
              
              {/* Mock markers */}
              {filteredProjects.slice(0, 5).map((project, index) => (
                <div
                  key={project.id}
                  className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer"
                  style={{
                    left: `${20 + (index * 15)}%`,
                    top: `${30 + (index * 10)}%`,
                    backgroundColor: getMarkerColor(project.status)
                  }}
                  onClick={() => setSelectedProject(project)}
                  title={project.title}
                />
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Planning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Bidding</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Construction</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Completed</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Project List */}
        <div className="lg:col-span-1">
          <Card title="Projects" subtitle={`${filteredProjects.length} projects`} padding="lg">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
                <p className="text-gray-600">
                  No projects match your current filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredProjects.map((project) => {
                  const StatusIcon = getStatusIcon(project.status);
                  return (
                    <div
                      key={project.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProject?.id === project.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full mt-2"
                          style={{ backgroundColor: getMarkerColor(project.status) }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {project.title}
                            </h4>
                            {getStatusBadge(project.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {project.address}, {project.barangay}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(project.start_date)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{formatCurrency(project.approved_budget)}</span>
                            </span>
                          </div>
                          {project.progress_percentage > 0 && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{project.progress_percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full"
                                  style={{ width: `${project.progress_percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedProject.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedProject.project_number} • {getProjectTypeLabel(selectedProject.project_type)}
                  </p>
                </div>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => setSelectedProject(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                {/* Project Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Project Details</h4>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-600">Category</dt>
                        <dd className="text-gray-900">{getCategoryLabel(selectedProject.category)}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Status</dt>
                        <dd>{getStatusBadge(selectedProject.status)}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Location</dt>
                        <dd className="text-gray-900">{selectedProject.address}, {selectedProject.barangay}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Timeline & Budget</h4>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-600">Start Date</dt>
                        <dd className="text-gray-900">{formatDate(selectedProject.start_date)}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Expected Completion</dt>
                        <dd className="text-gray-900">{formatDate(selectedProject.completion_date)}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Approved Budget</dt>
                        <dd className="text-gray-900">{formatCurrency(selectedProject.approved_budget)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-700">{selectedProject.description}</p>
                </div>

                {/* Progress */}
                {selectedProject.progress_percentage > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${selectedProject.progress_percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{selectedProject.progress_percentage}%</span>
                    </div>
                  </div>
                )}

                {/* Public Announcements */}
                {selectedProject.public_announcements && selectedProject.public_announcements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Public Announcements</h4>
                    <div className="space-y-2">
                      {selectedProject.public_announcements.map((announcement) => {
                        const AnnouncementIcon = getAnnouncementIcon(announcement.announcement_type);
                        return (
                          <div key={announcement.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AnnouncementIcon className={`w-4 h-4 mt-0.5 ${getAnnouncementColor(announcement.announcement_type)}`} />
                              <div>
                                <h5 className="font-medium text-gray-900 text-sm">{announcement.title}</h5>
                                <p className="text-sm text-gray-600">{announcement.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(announcement.published_date)}
                                </p>
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
                  <Link href={`/infrastructure/public/projects/${selectedProject.id}`}>
                    <Button>
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add default layout for persistent sidebar/topnav
PublicInfrastructureMap.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default PublicInfrastructureMap;
