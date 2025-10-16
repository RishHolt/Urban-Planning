import React from 'react';
import { LayoutDashboard, Map, Building2, Home, Users, Network, FileText, Plus, BarChart3, Settings } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { Header, Button, Card, Badge, Skeleton } from '../../components';

const Dashboard = () => {
    const stats = [
        {
            title: 'Zoning Applications',
            value: '24',
            change: '+12%',
            icon: Map,
            color: 'bg-primary',
            textColor: 'text-primary'
        },
        {
            title: 'Building Reviews',
            value: '18',
            change: '+8%',
            icon: Building2,
            color: 'bg-secondary',
            textColor: 'text-secondary'
        },
        {
            title: 'Housing Units',
            value: '156',
            change: '+5%',
            icon: Home,
            color: 'bg-accent',
            textColor: 'text-accent'
        },
        {
            title: 'Active Users',
            value: '42',
            change: '+15%',
            icon: Users,
            color: 'bg-success',
            textColor: 'text-success'
        }
    ];

    const recentActivities = [
        { id: 1, action: 'New zoning application submitted', module: 'Zoning Clearance', time: '2 hours ago' },
        { id: 2, action: 'Building permit approved', module: 'Building Review', time: '4 hours ago' },
        { id: 3, action: 'Housing unit assigned', module: 'Housing Registry', time: '6 hours ago' },
        { id: 4, action: 'Infrastructure project updated', module: 'Infrastructure', time: '8 hours ago' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <Header 
                variant="primary"
                title="Welcome to Urban Planning System"
                subtext="Manage zoning, building reviews, housing, and infrastructure projects efficiently."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={index}
                            stats
                            title={stat.title}
                            value={stat.value}
                            change={stat.change}
                            icon={<Icon size={24} />}
                            iconColor={stat.color}
                            hoverable
                        />
                    );
                })}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card title="Recent Activities" hoverable>
                    <div className="space-y-3">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="default" size="sm">{activity.module}</Badge>
                                        <span className="text-xs text-gray-500">{activity.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="Quick Actions" hoverable>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="primary" leftIcon={<Plus size={16} />} fullWidth>
                            New Application
                        </Button>
                        <Button variant="secondary" leftIcon={<BarChart3 size={16} />} fullWidth>
                            View Reports
                        </Button>
                        <Button variant="accent" leftIcon={<Users size={16} />} fullWidth>
                            Manage Users
                        </Button>
                        <Button variant="outlined" leftIcon={<Settings size={16} />} fullWidth>
                            Settings
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
Dashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default Dashboard;