import { Home, Users, UserPlus, Building, FileText, Plus, Search, MapPin } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Header from '../components/Header';
import SearchInput from '../components/SearchInput';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';

const HousingDashboard = () => {
    const beneficiaries = [
        { id: 1, name: 'Maria Santos', familySize: 4, income: '$25,000', status: 'Approved', unit: 'Unit 101' },
        { id: 2, name: 'Juan Dela Cruz', familySize: 3, income: '$20,000', status: 'Pending', unit: '-' },
        { id: 3, name: 'Ana Rodriguez', familySize: 5, income: '$30,000', status: 'Approved', unit: 'Unit 205' },
        { id: 4, name: 'Carlos Lopez', familySize: 2, income: '$18,000', status: 'Under Review', unit: '-' },
    ];

    const statusColors = {
        'Approved': 'bg-success text-success',
        'Pending': 'bg-warning text-warning',
        'Under Review': 'bg-info text-info',
        'Rejected': 'bg-error text-error'
    };

    return (
        <div className="space-y-6">
                {/* Page Header */}
                <Header 
                    variant="primary"
                    title="Housing Registry Dashboard"
                    subtext="Manage housing applications and beneficiary assignments."
                />

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchInput
                            placeholder="Search beneficiaries..."
                            className="w-64"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={<UserPlus size={16} />}>
                            New Application
                        </Button>
                        <Button variant="primary" icon={<Plus size={16} />}>
                            Add Unit
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card
                        variant="stats"
                        title="Total Applications"
                        value="156"
                        icon={<FileText size={24} />}
                        iconColor="bg-primary"
                    />
                    <Card
                        variant="stats"
                        title="Approved"
                        value="98"
                        icon={<Users size={24} />}
                        iconColor="bg-success"
                    />
                    <Card
                        variant="stats"
                        title="Available Units"
                        value="42"
                        icon={<Home size={24} />}
                        iconColor="bg-info"
                    />
                    <Card
                        variant="stats"
                        title="Pending Review"
                        value="16"
                        icon={<Building size={24} />}
                        iconColor="bg-warning"
                    />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Beneficiaries Table */}
                    <Card title="Recent Applications" className="p-6">
                        <Table
                            columns={[
                                { key: 'name', label: 'Name', render: (value) => <span className="text-primary font-medium">{value}</span> },
                                { key: 'familySize', label: 'Family', render: (value) => `${value} members` },
                                { key: 'income', label: 'Income' },
                                { 
                                    key: 'status', 
                                    label: 'Status', 
                                    render: (value) => (
                                        <span className={`px-2 py-1 rounded-theme-sm text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
                                            {value}
                                        </span>
                                    )
                                },
                                { key: 'unit', label: 'Unit' }
                            ]}
                            data={beneficiaries}
                        />
                    </Card>

                    {/* Housing Units Map */}
                    <Card title="Housing Units Overview" className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin size={20} className="text-primary" />
                            <h3 className="text-lg font-semibold text-primary">Housing Units Overview</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-surface-variant p-4 rounded-theme-md">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-primary">Building A</span>
                                    <span className="text-xs text-muted">24 units</span>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 bg-success rounded-sm"></div>
                                    <div className="w-3 h-3 bg-success rounded-sm"></div>
                                    <div className="w-3 h-3 bg-warning rounded-sm"></div>
                                    <div className="w-3 h-3 bg-success rounded-sm"></div>
                                    <div className="w-3 h-3 bg-success rounded-sm"></div>
                                    <div className="w-3 h-3 bg-success rounded-sm"></div>
                                </div>
                                <p className="text-xs text-muted mt-2">20 occupied, 4 available</p>
                            </div>
                            <div className="bg-surface-variant p-4 rounded-theme-md">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-primary">Building B</span>
                                    <span className="text-xs text-muted">18 units</span>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 bg-success rounded-sm"></div>
                                    <div className="w-3 h-3 bg-success rounded-sm"></div>
                                    <div className="w-3 h-3 bg-success rounded-sm"></div>
                                    <div className="w-3 h-3 bg-warning rounded-sm"></div>
                                    <div className="w-3 h-3 bg-success rounded-sm"></div>
                                    <div className="w-3 h-3 bg-success rounded-sm"></div>
                                </div>
                                <p className="text-xs text-muted mt-2">17 occupied, 1 available</p>
                            </div>
                        </div>
                    </Card>
                </div>
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
HousingDashboard.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default HousingDashboard;
