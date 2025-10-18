import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { 
  Map,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Plus,
  Settings,
  History as HistoryIcon,
  TrendingUp,
  Calendar,
  MapPin,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface DashboardStats {
  total_applications: number;
  pending_review: number;
  approved: number;
  rejected: number;
  under_technical_review: number;
  awaiting_payment: number;
  average_processing_time: number;
  recent_submissions: number;
  applications_this_month: number;
  status_breakdown: Record<string, number>;
}

interface RecentApplication {
  id: number;
  application_number: string;
  first_name: string;
  last_name: string;
  project_name: string;
  status: string;
  created_at: string;
  project_type: string;
}

const ZoningDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsResponse = await fetch('/api/zoning/dashboard/stats');
      const statsResult = await statsResponse.json();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Load recent applications
      const recentResponse = await fetch('/api/zoning/applications?per_page=5&sort=created_at&order=desc');
      const recentResult = await recentResponse.json();
      if (recentResult.success) {
        setRecentApplications(recentResult.data.data || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
      initial_review: { label: 'Initial Review', color: 'bg-yellow-100 text-yellow-800' },
      technical_review: { label: 'Technical Review', color: 'bg-orange-100 text-orange-800' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      pending_payment: { label: 'Pending Payment', color: 'bg-purple-100 text-purple-800' },
      on_hold: { label: 'On Hold', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickActions = [
    {
      title: 'View Applications',
      description: 'Browse all zoning applications',
      icon: FileText,
      href: '/zoning/applications',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      title: 'Zoning Map',
      description: 'Interactive zoning map view',
      icon: Map,
      href: '/zoning/admin/map',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      title: 'Review Queue',
      description: 'Applications pending review',
      icon: Clock,
      href: '/zoning/applications?status=submitted',
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    {
      title: 'Activity Logs',
      description: 'View all application activities',
      icon: HistoryIcon,
      href: '/zoning/logs',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prepare chart data
  const statusData = [
    { name: 'Approved', value: stats?.approved || 0, color: '#10B981' },
    { name: 'Pending', value: stats?.pending_review || 0, color: '#FBBF24' },
    { name: 'Technical Review', value: stats?.under_technical_review || 0, color: '#F97316' },
    { name: 'Rejected', value: stats?.rejected || 0, color: '#EF4444' }
  ];

  const monthlyData = [
    { month: 'Submitted', count: stats?.recent_submissions || 0 },
    { month: 'Approved', count: stats?.approved || 0 },
    { month: 'Pending', count: stats?.pending_review || 0 },
    { month: 'This Month', count: stats?.applications_this_month || 0 }
  ];

  const COLORS = ['#10B981', '#FBBF24', '#F97316', '#EF4444'];

  return (
    <div className="space-y-6">
      <Head title="Zoning Clearance Dashboard" />
      
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <Header 
          variant="secondary"
          title="Zoning Clearance Dashboard"
          subtext="Manage zoning applications and compliance reviews."
        />
        
        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => window.location.href = '/zoning/applications'}
            variant="outlined" 
            leftIcon={<Eye size={16} />}
          >
            View All
          </Button>
          <Button 
            onClick={() => window.location.href = '/zoning/admin/map'}
            leftIcon={<Map size={16} />}
          >
            View Map
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Applications</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats?.total_applications || 0}</p>
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> All time
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats?.pending_review || 0}</p>
              <p className="text-xs text-yellow-600 mt-1 flex items-center">
                <Clock className="w-3 h-3 mr-1" /> Needs action
              </p>
            </div>
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Approved</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats?.approved || 0}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" /> Completed
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
              <p className="text-sm font-medium text-red-700">Rejected</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats?.rejected || 0}</p>
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" /> Declined
              </p>
            </div>
            <div className="p-3 bg-red-500 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Status Bar Chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Application Status Overview</h3>
              <p className="text-sm text-gray-600">Current status distribution</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
              <p className="text-sm text-gray-600">Percentage breakdown</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${((props.percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Processing Time</h3>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{stats?.average_processing_time || 0}</div>
          <p className="text-sm text-muted-foreground">Average days to process</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">This Month</h3>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{stats?.applications_this_month || 0}</div>
          <p className="text-sm text-muted-foreground">New applications submitted</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Technical Review</h3>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{stats?.under_technical_review || 0}</div>
          <p className="text-sm text-muted-foreground">Under technical review</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="flex items-center space-x-2 text-lg font-semibold">
              <Settings className="w-5 h-5" />
              <span>Quick Actions</span>
            </h3>
            <p className="text-sm text-gray-600">
              Common tasks and workflows
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <Card className={`cursor-pointer hover:shadow-md transition-shadow ${action.color}`}>
                    <div className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{action.title}</h3>
                          <p className="text-sm opacity-80">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Applications */}
        <div>
          <div className="mb-6">
            <h3 className="flex items-center space-x-2 text-lg font-semibold">
              <Clock className="w-5 h-5" />
              <span>Recent Applications</span>
            </h3>
            <p className="text-sm text-gray-600">
              Latest submitted applications
            </p>
          </div>
          <Card className="p-6">
            {recentApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent applications</p>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{application.application_number}</span>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {application.first_name} {application.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {application.project_name || application.project_type} • {formatDate(application.created_at)}
                      </p>
                    </div>
                    <Link href={`/zoning/applications/${application.id}`}>
                      <Button variant="outlined" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t">
              <Link href="/zoning/applications">
                <Button variant="outlined" className="w-full">
                  View All Applications
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Overview */}
      <div>
        <div className="mb-6">
          <h3 className="flex items-center space-x-2 text-lg font-semibold">
            <BarChart3 className="w-5 h-5" />
            <span>Application Status Overview</span>
          </h3>
          <p className="text-sm text-gray-600">
            Distribution of applications by status
          </p>
        </div>
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stats?.status_breakdown && Object.entries(stats.status_breakdown).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {status.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Add default layout for persistent sidebar/topnav
ZoningDashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default ZoningDashboard;
