import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { 
  BudgetApprovalModal,
  ContractAwardModal,
  InspectionModal,
  HandoverModal,
  CancelProjectModal
} from './WorkflowActionModals';
import { 
  Building2,
  HardHat,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  Users,
  FileText,
  BarChart3,
  History,
  Eye,
  Edit,
  ArrowLeft,
  AlertTriangle,
  XCircle,
  Plus,
  Download,
  Upload,
  Settings
} from 'lucide-react';

interface Project {
  id: number;
  project_number: string;
  title: string;
  description: string;
  project_type: 'general' | 'housing_related';
  category: string;
  status: string;
  priority: string;
  estimated_budget: number;
  approved_budget?: number;
  actual_cost: number;
  progress_percentage: number;
  start_date: string;
  completion_date: string;
  address: string;
  barangay: string;
  latitude: number;
  longitude: number;
  contractor?: {
    id: number;
    company_name: string;
    contact_person: string;
    contact_number: string;
    email: string;
    rating: number;
  };
  housing_application_id?: number;
  notes: string;
  milestones: Milestone[];
  actions: Action[];
  public_announcements: Announcement[];
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  target_date: string;
  completion_date?: string;
  budget_allocation: number;
  actual_cost: number;
  progress_percentage: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  deliverables: string;
  notes: string;
}

interface Action {
  id: number;
  action: string;
  old_status?: string;
  new_status?: string;
  reason?: string;
  note?: string;
  actor: {
    name: string;
    email: string;
  };
  created_at: string;
}

interface Announcement {
  id: number;
  title: string;
  description: string;
  announcement_type: 'info' | 'warning' | 'closure' | 'delay' | 'update';
  published_date: string;
  effective_date?: string;
  end_date?: string;
}

