import { Network, Wrench, Building2, FileText, Plus, Search, MapPin } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import Header from '../../components/Header';
import SearchInput from '../../components/SearchInput';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Table from '../../components/Table';

const InfrastructureDashboard = () => {
    const projects = [
        { id: 1, name: 'Road Widening Project', status: 'In Progress', priority: 'High', budget: '$2.5M', completion: 65 },
        { id: 2, name: 'Water System Upgrade', status: 'Planning', priority: 'Medium', budget: '$1.8M', completion: 20 },
        { id: 3, name: 'Bridge Construction', status: 'Completed', priority: 'High', budget: '$5.2M', completion: 100 },
        { id: 4, name: 'Sewer Line Extension', status: 'On Hold', priority: 'Low', budget: '$3.1M', completion: 40 },
    ];

    const statusColors = {
        'In Progress': 'bg-info text-info',
        'Planning': 'bg-warning text-warning',
        'Completed': 'bg-success text-success',
        'On Hold': 'bg-error text-error'
    };

    const priorityColors = {
        'High': 'bg-error text-error',
        'Medium': 'bg-warning text-warning',
        'Low': 'bg-success text-success'
    };

    return (
        <div className="space-y-6">
                {/* Page Header */}
                <Header 
                    variant="secondary"
                    title="Infrastructure Dashboard"
                    subtext="Manage infrastructure projects and asset maintenance."
                />

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchInput
                            placeholder="Search projects..."
                            className="w-64"
                        />
                    </div>
                    <Button variant="secondary" icon={<Plus size={16} />}>
                        New Project
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card
                        variant="stats"
                        title="Active Projects"
                        value="12"
                        icon={<Network size={24} />}
                        iconColor="bg-secondary"
                    />
                    <Card
                        variant="stats"
                        title="Maintenance Tasks"
                        value="8"
                        icon={<Wrench size={24} />}
                        iconColor="bg-warning"
                    />
                    <Card
                        variant="stats"
                        title="Total Budget"
                        value="$15.2M"
                        icon={<Building2 size={24} />}
                        iconColor="bg-success"
                    />
                    <Card
                        variant="stats"
                        title="Completed"
                        value="24"
                        icon={<FileText size={24} />}
                        iconColor="bg-info"
                    />
                </div>

                {/* Projects Table */}
                <Card title="Infrastructure Projects" className="p-6">
                    <Table
                        columns={[
                            { key: 'name', label: 'Project' },
                            { 
                                key: 'status', 
                                label: 'Status', 
                                render: (value) => (
                                    <span className={`px-2 py-1 rounded-theme-sm text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
                                        {value}
                                    </span>
                                )
                            },
                            { 
                                key: 'priority', 
                                label: 'Priority', 
                                render: (value) => (
                                    <span className={`px-2 py-1 rounded-theme-sm text-xs font-medium ${priorityColors[value as keyof typeof priorityColors]}`}>
                                        {value}
                                    </span>
                                )
                            },
                            { key: 'budget', label: 'Budget' },
                            { 
                                key: 'completion', 
                                label: 'Progress', 
                                render: (value) => (
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-surface-variant rounded-full h-2">
                                            <div 
                                                className="bg-secondary h-2 rounded-full" 
                                                style={{ width: `${value}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-muted">{value}%</span>
                                    </div>
                                )
                            },
                            { 
                                key: 'actions', 
                                label: 'Actions', 
                                render: () => (
                                    <button className="text-secondary hover:text-secondary-dark text-sm font-medium">
                                        View Details
                                    </button>
                                )
                            }
                        ]}
                        data={projects}
                    />
                </Card>
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
InfrastructureDashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default InfrastructureDashboard;
