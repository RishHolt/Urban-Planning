import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { 
  Home,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  Eye,
  Settings,
  History as HistoryIcon,
  Building,
  MapPin,
  Shield,
  AlertTriangle,
  BarChart3
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
  Cell
} from 'recharts';

interface DashboardStats {
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
  average_processing_time: number;
  recent_submissions: number;
  applications_needing_attention: number;
}

interface RecentApplication {
  id: number;
  application_number: string;
  full_name: string;
  status: string;
  submitted_at: string;
  score: number | null;
  program_type: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  count?: number;
}

const HousingDashboard = () => {
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
      const statsResponse = await fetch('/api/housing/dashboard/stats');
      const statsResult = await statsResponse.json();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Load recent applications
      const recentResponse = await fetch('/api/housing/applications?limit=5&sort=newest');
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
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
      submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
      document_verification: { label: 'Document Verification', color: 'bg-orange-100 text-orange-800' },
      field_inspection: { label: 'Field Inspection', color: 'bg-purple-100 text-purple-800' },
      final_review: { label: 'Final Review', color: 'bg-indigo-100 text-indigo-800' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      info_requested: { label: 'Info Requested', color: 'bg-amber-100 text-amber-800' },
      on_hold: { label: 'On Hold', color: 'bg-slate-100 text-slate-800' },
      appeal: { label: 'Appeal', color: 'bg-pink-100 text-pink-800' },
      withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
      offer_issued: { label: 'Offer Issued', color: 'bg-emerald-100 text-emerald-800' },
      beneficiary_assigned: { label: 'Beneficiary Assigned', color: 'bg-teal-100 text-teal-800' },
      closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getProgramTypeLabel = (type: string) => {
    const types = {
      rental_subsidy: 'Rental Subsidy',
      socialized_housing: 'Socialized Housing',
      in_city_relocation: 'In-City Relocation'
    };
    return types[type as keyof typeof types] || type;
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

  const quickActions: QuickAction[] = [
    {
      title: 'Document Verification',
      description: 'Documents pending verification',
      icon: FileText,
      href: '/housing/documents',
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    {
      title: 'Schedule Inspections',
      description: 'Applications ready for field inspection',
      icon: Calendar,
      href: '/housing/inspections',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      title: 'Final Review',
      description: 'Applications ready for final decision',
      icon: CheckCircle,
      href: '/housing/applications?status=final_review',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    },
    {
      title: 'Application Logs',
      description: 'View all application activities',
      icon: HistoryIcon,
      href: '/housing/logs',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
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
    { name: 'Approved', value: stats?.approved_applications || 0, color: '#10B981' },
    { name: 'Pending', value: stats?.pending_applications || 0, color: '#FBBF24' },
    { name: 'Rejected', value: stats?.rejected_applications || 0, color: '#EF4444' }
  ];

  const COLORS = ['#10B981', '#FBBF24', '#EF4444'];

  return (
    <div className="space-y-6">
      <Head title="Housing Dashboard" />
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <Header 
          variant="secondary"
          title="Housing Registry Dashboard"
          subtext="Monitor and manage housing assistance applications."
        />
        
        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => window.location.href = '/housing/applications'}
            variant="outlined" 
            leftIcon={<Eye size={16} />}
          >
            View All
          </Button>
          <Button 
            onClick={() => window.location.href = '/housing/logs'}
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
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats?.pending_applications || 0}</p>
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
              <p className="text-3xl font-bold text-green-900 mt-1">{stats?.approved_applications || 0}</p>
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
              <p className="text-3xl font-bold text-red-900 mt-1">{stats?.rejected_applications || 0}</p>
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
                <h3 className="text-lg font-semibold">Recent Submissions</h3>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold">{stats?.recent_submissions || 0}</div>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Needs Attention</h3>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-amber-600">{stats?.applications_needing_attention || 0}</div>
              <p className="text-sm text-muted-foreground">Requires immediate action</p>
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
                          {action.count !== undefined && (
                            <Badge variant="secondary" className="mt-1">
                              {action.count} pending
                            </Badge>
                          )}
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
                      <p className="text-sm text-gray-600">{application.full_name}</p>
                      <p className="text-xs text-gray-500">
                        {getProgramTypeLabel(application.program_type)} • {formatDate(application.submitted_at)}
                      </p>
                      {application.score !== null && (
                        <div className="mt-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Score:</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ width: `${application.score}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">{application.score}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Link href={`/housing/applications/${application.id}`}>
                      <Button variant="outlined" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t">
              <Link href="/housing/applications">
                <Button variant="outlined" className="w-full">
                  View All Applications
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Program Overview */}
      <div>
        <div className="mb-6">
          <h3 className="flex items-center space-x-2 text-lg font-semibold">
            <Building className="w-5 h-5" />
            <span>Program Overview</span>
          </h3>
          <p className="text-sm text-gray-600">
            Housing assistance programs and statistics
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-3">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-900">Rental Subsidy</h3>
            <p className="text-sm text-blue-700">Financial assistance for rent payments</p>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-3">
              <Building className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-green-900">Socialized Housing</h3>
            <p className="text-sm text-green-700">Affordable housing units for low-income families</p>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="p-3 bg-purple-100 rounded-full w-12 h-12 mx-auto mb-3">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-purple-900">In-City Relocation</h3>
            <p className="text-sm text-purple-700">Relocation assistance within the city</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add default layout for persistent sidebar/topnav
HousingDashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default HousingDashboard;
