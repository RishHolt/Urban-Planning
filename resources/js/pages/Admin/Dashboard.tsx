import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Map, Building2, Home, Users, Network, FileText, Plus, BarChart3, Settings, Clock, CheckCircle, AlertTriangle, TrendingUp, Eye, ArrowRight, History } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { Header, Button, Card, Badge, Skeleton } from '../../components';
import { Link } from '@inertiajs/react';
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
    Line,
    Area,
    AreaChart
} from 'recharts';

interface DashboardStats {
    total_users: number;
    active_modules: number;
    zoning: {
        total_applications: number;
        pending_review: number;
        approved: number;
        rejected: number;
    };
    housing: {
        total_applications: number;
        pending_review: number;
        approved: number;
        rejected: number;
    };
    occupancy: {
        total_occupancies: number;
        active_occupancies: number;
        ended_occupancies: number;
        terminated_occupancies: number;
    };
    infrastructure: {
        total_projects: number;
        active_projects: number;
        completed_projects: number;
        delayed_projects: number;
    };
    building: {
        total_reviews: number;
        under_review: number;
        approved_reviews: number;
        high_priority: number;
    };
    system_health: {
        total_applications: number;
        pending_actions: number;
        completed_this_month: number;
    };
}

interface RecentActivity {
    id: number;
    module: string;
    action: string;
    title: string;
    status: string;
    actor: string;
    created_at: string;
    icon: string;
    color: string;
}

