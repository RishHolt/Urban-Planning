import { Map, FileText, MapPin, CheckCircle, Plus, Search, Filter } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Header from '../components/Header';
import SearchInput from '../components/SearchInput';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';

const ZoningDashboard = () => {
    const applications = [
        { id: 1, applicant: 'John Doe', property: '123 Main St', status: 'Pending', date: '2024-01-15', type: 'Residential' },
        { id: 2, applicant: 'Jane Smith', property: '456 Oak Ave', status: 'Approved', date: '2024-01-14', type: 'Commercial' },
        { id: 3, applicant: 'Bob Johnson', property: '789 Pine Rd', status: 'Under Review', date: '2024-01-13', type: 'Industrial' },
        { id: 4, applicant: 'Alice Brown', property: '321 Elm St', status: 'Rejected', date: '2024-01-12', type: 'Residential' },
    ];

    const statusColors = {
        'Pending': 'bg-warning text-warning',
        'Approved': 'bg-success text-success',
        'Under Review': 'bg-info text-info',
        'Rejected': 'bg-error text-error'
    };

    return (
        <div className="space-y-6">
                {/* Page Header */}
                <Header 
                    variant="secondary"
                    title="Zoning Clearance Dashboard"
                    subtext="Manage zoning applications and compliance reviews."
                />

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchInput
                            placeholder="Search applications..."
                            className="w-64"
                        />
                        <Button className="bg-surface-variant text-primary hover:bg-primary/10" icon={<Filter size={16} />}>
                            Filter
                        </Button>
                    </div>
                    <Button variant="primary" icon={<Plus size={16} />}>
                        New Application
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card
                        variant="stats"
                        title="Total Applications"
                        value="24"
                        icon={<FileText size={24} />}
                        iconColor="bg-primary"
                    />
                    <Card
                        variant="stats"
                        title="Pending Review"
                        value="8"
                        icon={<CheckCircle size={24} />}
                        iconColor="bg-warning"
                    />
                    <Card
                        variant="stats"
                        title="Approved"
                        value="12"
                        icon={<MapPin size={24} />}
                        iconColor="bg-success"
                    />
                    <Card
                        variant="stats"
                        title="Rejected"
                        value="4"
                        icon={<Map size={24} />}
                        iconColor="bg-error"
                    />
                </div>

                {/* Applications Table */}
                <Card title="Recent Applications" className="p-6">
                    <Table
                        columns={[
                            { key: 'id', label: 'ID', render: (value) => `#${value}` },
                            { key: 'applicant', label: 'Applicant' },
                            { key: 'property', label: 'Property' },
                            { key: 'type', label: 'Type' },
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
                                    <button className="text-secondary hover:text-secondary-dark text-sm font-medium">
                                        View Details
                                    </button>
                                )
                            }
                        ]}
                        data={applications}
                    />
                </Card>
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
ZoningDashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default ZoningDashboard;
