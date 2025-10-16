import { Users, UserPlus, Settings, Shield, Plus, Search, Edit, Trash2 } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import Header from '../../components/Header';
import SearchInput from '../../components/SearchInput';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Table from '../../components/Table';

const UserManagement = () => {
    const users = [
        { id: 1, name: 'John Admin', email: 'john@admin.com', role: 'IT_ADMIN', status: 'Active', lastLogin: '2024-01-15' },
        { id: 2, name: 'Jane Zoning', email: 'jane@zoning.com', role: 'ZONING_ADMIN', status: 'Active', lastLogin: '2024-01-14' },
        { id: 3, name: 'Bob Building', email: 'bob@building.com', role: 'BUILDING_OFFICER', status: 'Inactive', lastLogin: '2024-01-10' },
        { id: 4, name: 'Alice Housing', email: 'alice@housing.com', role: 'ZONING_OFFICER', status: 'Active', lastLogin: '2024-01-13' },
    ];

    const statusColors = {
        'Active': 'bg-success text-success',
        'Inactive': 'bg-error text-error',
        'Pending': 'bg-warning text-warning'
    };

    const roleColors = {
        'IT_ADMIN': 'bg-primary text-primary',
        'ZONING_ADMIN': 'bg-secondary text-secondary',
        'BUILDING_ADMIN': 'bg-accent text-accent',
        'BUILDING_OFFICER': 'bg-info text-info',
        'ZONING_OFFICER': 'bg-warning text-warning'
    };

    return (
        <div className="space-y-6">
                {/* Page Header */}
                <Header 
                    variant="primary"
                    title="User Management"
                    subtext="Manage system users and their permissions."
                />

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchInput
                            placeholder="Search users..."
                            className="w-64"
                        />
                    </div>
                    <Button variant="primary" icon={<UserPlus size={16} />}>
                        Add User
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card
                        variant="stats"
                        title="Total Users"
                        value="42"
                        icon={<Users size={24} />}
                        iconColor="bg-primary"
                    />
                    <Card
                        variant="stats"
                        title="Active Users"
                        value="38"
                        icon={<Shield size={24} />}
                        iconColor="bg-success"
                    />
                    <Card
                        variant="stats"
                        title="Admins"
                        value="8"
                        icon={<Settings size={24} />}
                        iconColor="bg-secondary"
                    />
                    <Card
                        variant="stats"
                        title="Officers"
                        value="34"
                        icon={<UserPlus size={24} />}
                        iconColor="bg-info"
                    />
                </div>

                {/* Users Table */}
                <Card title="System Users" className="p-6">
                    <Table
                        columns={[
                            { key: 'name', label: 'Name' },
                            { key: 'email', label: 'Email' },
                            { 
                                key: 'role', 
                                label: 'Role', 
                                render: (value) => (
                                    <span className={`px-2 py-1 rounded-theme-sm text-xs font-medium ${roleColors[value as keyof typeof roleColors]}`}>
                                        {value.replace('_', ' ')}
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
                            { key: 'lastLogin', label: 'Last Login' },
                            { 
                                key: 'actions', 
                                label: 'Actions', 
                                render: () => (
                                    <div className="flex gap-2">
                                        <button className="text-secondary hover:text-secondary-dark text-sm font-medium">
                                            <Edit size={16} />
                                        </button>
                                        <button className="text-error hover:text-error-dark text-sm font-medium">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )
                            }
                        ]}
                        data={users}
                    />
                </Card>
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
UserManagement.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default UserManagement;
