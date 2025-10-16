import React from 'react';
import { LayoutDashboard, Map, Building2, Home, Users, Network, FileText } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';

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
                            variant="stats"
                            title={stat.title}
                            value={stat.value}
                            change={stat.change}
                            icon={<Icon size={24} />}
                            iconColor={stat.color}
                        />
                    );
                })}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card title="Recent Activities" className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText size={20} className="text-primary" />
                        <h3 className="text-lg font-semibold text-primary">Recent Activities</h3>
                    </div>
                    <div className="space-y-3">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 bg-surface-variant rounded-theme-md">
                                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-primary font-medium">{activity.action}</p>
                                    <p className="text-xs text-muted">{activity.module} • {activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="Quick Actions" className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Network size={20} className="text-primary" />
                        <h3 className="text-lg font-semibold text-primary">Quick Actions</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="primary">New Application</Button>
                        <Button variant="secondary">View Reports</Button>
                        <Button variant="accent">Manage Users</Button>
                        <Button className="bg-surface-variant text-primary hover:bg-primary/10">
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