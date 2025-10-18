import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Settings, Shield, Plus, Search, Edit, Trash2, Filter, Download, RefreshCw, MoreVertical, Mail, Phone, Calendar } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import Header from '../../components/Header';
import SearchInput from '../../components/SearchInput';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Badge from '../../components/Badge';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string;
}

interface UserStats {
    total_users: number;
    active_users: number;
    admins: number;
    officers: number;
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            
            // Load users
            const usersResponse = await fetch('/api/users');
            const usersResult = await usersResponse.json();
            if (usersResult.success) {
                setUsers(usersResult.data);
            }

            // Load stats
            const statsResponse = await fetch('/api/users/stats');
            const statsResult = await statsResponse.json();
            if (statsResult.success) {
                setStats(statsResult.data);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const statusColors = {
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-gray-100 text-gray-800',
        'Pending': 'bg-yellow-100 text-yellow-800'
    };

    const roleColors = {
        'IT_ADMIN': 'bg-purple-100 text-purple-800',
        'ZONING_ADMIN': 'bg-blue-100 text-blue-800',
        'BUILDING_ADMIN': 'bg-orange-100 text-orange-800',
        'HOUSING_ADMIN': 'bg-green-100 text-green-800',
        'INFRASTRUCTURE_ADMIN': 'bg-indigo-100 text-indigo-800',
        'ZONING_OFFICER': 'bg-blue-50 text-blue-700',
        'BUILDING_OFFICER': 'bg-orange-50 text-orange-700',
        'HOUSING_OFFICER': 'bg-green-50 text-green-700',
        'INFRASTRUCTURE_OFFICER': 'bg-indigo-50 text-indigo-700'
    };

    const getRoleLabel = (role: string) => {
        return role.replace(/_/g, ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <Header 
                    variant="primary"
                    title="User Management"
                    subtext="Manage system users, roles, and permissions across all modules."
                />
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outlined" 
                        leftIcon={<RefreshCw size={16} />}
                        onClick={loadUserData}
                    >
                        Refresh
                    </Button>
                    <Button variant="primary" leftIcon={<UserPlus size={16} />}>
                        Add New User
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700">Total Users</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{stats?.total_users || 0}</p>
                            <p className="text-xs text-blue-600 mt-1">System staff only</p>
                        </div>
                        <div className="p-3 bg-blue-500 rounded-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-700">Active Users</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">{stats?.active_users || 0}</p>
                            <p className="text-xs text-green-600 mt-1">Currently active</p>
                        </div>
                        <div className="p-3 bg-green-500 rounded-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-700">Administrators</p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">{stats?.admins || 0}</p>
                            <p className="text-xs text-purple-600 mt-1">Admin roles</p>
                        </div>
                        <div className="p-3 bg-purple-500 rounded-lg">
                            <Settings className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-700">Officers</p>
                            <p className="text-3xl font-bold text-orange-900 mt-1">{stats?.officers || 0}</p>
                            <p className="text-xs text-orange-600 mt-1">Officer roles</p>
                        </div>
                        <div className="p-3 bg-orange-500 rounded-lg">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters and Search - Compact */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
                        />
                    </div>
                    
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                        <option value="all">All Roles</option>
                        <option value="IT_ADMIN">IT Admin</option>
                        <option value="ZONING_ADMIN">Zoning Admin</option>
                        <option value="BUILDING_ADMIN">Building Admin</option>
                        <option value="HOUSING_ADMIN">Housing Admin</option>
                        <option value="INFRASTRUCTURE_ADMIN">Infrastructure Admin</option>
                        <option value="ZONING_OFFICER">Zoning Officer</option>
                        <option value="BUILDING_OFFICER">Building Officer</option>
                        <option value="HOUSING_OFFICER">Housing Officer</option>
                        <option value="INFRASTRUCTURE_OFFICER">Infrastructure Officer</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                        {filteredUsers.length} of {users.length} users
                    </span>
                    <Button variant="outlined" size="sm" leftIcon={<Download size={14} />}>
                        Export
                    </Button>
                </div>
            </div>

            {/* Users Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500">No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className={`${roleColors[user.role as keyof typeof roleColors]} px-3 py-1.5 text-xs font-medium`}>
                                                {getRoleLabel(user.role)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className={`${statusColors[user.status as keyof typeof statusColors]} px-3 py-1.5 text-xs font-medium`}>
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {user.lastLogin}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit user"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                    title="More options"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Page 1 of 1
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outlined" size="sm" disabled>
                                    Previous
                                </Button>
                                <Button variant="outlined" size="sm" disabled>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

// Add default layout for persistent sidebar/topnav
UserManagement.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default UserManagement;
