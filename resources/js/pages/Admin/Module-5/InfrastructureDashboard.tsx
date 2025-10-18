import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { 
  Building2,
  HardHat,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  Eye,
  Settings,
  History as HistoryIcon,
  MapPin,
  DollarSign,
  AlertTriangle,
  Users,
  FileText,
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react';

interface DashboardStats {
  total_projects: number;
  active_projects: number;
  in_bidding: number;
  in_construction: number;
  completed: number;
  cancelled: number;
  total_budget: number;
  budget_utilized: number;
  delayed_projects: number;
  total_contractors: number;
  budget_utilization_percentage: number;
  average_completion_time: number;
  projects_this_month: number;
}

interface RecentActivity {
  id: number;
  action: string;
  project: {
    title: string;
    project_number: string;
  };
  actor: {
    name: string;
  };
  created_at: string;
}

const InfrastructureDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsResponse = await fetch('/api/infrastructure/dashboard');
      const statsResult = await statsResponse.json();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Load recent activity (using logs endpoint)
      const activityResponse = await fetch('/api/infrastructure/logs?per_page=5');
      const activityResult = await activityResponse.json();
      if (activityResult.success) {
        setRecentActivity(activityResult.data.data || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposal': return 'bg-gray-100 text-gray-800';
      case 'budget_approval': return 'bg-yellow-100 text-yellow-800';
      case 'bidding': return 'bg-blue-100 text-blue-800';
      case 'construction': return 'bg-orange-100 text-orange-800';
      case 'inspection': return 'bg-purple-100 text-purple-800';
      case 'handover': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return Plus;
      case 'status_changed': return ArrowRight;
      case 'budget_approved': return CheckCircle;
      case 'contract_awarded': return HardHat;
      case 'construction_started': return Building2;
      case 'inspection_completed': return Eye;
      case 'handover': return CheckCircle;
      case 'cancelled': return AlertTriangle;
      default: return FileText;
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickActions = [
    {
      title: 'Create New Project',
      description: 'Start a new infrastructure project',
      icon: Plus,
      href: '/infrastructure/projects?action=create',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      title: 'Manage Contractors',
      description: 'View and manage contractor information',
      icon: Users,
      href: '/infrastructure/contractors',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      title: 'Generate Reports',
      description: 'Create progress and technical reports',
      icon: BarChart3,
      href: '/infrastructure/reports',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      title: 'View Activity Logs',
      description: 'Monitor all project activities',
      icon: HistoryIcon,
      href: '/infrastructure/logs',
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    }
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Head title="Infrastructure Project Dashboard" />
        
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <Header 
            variant="secondary"
            title="Infrastructure Project Coordination"
            subtext="Monitor and manage municipal infrastructure projects."
          />
          
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => window.location.href = '/infrastructure/projects'}
              variant="outlined" 
              leftIcon={<Eye size={16} />}
            >
              View All
            </Button>
            <Button 
              onClick={() => window.location.href = '/infrastructure/logs'}
              leftIcon={<HistoryIcon size={16} />}
            >
              View Logs
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Projects</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stats?.total_projects || 0}</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> All time
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Active Projects</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{stats?.active_projects || 0}</p>
                <p className="text-xs text-yellow-600 mt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> In progress
                </p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-lg">
                <HardHat className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Completed</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{stats?.completed || 0}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> Finished
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Delayed</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{stats?.delayed_projects || 0}</p>
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Needs attention
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Budget Utilization</h3>
              <DollarSign className="h-5 w-5 text-gray-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Utilized</span>
                <span className="font-semibold text-gray-900">{formatCurrency(stats?.budget_utilized || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Budget</span>
                <span className="font-semibold text-gray-900">{formatCurrency(stats?.total_budget || 0)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats?.budget_utilization_percentage || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats?.budget_utilization_percentage || 0}% utilized
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Average Completion</h3>
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.average_completion_time || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Days to complete</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
              <TrendingUp className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.projects_this_month || 0}</div>
            <p className="text-sm text-gray-600 mt-1">New projects started</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common tasks and workflows</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <Card className={`cursor-pointer hover:shadow-md transition-shadow border-2 ${action.color}`}>
                      <div className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{action.title}</h3>
                            <p className="text-xs opacity-80 mt-0.5">{action.description}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-600">Latest project activities</p>
            </div>
            <Card className="p-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const ActionIcon = getActionIcon(activity.action);
                    return (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <ActionIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.project.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {activity.project.project_number}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <Link href="/infrastructure/logs">
                  <Button variant="outlined" className="w-full" size="sm">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Project Status Overview */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Status Overview</h3>
            <p className="text-sm text-gray-600">Distribution of projects by status</p>
          </div>
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats?.total_projects || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Total</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{stats?.in_bidding || 0}</div>
                <div className="text-xs text-yellow-600 mt-1">Bidding</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{stats?.in_construction || 0}</div>
                <div className="text-xs text-orange-600 mt-1">Construction</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">0</div>
                <div className="text-xs text-purple-600 mt-1">Inspection</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-700">0</div>
                <div className="text-xs text-indigo-600 mt-1">Handover</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{stats?.completed || 0}</div>
                <div className="text-xs text-green-600 mt-1">Completed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{stats?.cancelled || 0}</div>
                <div className="text-xs text-red-600 mt-1">Cancelled</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{stats?.delayed_projects || 0}</div>
                <div className="text-xs text-red-600 mt-1">Delayed</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default InfrastructureDashboard;