const ProjectDetails = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [projectId, setProjectId] = useState<number | null>(null);
  
  // Modal states
  const [isBudgetApprovalModalOpen, setIsBudgetApprovalModalOpen] = useState(false);
  const [isContractAwardModalOpen, setIsContractAwardModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [contractors, setContractors] = useState<any[]>([]);

  useEffect(() => {
    // Get project ID from URL or props
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || window.location.pathname.split('/').pop();
    if (id) {
      setProjectId(parseInt(id));
      loadProject(parseInt(id));
      loadContractors();
    }
  }, []);

  const loadProject = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/infrastructure/projects/${id}`);
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

  const loadContractors = async () => {
    try {
      const response = await fetch('/api/infrastructure/contractors');
      const result = await response.json();
      
      if (result.success) {
        setContractors(result.data || []);
      }
    } catch (error) {
      console.error('Error loading contractors:', error);
    }
  };

  // Modal handlers
  const handleWorkflowAction = (action: string) => {
    switch (action) {
      case 'approve-budget':
      case 'reject-budget':
        setIsBudgetApprovalModalOpen(true);
        break;
      case 'award-contract':
        setIsContractAwardModalOpen(true);
        break;
      case 'submit-inspection':
      case 'complete-inspection':
        setIsInspectionModalOpen(true);
        break;
      case 'handover':
        setIsHandoverModalOpen(true);
        break;
      case 'cancel':
        setIsCancelModalOpen(true);
        break;
      default:
        console.log(`Action: ${action}`);
    }
  };

  const handleModalSuccess = (data: any) => {
    // Reload project data after successful action
    if (projectId) {
      loadProject(projectId);
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

  const getMilestoneStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      delayed: { label: 'Delayed', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
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

  const getWorkflowActions = (status: string) => {
    switch (status) {
      case 'proposal':
        return [
          { label: 'Submit for Budget Approval', action: 'submit-budget', variant: 'primary' },
          { label: 'Edit Project', action: 'edit', variant: 'outlined' },
          { label: 'Cancel Project', action: 'cancel', variant: 'outlined' }
        ];
      case 'budget_approval':
        return [
          { label: 'Approve Budget', action: 'approve-budget', variant: 'primary' },
          { label: 'Reject Budget', action: 'reject-budget', variant: 'outlined' }
        ];
      case 'bidding':
        return [
          { label: 'Award Contract', action: 'award-contract', variant: 'primary' }
        ];
      case 'construction':
        return [
          { label: 'Submit for Inspection', action: 'submit-inspection', variant: 'primary' }
        ];
      case 'inspection':
        return [
          { label: 'Complete Inspection', action: 'complete-inspection', variant: 'primary' }
        ];
      case 'handover':
        return [
          { label: 'Handover Project', action: 'handover', variant: 'primary' }
        ];
      default:
        return [];
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'milestones', label: 'Milestones', icon: Calendar },
    { id: 'contractor', label: 'Contractor', icon: Users },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'timeline', label: 'Timeline', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History }
  ];

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
            <Link href="/infrastructure/projects">
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
            {getPriorityBadge(project.priority)}
          </div>
        </div>
      </div>

      {/* Workflow Actions */}
      {getWorkflowActions(project.status).length > 0 && (
        <Card className="mb-6" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Workflow Actions</h3>
              <p className="text-sm text-gray-600">Available actions for current status</p>
            </div>
            <div className="flex items-center space-x-2">
              {getWorkflowActions(project.status).map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant as any}
                  onClick={() => handleWorkflowAction(action.action)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Project Details */}
            <Card title="Project Details" padding="lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Project Number</dt>
                      <dd className="text-sm text-gray-900">{project.project_number}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="text-sm text-gray-900">{getProjectTypeLabel(project.project_type)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="text-sm text-gray-900">{getCategoryLabel(project.category)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Priority</dt>
                      <dd className="text-sm text-gray-900">{getPriorityBadge(project.priority)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-900">{project.description}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Location</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="text-sm text-gray-900">{project.address}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Barangay</dt>
                      <dd className="text-sm text-gray-900">{project.barangay}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
                      <dd className="text-sm text-gray-900">
                        {project.latitude}, {project.longitude}
                      </dd>
                    </div>
                    {project.housing_application_id && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Linked Housing Application</dt>
                        <dd className="text-sm text-gray-900">
                          <Link href={`/housing/applications/${project.housing_application_id}`} className="text-blue-600 hover:text-blue-800">
                            View Application #{project.housing_application_id}
                          </Link>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </Card>

            {/* Budget Summary */}
            <Card title="Budget Summary" padding="lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Estimated Budget</h4>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.estimated_budget)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Approved Budget</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {project.approved_budget ? formatCurrency(project.approved_budget) : 'Not approved'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Actual Cost</h4>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.actual_cost)}</p>
                </div>
              </div>
              
              {project.approved_budget && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Budget Utilization</span>
                    <span>{Math.round((project.actual_cost / project.approved_budget) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((project.actual_cost / project.approved_budget) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </Card>

            {/* Timeline */}
            <Card title="Timeline" padding="lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Start Date</h4>
                  <p className="text-sm text-gray-900">{formatDate(project.start_date)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Expected Completion</h4>
                  <p className="text-sm text-gray-900">{formatDate(project.completion_date)}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{project.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${project.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Project Milestones</h3>
              <Button>
                <Plus className="w-4 h-4" />
                Add Milestone
              </Button>
            </div>
            
            {project.milestones.length === 0 ? (
              <Card padding="lg">
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Milestones</h3>
                  <p className="text-gray-600">No milestones have been created for this project yet.</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {project.milestones.map((milestone) => (
                  <Card key={milestone.id} padding="lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getMilestoneStatusBadge(milestone.status)}
                        <Button variant="outlined" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Target Date</p>
                        <p className="text-sm text-gray-900">{formatDate(milestone.target_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Budget Allocation</p>
                        <p className="text-sm text-gray-900">{formatCurrency(milestone.budget_allocation)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Progress</p>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${milestone.progress_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{milestone.progress_percentage}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {milestone.deliverables && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Deliverables</p>
                        <p className="text-sm text-gray-900">{milestone.deliverables}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'contractor' && (
          <div className="space-y-6">
            {project.contractor ? (
              <Card title="Contractor Information" padding="lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Company Details</h4>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                        <dd className="text-sm text-gray-900">{project.contractor.company_name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                        <dd className="text-sm text-gray-900">{project.contractor.contact_person}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                        <dd className="text-sm text-gray-900">{project.contractor.contact_number}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">{project.contractor.email}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Performance</h4>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Rating</dt>
                        <dd className="text-sm text-gray-900">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < project.contractor.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                              ({project.contractor.rating}/5)
                            </span>
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="outlined">
                      <Edit className="w-4 h-4" />
                      Edit Contractor
                    </Button>
                    <Button variant="outlined">
                      <Users className="w-4 h-4" />
                      View All Projects
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card padding="lg">
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contractor Assigned</h3>
                  <p className="text-gray-600 mb-4">This project doesn't have a contractor assigned yet.</p>
                  <Button>
                    <Plus className="w-4 h-4" />
                    Assign Contractor
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            <Card title="Budget Breakdown" padding="lg">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Estimated Budget</span>
                  <span className="text-lg font-bold">{formatCurrency(project.estimated_budget)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium">Approved Budget</span>
                  <span className="text-lg font-bold">
                    {project.approved_budget ? formatCurrency(project.approved_budget) : 'Not approved'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-medium">Actual Cost</span>
                  <span className="text-lg font-bold">{formatCurrency(project.actual_cost)}</span>
                </div>
                {project.approved_budget && (
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                    <span className="font-medium">Variance</span>
                    <span className={`text-lg font-bold ${
                      project.actual_cost > project.approved_budget ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(project.actual_cost - project.approved_budget)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <Card title="Project Timeline" padding="lg">
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline Visualization</h3>
                <p className="text-gray-600">Timeline visualization will be implemented here.</p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <Card title="Project History" padding="lg">
              {project.actions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No History</h3>
                  <p className="text-gray-600">No actions have been recorded for this project yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.actions.map((action) => (
                    <div key={action.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <History className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {action.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {action.old_status && action.new_status && (
                            <span className="text-sm text-gray-500">
                              {action.old_status} → {action.new_status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{action.note || action.reason}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>By: {action.actor.name}</span>
                          <span>{formatDate(action.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Workflow Action Modals */}
      <BudgetApprovalModal
        isOpen={isBudgetApprovalModalOpen}
        onClose={() => setIsBudgetApprovalModalOpen(false)}
        onSuccess={handleModalSuccess}
        project={project}
        action={project?.status === 'budget_approval' ? 'approve' : 'reject'}
      />

      <ContractAwardModal
        isOpen={isContractAwardModalOpen}
        onClose={() => setIsContractAwardModalOpen(false)}
        onSuccess={handleModalSuccess}
        project={project}
        contractors={contractors}
      />

      <InspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        onSuccess={handleModalSuccess}
        project={project}
      />

      <HandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        onSuccess={handleModalSuccess}
        project={project}
      />

      <CancelProjectModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={handleModalSuccess}
        project={project}
      />
    </div>
  );
};

// Add default layout for persistent sidebar/topnav
ProjectDetails.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default ProjectDetails;
