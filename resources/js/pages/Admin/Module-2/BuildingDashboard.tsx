import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Building2, FileText, CheckCircle, AlertTriangle, Clock, Plus, Search, Eye, Settings, History as HistoryIcon, TrendingUp, Calendar, BarChart3, ArrowRight } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import SearchInput from '../../../components/SearchInput';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Table from '../../../components/Table';
import Badge from '../../../components/Badge';
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
  total_reviews: number;
  under_review: number;
  approved_reviews: number;
  rejected_reviews: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  average_review_time: number;
  recent_reviews: number;
  reviews_this_month: number;
  compliance_rate: number;
  status_breakdown: Record<string, number>;
  priority_breakdown: Record<string, number>;
}

interface RecentReview {
  id: number;
  project_name: string;
  contractor: string;
  status: string;
  priority: string;
  submitted_at: string;
  reviewer: string | null;
  estimated_completion?: string;
  approved_at?: string;
  rejected_at?: string;
}

const BuildingDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Load stats
            const statsResponse = await fetch('/api/building/dashboard/stats');
            const statsResult = await statsResponse.json();
            if (statsResult.success) {
                setStats(statsResult.data);
            }

            // Load recent reviews
            const reviewsResponse = await fetch('/api/building/reviews?per_page=5');
            const reviewsResult = await reviewsResponse.json();
            if (reviewsResult.success) {
                setRecentReviews(reviewsResult.data.data || []);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
            under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
            approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
            rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
            on_hold: { label: 'On Hold', color: 'bg-gray-100 text-gray-800' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig = {
            high: { label: 'High', color: 'bg-red-100 text-red-800' },
            medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
            low: { label: 'Low', color: 'bg-green-100 text-green-800' },
        };

        const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
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
            title: 'View All Reviews',
            description: 'Browse all building reviews',
            icon: FileText,
            href: '/building/review',
            color: 'bg-blue-50 border-blue-200 text-blue-800'
        },
        {
            title: 'New Review',
            description: 'Start a new building review',
            icon: Plus,
            href: '/building/review?action=create',
            color: 'bg-green-50 border-green-200 text-green-800'
        },
        {
            title: 'High Priority Queue',
            description: 'Reviews requiring immediate attention',
            icon: AlertTriangle,
            href: '/building/review?priority=high',
            color: 'bg-red-50 border-red-200 text-red-800'
        },
        {
            title: 'Activity Logs',
            description: 'View all review activities',
            icon: HistoryIcon,
            href: '/building/logs',
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
        { name: 'Under Review', value: stats?.under_review || 0, color: '#FBBF24' },
        { name: 'Approved', value: stats?.approved_reviews || 0, color: '#10B981' },
        { name: 'Rejected', value: stats?.rejected_reviews || 0, color: '#EF4444' },
    ];

    const priorityData = [
        { name: 'High', value: stats?.high_priority || 0, color: '#EF4444' },
        { name: 'Medium', value: stats?.medium_priority || 0, color: '#FBBF24' },
        { name: 'Low', value: stats?.low_priority || 0, color: '#10B981' }
    ];

    const COLORS = ['#FBBF24', '#10B981', '#EF4444'];
    const PRIORITY_COLORS = ['#EF4444', '#FBBF24', '#10B981'];

    return (
        <div className="space-y-6">
            <Head title="Building Review Dashboard" />
            
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <Header 
                    variant="secondary"
                    title="Building Review Dashboard"
                    subtext="Monitor building permits and construction compliance."
                />
                
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => window.location.href = '/building/review'}
                        variant="outlined" 
                        leftIcon={<Eye size={16} />}
                    >
                        View All
                    </Button>
                    <Button 
                        onClick={() => window.location.href = '/building/review?action=create'}
                        leftIcon={<Plus size={16} />}
                    >
                        New Review
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-700">Total Reviews</p>
                            <p className="text-3xl font-bold text-orange-900 mt-1">{stats?.total_reviews || 0}</p>
                            <p className="text-xs text-orange-600 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" /> All time
                            </p>
                        </div>
                        <div className="p-3 bg-orange-500 rounded-lg">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700">Under Review</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{stats?.under_review || 0}</p>
                            <p className="text-xs text-blue-600 mt-1 flex items-center">
                                <Clock className="w-3 h-3 mr-1" /> In progress
                            </p>
                        </div>
                        <div className="p-3 bg-blue-500 rounded-lg">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-700">Approved</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">{stats?.approved_reviews || 0}</p>
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
                            <p className="text-sm font-medium text-red-700">High Priority</p>
                            <p className="text-3xl font-bold text-red-900 mt-1">{stats?.high_priority || 0}</p>
                            <p className="text-xs text-red-600 mt-1 flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Urgent
                            </p>
                        </div>
                        <div className="p-3 bg-red-500 rounded-lg">
                            <AlertTriangle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Review Status</h3>
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

                {/* Priority Distribution Pie Chart */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Priority Distribution</h3>
                            <p className="text-sm text-gray-600">Reviews by priority level</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={priorityData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(props: any) => `${((props.percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {priorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
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
                        <h3 className="text-lg font-semibold">Review Time</h3>
                        <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{stats?.average_review_time || 0}</div>
                    <p className="text-sm text-muted-foreground">Average days to review</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">This Month</h3>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{stats?.reviews_this_month || 0}</div>
                    <p className="text-sm text-muted-foreground">Reviews completed</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Compliance Rate</h3>
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold">{stats?.compliance_rate || 0}%</div>
                    <p className="text-sm text-muted-foreground">Overall compliance</p>
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

                {/* Recent Reviews */}
                <div>
                    <div className="mb-6">
                        <h3 className="flex items-center space-x-2 text-lg font-semibold">
                            <Clock className="w-5 h-5" />
                            <span>Recent Reviews</span>
                        </h3>
                        <p className="text-sm text-gray-600">
                            Latest building reviews
                        </p>
                    </div>
                    <Card className="p-6">
                        {recentReviews.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No recent reviews</p>
                        ) : (
                            <div className="space-y-4">
                                {recentReviews.map((review) => (
                                    <div key={review.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium text-sm">{review.project_name}</span>
                                                {getStatusBadge(review.status)}
                                                {getPriorityBadge(review.priority)}
                                            </div>
                                            <p className="text-sm text-gray-600">{review.contractor}</p>
                                            <p className="text-xs text-gray-500">
                                                {review.reviewer ? `Reviewer: ${review.reviewer}` : 'Unassigned'} • {formatDate(review.submitted_at)}
                                            </p>
                                        </div>
                                        <Link href={`/building/review/${review.id}`}>
                                            <Button variant="outlined" size="sm">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t">
                            <Link href="/building/review">
                                <Button variant="outlined" className="w-full">
                                    View All Reviews
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Status & Priority Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <div className="mb-6">
                        <h3 className="flex items-center space-x-2 text-lg font-semibold">
                            <BarChart3 className="w-5 h-5" />
                            <span>Status Overview</span>
                        </h3>
                        <p className="text-sm text-gray-600">
                            Distribution of reviews by status
                        </p>
                    </div>
                    <Card className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

                <div>
                    <div className="mb-6">
                        <h3 className="flex items-center space-x-2 text-lg font-semibold">
                            <AlertTriangle className="w-5 h-5" />
                            <span>Priority Overview</span>
                        </h3>
                        <p className="text-sm text-gray-600">
                            Distribution of reviews by priority
                        </p>
                    </div>
                    <Card className="p-6">
                        <div className="grid grid-cols-3 gap-4">
                            {stats?.priority_breakdown && Object.entries(stats.priority_breakdown).map(([priority, count]) => (
                                <div key={priority} className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                                    <div className="text-sm text-gray-600 capitalize">
                                        {priority}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
BuildingDashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default BuildingDashboard;
