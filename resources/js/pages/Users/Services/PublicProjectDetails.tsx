import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { 
  Building2,
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  HardHat,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Phone,
  Mail,
  FileText,
  Users,
  BarChart3,
  TrendingUp
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

const PublicProjectDetails = () => {
  const [project, setProject] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    // Get project ID from URL or props
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || window.location.pathname.split('/').pop();
    if (id) {
      setProjectId(parseInt(id));
      loadProject(parseInt(id));
    }
  }, []);

  const loadProject = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/infrastructure/projects/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setProject(result.data);
      }
    } catch (error) {
      console.error('Error loading project:', error);
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

  const getPriorityLabel = (priority: string) => {
    const priorities = {
      low: 'Low Priority',
      medium: 'Medium Priority',
      high: 'High Priority',
      critical: 'Critical Priority'
    };
    return priorities[priority as keyof typeof priorities] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Not Found</h3>
        <p className="text-gray-600">The requested project could not be found.</p>
        <Link href="/infrastructure/public">
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Head title={`${project.title} - Infrastructure Project`} />
      
      {/* Page Header */}
      <div className="flex-shrink-0 mb-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Link href="/infrastructure/public">
              <Button variant="outlined" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            </Link>
            <div>
              <Header 
                variant="secondary"
                title={project.title}
                subtext={`${project.project_number} • ${getProjectTypeLabel(project.project_type)}`}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(project.status)}
            <Badge className={getPriorityColor(project.priority)}>
              {getPriorityLabel(project.priority)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card title="Project Overview" padding="lg">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{project.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Project Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-600">Project Number</dt>
                      <dd className="text-gray-900">{project.project_number}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Type</dt>
                      <dd className="text-gray-900">{getProjectTypeLabel(project.project_type)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Category</dt>
                      <dd className="text-gray-900">{getCategoryLabel(project.category)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Status</dt>
                      <dd>{getStatusBadge(project.status)}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-600">Address</dt>
                      <dd className="text-gray-900">{project.address}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Barangay</dt>
                      <dd className="text-gray-900">{project.barangay}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Coordinates</dt>
                      <dd className="text-gray-900">
                        {project.latitude}, {project.longitude}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card title="Project Timeline" padding="lg">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Start Date</h4>
                  <p className="text-gray-700">{formatDate(project.start_date)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Expected Completion</h4>
                  <p className="text-gray-700">{formatDate(project.completion_date)}</p>
                </div>
              </div>
              
              {project.progress_percentage > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${project.progress_percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{project.progress_percentage}%</span>
                  </div>
                </div>
              )}

              {/* Timeline Visualization */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4">Project Phases</h4>
                <div className="space-y-3">
                  {[
                    { phase: 'Planning', status: project.status === 'budget_approval' ? 'current' : 'completed' },
                    { phase: 'Bidding', status: project.status === 'bidding' ? 'current' : project.status === 'budget_approval' ? 'pending' : 'completed' },
                    { phase: 'Construction', status: project.status === 'construction' ? 'current' : ['inspection', 'handover', 'completed'].includes(project.status) ? 'completed' : 'pending' },
                    { phase: 'Inspection', status: project.status === 'inspection' ? 'current' : project.status === 'completed' ? 'completed' : 'pending' },
                    { phase: 'Completion', status: project.status === 'completed' ? 'completed' : 'pending' }
                  ].map((phase, index) => (
                    <div key={phase.phase} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                        phase.status === 'current' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {phase.status === 'completed' ? '✓' : index + 1}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          phase.status === 'completed' ? 'text-green-800' :
                          phase.status === 'current' ? 'text-blue-800' :
                          'text-gray-400'
                        }`}>
                          {phase.phase}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Budget Information */}
          <Card title="Budget Information" padding="lg">
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(project.approved_budget)}
                </h4>
                <p className="text-gray-600">Total Approved Budget</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Funding Source</h5>
                <p className="text-sm text-gray-600">
                  This project is funded through municipal infrastructure development funds.
                </p>
              </div>
            </div>
          </Card>

          {/* Public Announcements */}
          {project.public_announcements && project.public_announcements.length > 0 && (
            <Card title="Public Announcements" padding="lg">
              <div className="space-y-4">
                {project.public_announcements.map((announcement) => {
                  const AnnouncementIcon = getAnnouncementIcon(announcement.announcement_type);
                  return (
                    <div key={announcement.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AnnouncementIcon className={`w-5 h-5 mt-0.5 ${getAnnouncementColor(announcement.announcement_type)}`} />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1">{announcement.title}</h5>
                          <p className="text-sm text-gray-700 mb-2">{announcement.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Published: {formatDate(announcement.published_date)}</span>
                            {announcement.effective_date && (
                              <span>Effective: {formatDate(announcement.effective_date)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Project Updates */}
          <Card title="Recent Updates" padding="lg">
            <div className="space-y-4">
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Updates</h3>
                <p className="text-gray-600">
                  Recent milestones and progress updates will be displayed here.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card title="Quick Information" padding="lg">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Project Type</p>
                  <p className="text-sm text-gray-600">{getProjectTypeLabel(project.project_type)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Duration</p>
                  <p className="text-sm text-gray-600">
                    {Math.ceil((new Date(project.completion_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{project.barangay}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card title="Contact Information" padding="lg">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Project Office</p>
                  <p className="text-sm text-gray-600">(02) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">infrastructure@city.gov.ph</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Office Hours</p>
                  <p className="text-sm text-gray-600">Mon-Fri, 8AM-5PM</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Related Links */}
          <Card title="Related Links" padding="lg">
            <div className="space-y-2">
              <Link href="/infrastructure/public" className="block">
                <Button variant="outlined" className="w-full justify-start">
                  <Building2 className="w-4 h-4" />
                  All Infrastructure Projects
                </Button>
              </Link>
              <Link href="/infrastructure/public" className="block">
                <Button variant="outlined" className="w-full justify-start">
                  <MapPin className="w-4 h-4" />
                  Map View
                </Button>
              </Link>
              <Button variant="outlined" className="w-full justify-start">
                <FileText className="w-4 h-4" />
                Download Project Info
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Add default layout for persistent sidebar/topnav
PublicProjectDetails.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default PublicProjectDetails;
