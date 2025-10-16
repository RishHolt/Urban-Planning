import { Users, FileText, CheckCircle, AlertTriangle, Plus, Search } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Header from '../components/Header';
import SearchInput from '../components/SearchInput';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';

const OccupancyDashboard = () => {
    const violations = [
        { id: 1, property: '123 Main St', type: 'Overcrowding', status: 'Open', severity: 'High', date: '2024-01-15' },
        { id: 2, property: '456 Oak Ave', type: 'Unauthorized Use', status: 'Resolved', severity: 'Medium', date: '2024-01-14' },
        { id: 3, property: '789 Pine Rd', type: 'Zoning Violation', status: 'Under Review', severity: 'Low', date: '2024-01-13' },
    ];

    const statusColors = {
        'Open': 'bg-error text-error',
        'Resolved': 'bg-success text-success',
        'Under Review': 'bg-warning text-warning'
    };

    const severityColors = {
        'High': 'bg-error text-error',
        'Medium': 'bg-warning text-warning',
        'Low': 'bg-info text-info'
    };

    return (
        <div className="space-y-6">
                {/* Page Header */}
                <Header 
                    variant="secondary"
                    title="Occupancy Monitoring Dashboard"
                    subtext="Monitor occupancy compliance and violations."
                />

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchInput
                            placeholder="Search violations..."
                            className="w-64"
                        />
                    </div>
                    <Button variant="primary" icon={<Plus size={16} />}>
                        New Report
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card
                        variant="stats"
                        title="Total Violations"
                        value="24"
                        icon={<AlertTriangle size={24} />}
                        iconColor="bg-error"
                    />
                    <Card
                        variant="stats"
                        title="Open Cases"
                        value="8"
                        icon={<FileText size={24} />}
                        iconColor="bg-warning"
                    />
                    <Card
                        variant="stats"
                        title="Resolved"
                        value="12"
                        icon={<CheckCircle size={24} />}
                        iconColor="bg-success"
                    />
                    <Card
                        variant="stats"
                        title="High Priority"
                        value="4"
                        icon={<Users size={24} />}
                        iconColor="bg-error"
                    />
                </div>

                {/* Violations Table */}
                <Card title="Recent Violations" className="p-6">
                    <Table
                        columns={[
                            { key: 'id', label: 'ID', render: (value) => `#${value}` },
                            { key: 'property', label: 'Property' },
                            { key: 'type', label: 'Type' },
                            { 
                                key: 'severity', 
                                label: 'Severity', 
                                render: (value) => (
                                    <span className={`px-2 py-1 rounded-theme-sm text-xs font-medium ${severityColors[value as keyof typeof severityColors]}`}>
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
                                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                                        View Details
                                    </button>
                                )
                            }
                        ]}
                        data={violations}
                    />
                </Card>
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
OccupancyDashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default OccupancyDashboard;
