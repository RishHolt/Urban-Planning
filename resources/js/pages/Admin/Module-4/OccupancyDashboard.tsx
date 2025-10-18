import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { 
  Building,
  Users,
  Home,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  History as HistoryIcon,
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
  total_occupancies: number;
  active_occupancies: number;
  ended_occupancies: number;
  terminated_occupancies: number;
  inspections_due_this_month: number;
  recent_moves: number;
}

interface RecentActivity {
  id: number;
  action: string;
  occupancy: {
    beneficiary_name: string;
    unit_identifier: string;
  };
  actor: {
    name: string;
  };
  created_at: string;
}

const OccupancyDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/occupancy/dashboard'),
        fetch('/api/occupancy/records?per_page=10')
      ]);

      const statsData = await statsResponse.json();
      const activityData = await activityResponse.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (activityData.success) {
        // Get recent actions from the first few records
        const activities = activityData.data.data?.slice(0, 10).map((record: any) => ({
          id: record.id,
          action: 'Occupancy Record',
          occupancy: {
            beneficiary_name: record.beneficiary_name,
            unit_identifier: record.unit_identifier
          },
          actor: { name: 'System' },
          created_at: record.created_at
        })) || [];
        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      case 'transferred': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'move_in': return Home;
      case 'move_out': return XCircle;
      case 'inspection': return ClipboardCheck;
      case 'terminated': return AlertCircle;
      default: return Building;
    }
  };

  // Prepare chart data
  const statusData = [
    { name: 'Active', value: stats?.active_occupancies || 0 },
    { name: 'Ended', value: stats?.ended_occupancies || 0 },
    { name: 'Terminated', value: stats?.terminated_occupancies || 0 },
  ];

  const COLORS = ['#10b981', '#6b7280', '#ef4444'];

  const monthlyData = [
    { month: 'Jan', active: 45, ended: 5 },
    { month: 'Feb', active: 52, ended: 3 },
    { month: 'Mar', active: 48, ended: 7 },
    { month: 'Apr', active: 61, ended: 4 },
    { month: 'May', active: 55, ended: 6 },
    { month: 'Jun', active: stats?.active_occupancies || 58, ended: stats?.ended_occupancies || 5 },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title="Occupancy Monitoring Dashboard" />
      
      <div className="space-y-6">
        {/* Page Header */}
        <Header 
          variant="secondary"
          title="Occupancy Monitoring"
          subtext="Track housing beneficiaries and occupancy status."
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Occupancies</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stats?.total_occupancies || 0}</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> All records
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <Building className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active Occupancies</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{stats?.active_occupancies || 0}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> Currently occupied
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Inspections Due</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{stats?.inspections_due_this_month || 0}</p>
                <p className="text-xs text-yellow-600 mt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> This month
                </p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-lg">
                <ClipboardCheck className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Recent Moves</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{stats?.recent_moves || 0}</p>
                <p className="text-xs text-purple-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> Last 30 days
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar Chart */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Occupancy Trends</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" fill="#10b981" name="Active" />
                <Bar dataKey="ended" fill="#6b7280" name="Ended" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Pie Chart */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${((props.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/occupancy/records">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Occupancy</h3>
                  <p className="text-sm text-gray-600">Create a new occupancy record</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/occupancy/inspections?action=schedule">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ClipboardCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Schedule Inspection</h3>
                  <p className="text-sm text-gray-600">Schedule new inspections</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/occupancy/records">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">View All Records</h3>
                  <p className="text-sm text-gray-600">Browse occupancy records</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/occupancy/logs">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <HistoryIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
                  <p className="text-sm text-gray-600">View all activities</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Button 
              variant="outlined" 
              size="sm"
              onClick={() => window.location.href = '/occupancy/records'}
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const ActionIcon = getActionIcon(activity.action);
                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ActionIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.occupancy.beneficiary_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.occupancy.unit_identifier}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OccupancyDashboard;
