import { Building2, FileText, CheckCircle, AlertTriangle, Clock, Plus, Search } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import SearchInput from '../../../components/SearchInput';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Table from '../../../components/Table';

const BuildingDashboard = () => {
    const reviews = [
        { id: 1, project: 'Office Complex A', contractor: 'ABC Construction', status: 'Under Review', priority: 'High', date: '2024-01-15' },
        { id: 2, project: 'Residential Tower B', contractor: 'XYZ Builders', status: 'Approved', priority: 'Medium', date: '2024-01-14' },
        { id: 3, project: 'Shopping Mall C', contractor: 'DEF Developers', status: 'Pending', priority: 'Low', date: '2024-01-13' },
        { id: 4, project: 'Industrial Plant D', contractor: 'GHI Industries', status: 'Rejected', priority: 'High', date: '2024-01-12' },
    ];

    const statusColors = {
        'Pending': 'bg-warning text-warning',
        'Approved': 'bg-success text-success',
        'Under Review': 'bg-info text-info',
        'Rejected': 'bg-error text-error'
    };

    const priorityColors = {
        'High': 'bg-error text-error',
        'Medium': 'bg-warning text-warning',
        'Low': 'bg-success text-success'
    };

    return (
        <div className="space-y-6">
                {/* Page Header */}
                <div className="flex-shrink-0 mb-4 pb-2">
                    <div className="flex justify-between">
                        <Header 
                            variant="accent"
                            title="Building Review Dashboard"
                            subtext="Monitor building permits and construction compliance."
                        />
                        
                        {/* Controls next to header */}
                        <div className="flex items-center gap-3">
                            <Button variant="accent" icon={<Plus size={16} />}>
                                New Review
                            </Button>
                            <div className="flex items-center bg-white px-3 py-2 border rounded-md text-gray-600 text-sm">
                                <strong>Total Reviews:</strong> <span className="ml-1 font-semibold text-blue-600">{reviews.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchInput
                            placeholder="Search projects..."
                            className="w-64"
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card
                        variant="default"
                        title="Total Reviews"
                        value="18"
                        icon={<FileText size={24} />}
                        iconColor="bg-accent"
                    />
                    <Card
                        variant="default"
                        title="Under Review"
                        value="6"
                        icon={<Clock size={24} />}
                        iconColor="bg-info"
                    />
                    <Card
                        variant="default"
                        title="Approved"
                        value="10"
                        icon={<CheckCircle size={24} />}
                        iconColor="bg-success"
                    />
                    <Card
                        variant="default"
                        title="High Priority"
                        value="3"
                        icon={<AlertTriangle size={24} />}
                        iconColor="bg-error"
                    />
                </div>

                {/* Reviews Table */}
                <Card title="Building Reviews" className="p-6">
                    <Table
                        columns={[
                            { key: 'id', label: 'ID', render: (value) => `#${value}` },
                            { key: 'project', label: 'Project' },
                            { key: 'contractor', label: 'Contractor' },
                            { 
                                key: 'priority', 
                                label: 'Priority', 
                                render: (value) => (
                                    <span className={`px-2 py-1 rounded-theme-sm text-xs font-medium ${priorityColors[value as keyof typeof priorityColors]}`}>
                                        {value}
                                    </span>
                                )
                            },
                            { 
                                key: 'status', 
                                label: 'Status', 
                                render: (value) => (
                                    <span className={`px-2 py-1 rounded-theme-sm text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
                                        {value}
                                    </span>
                                )
                            },
                            { key: 'date', label: 'Date' },
                            { 
                                key: 'actions', 
                                label: 'Actions', 
                                render: () => (
                                    <button className="text-accent hover:text-accent-dark text-sm font-medium">
                                        View Details
                                    </button>
                                )
                            }
                        ]}
                        data={reviews}
                    />
                </Card>
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
BuildingDashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default BuildingDashboard;