const Dashboard = () => {
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
            const statsResponse = await fetch('/api/dashboard/stats');
            const statsResult = await statsResponse.json();
            if (statsResult.success) {
                setStats(statsResult.data);
            }

            // Load recent activity
            const activityResponse = await fetch('/api/dashboard/recent-activity');
            const activityResult = await activityResponse.json();
            if (activityResult.success) {
                setRecentActivity(activityResult.data);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'under_review': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getModuleIcon = (module: string) => {
        switch (module) {
            case 'Zoning Clearance': return Map;
            case 'Housing Registry': return Home;
            case 'Occupancy Monitoring': return Building2;
            case 'Infrastructure': return Network;
            case 'Building Review': return FileText;
            default: return FileText;
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Prepare chart data
    const moduleData = [
        { name: 'Zoning', total: stats?.zoning.total_applications || 0, pending: stats?.zoning.pending_review || 0, approved: stats?.zoning.approved || 0 },
        { name: 'Building', total: stats?.building.total_reviews || 0, pending: stats?.building.under_review || 0, approved: stats?.building.approved_reviews || 0 },
        { name: 'Housing', total: stats?.housing.total_applications || 0, pending: stats?.housing.pending_review || 0, approved: stats?.housing.approved || 0 },
        { name: 'Occupancy', total: stats?.occupancy.total_occupancies || 0, active: stats?.occupancy.active_occupancies || 0, ended: stats?.occupancy.ended_occupancies || 0 },
        { name: 'Infrastructure', total: stats?.infrastructure.total_projects || 0, active: stats?.infrastructure.active_projects || 0, completed: stats?.infrastructure.completed_projects || 0 }
    ];

    const statusData = [
        { name: 'Pending', value: (stats?.zoning.pending_review || 0) + (stats?.housing.pending_review || 0) + (stats?.building.under_review || 0), color: '#FCD34D' },
        { name: 'Approved', value: (stats?.zoning.approved || 0) + (stats?.housing.approved || 0) + (stats?.building.approved_reviews || 0), color: '#34D399' },
        { name: 'Active', value: (stats?.occupancy.active_occupancies || 0) + (stats?.infrastructure.active_projects || 0), color: '#60A5FA' },
        { name: 'Completed', value: stats?.infrastructure.completed_projects || 0, color: '#A78BFA' }
    ];

    const COLORS = ['#FCD34D', '#34D399', '#60A5FA', '#A78BFA'];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <Header 
                    variant="primary"
                    title="System Overview Dashboard"
                    subtext="Real-time analytics and monitoring across all urban planning modules."
                />
                
                <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-700 px-3 py-2">
                        <span className="font-semibold">{stats?.active_modules || 5}</span> Active Modules
                    </Badge>
                </div>
            </div>

            {/* Key Metrics - Compact Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700">Total Applications</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{stats?.system_health.total_applications || 0}</p>
                            <p className="text-xs text-blue-600 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" /> System-wide
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
                            <p className="text-sm font-medium text-yellow-700">Pending Actions</p>
                            <p className="text-3xl font-bold text-yellow-900 mt-1">{stats?.system_health.pending_actions || 0}</p>
                            <p className="text-xs text-yellow-600 mt-1 flex items-center">
                                <Clock className="w-3 h-3 mr-1" /> Needs attention
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
                            <p className="text-sm font-medium text-green-700">Completed</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">{stats?.system_health.completed_this_month || 0}</p>
                            <p className="text-xs text-green-600 mt-1 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" /> This month
                            </p>
                        </div>
                        <div className="p-3 bg-green-500 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-700">Active Users</p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">{stats?.total_users || 0}</p>
                            <p className="text-xs text-purple-600 mt-1 flex items-center">
                                <Users className="w-3 h-3 mr-1" /> System staff
                            </p>
                        </div>
                        <div className="p-3 bg-purple-500 rounded-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Module Overview Bar Chart */}
                <Card className="p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Module Performance Overview</h3>
                            <p className="text-sm text-gray-600">Applications and projects across all modules</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={moduleData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="total" fill="#3B82F6" name="Total" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="pending" fill="#FBBF24" name="Pending/Active" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="approved" fill="#10B981" name="Approved/Completed" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Status Distribution Pie Chart */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
                            <p className="text-sm text-gray-600">Current system status</p>
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
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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

            {/* Quick Access Modules */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Link href="/zoning" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <div className="p-3 bg-blue-500 rounded-lg mb-2">
                            <Map className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-blue-900">Zoning</span>
                        <span className="text-xs text-blue-600">{stats?.zoning.total_applications || 0} apps</span>
                    </Link>

                    <Link href="/building" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                        <div className="p-3 bg-orange-500 rounded-lg mb-2">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-orange-900">Building</span>
                        <span className="text-xs text-orange-600">{stats?.building.total_reviews || 0} reviews</span>
                    </Link>

                    <Link href="/housing" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <div className="p-3 bg-green-500 rounded-lg mb-2">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-green-900">Housing</span>
                        <span className="text-xs text-green-600">{stats?.housing.total_applications || 0} apps</span>
                    </Link>

                    <Link href="/occupancy" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <div className="p-3 bg-purple-500 rounded-lg mb-2">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-purple-900">Occupancy</span>
                        <span className="text-xs text-purple-600">{stats?.occupancy.total_occupancies || 0} records</span>
                    </Link>

                    <Link href="/infrastructure" className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                        <div className="p-3 bg-indigo-500 rounded-lg mb-2">
                            <Network className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-indigo-900">Infrastructure</span>
                        <span className="text-xs text-indigo-600">{stats?.infrastructure.total_projects || 0} projects</span>
                    </Link>
                </div>
            </Card>

            {/* Recent Activities & System Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities - Takes 2 columns */}
                <Card className="p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Activity Feed</h3>
                        <Link href="/activity-logs" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {recentActivity.length === 0 ? (
                            <div className="text-center py-8">
                                <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No recent activity</p>
                            </div>
                        ) : (
                            recentActivity.map((activity) => {
                                const ModuleIcon = getModuleIcon(activity.module);
                                return (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-all">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <ModuleIcon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 font-medium truncate">{activity.action}</p>
                                            <p className="text-xs text-gray-600 truncate">{activity.title}</p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <Badge className={`${getStatusColor(activity.status)} text-xs px-2 py-0.5`}>
                                                    {activity.status.replace(/_/g, ' ').toUpperCase()}
                                                </Badge>
                                                <span className="text-xs text-gray-500">{activity.module}</span>
                                                <span className="text-xs text-gray-400">• {formatDate(activity.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                {/* System Actions & Quick Links */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link href="/user-management">
                                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">Manage Users</span>
                                </button>
                            </Link>
                            <Link href="/settings">
                                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                                    <Settings className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-900">System Settings</span>
                                </button>
                            </Link>
                            <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                                <BarChart3 className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">View Reports</span>
                            </button>
                        </div>
                    </Card>

                    {/* System Health */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Database Status</span>
                                <Badge className="bg-green-100 text-green-700">Online</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">API Response</span>
                                <Badge className="bg-green-100 text-green-700">Normal</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Last Backup</span>
                                <span className="text-xs text-gray-500">2h ago</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
Dashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Dashboard;