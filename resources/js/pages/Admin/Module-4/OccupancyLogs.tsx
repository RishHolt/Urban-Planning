import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../../components/Card';
import Badge from '../../../components/Badge';
import Table from '../../../components/Table';
import SearchInput from '../../../components/SearchInput';
import Select from '../../../components/Select';
import { 
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  FileText,
  Download,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  Home
} from 'lucide-react';
import Swal from 'sweetalert2';

interface OccupancyLog {
  id: number;
  occupancy_id: number;
  actor_id: number;
  action: string;
  old_status?: string;
  new_status?: string;
  reason?: string;
  note?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  occupancy?: {
    id: number;
    beneficiary_name: string;
    unit_identifier: string;
    status: string;
  };
  actor?: {
    id: number;
    name: string;
    email: string;
  };
}

interface OccupancyLogsProps {
  logs: {
    data: OccupancyLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search: string;
    action: string;
    status: string;
    date_from: string;
    date_to: string;
    actor: string;
  };
}

const OccupancyLogs: React.FC<OccupancyLogsProps> = ({ logs, filters }) => {
  const [search, setSearch] = useState(filters.search || '');
  const [actionFilter, setActionFilter] = useState(filters.action || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');
  const [actorFilter, setActorFilter] = useState(filters.actor || '');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'moved_in', label: 'Moved In' },
    { value: 'moved_out', label: 'Moved Out' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'inspection_scheduled', label: 'Inspection Scheduled' },
    { value: 'inspection_completed', label: 'Inspection Completed' },
    { value: 'inspection_failed', label: 'Inspection Failed' },
    { value: 'deleted', label: 'Deleted' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'ended', label: 'Ended' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'transferred', label: 'Transferred' }
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'moved_in':
        return <Home className="w-4 h-4 text-green-600" />;
      case 'moved_out':
        return <Home className="w-4 h-4 text-orange-600" />;
      case 'terminated':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'inspection_scheduled':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'inspection_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inspection_failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'moved_in':
        return 'bg-green-100 text-green-800';
      case 'moved_out':
        return 'bg-orange-100 text-orange-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'inspection_scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'inspection_completed':
        return 'bg-green-100 text-green-800';
      case 'inspection_failed':
        return 'bg-red-100 text-red-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'ended':
        return 'blue';
      case 'terminated':
        return 'red';
      case 'transferred':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (actionFilter) params.append('action', actionFilter);
    if (statusFilter) params.append('status', statusFilter);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    if (actorFilter) params.append('actor', actorFilter);

    window.location.href = `/admin/occupancy/logs?${params.toString()}`;
  };

  const handleClearFilters = () => {
    setSearch('');
    setActionFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setActorFilter('');
    window.location.href = '/admin/occupancy/logs';
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (actionFilter) params.append('action', actionFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (actorFilter) params.append('actor', actorFilter);
      params.append('export', 'true');

      const response = await fetch(`/api/occupancy/logs/export?${params.toString()}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `occupancy-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        Swal.fire('Error', 'Failed to export logs', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      Swal.fire('Error', 'Failed to export logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: (log: OccupancyLog) => (
        <div className="flex items-center space-x-2">
          {getActionIcon(log.action)}
          <span className="font-medium">{log.action.replace('_', ' ').toUpperCase()}</span>
        </div>
      )
    },
    {
      key: 'occupancy',
      label: 'Occupancy',
      render: (log: OccupancyLog) => (
        <div>
          <div className="font-medium text-gray-900">{log.occupancy?.beneficiary_name || 'N/A'}</div>
          <div className="text-sm text-gray-500">Unit: {log.occupancy?.unit_identifier || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'status_change',
      label: 'Status Change',
      render: (log: OccupancyLog) => (
        <div className="flex items-center space-x-2">
          {log.old_status && (
            <>
              <Badge color={getStatusBadgeColor(log.old_status)}>
                {log.old_status}
              </Badge>
              <span className="text-gray-400">→</span>
            </>
          )}
          {log.new_status && (
            <Badge color={getStatusBadgeColor(log.new_status)}>
              {log.new_status}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'actor',
      label: 'Actor',
      render: (log: OccupancyLog) => (
        <div>
          <div className="font-medium text-gray-900">{log.actor?.name || 'System'}</div>
          <div className="text-sm text-gray-500">{log.actor?.email || ''}</div>
        </div>
      )
    },
    {
      key: 'reason',
      label: 'Reason/Note',
      render: (log: OccupancyLog) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900 truncate">
            {log.reason || log.note || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (log: OccupancyLog) => (
        <div className="text-sm text-gray-600">
          {formatDate(log.created_at)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (log: OccupancyLog) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              Swal.fire({
                title: 'Log Details',
                html: `
                  <div class="text-left space-y-3">
                    <div><strong>Action:</strong> ${log.action.replace('_', ' ').toUpperCase()}</div>
                    <div><strong>Occupancy:</strong> ${log.occupancy?.beneficiary_name || 'N/A'}</div>
                    <div><strong>Unit:</strong> ${log.occupancy?.unit_identifier || 'N/A'}</div>
                    <div><strong>Status Change:</strong> ${log.old_status || 'N/A'} → ${log.new_status || 'N/A'}</div>
                    <div><strong>Actor:</strong> ${log.actor?.name || 'System'}</div>
                    <div><strong>Reason:</strong> ${log.reason || 'N/A'}</div>
                    <div><strong>Note:</strong> ${log.note || 'N/A'}</div>
                    <div><strong>IP Address:</strong> ${log.ip_address || 'N/A'}</div>
                    <div><strong>Date:</strong> ${formatDate(log.created_at)}</div>
                  </div>
                `,
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: 'Close'
              });
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <AppLayout>
      <Head title="Occupancy Logs" />
      
      <div className="space-y-6">
        <Header
          title="Occupancy Logs"
          subtitle="Track all occupancy-related activities and changes"
          icon={FileText}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Activity Logs</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search logs..."
                    onSearch={handleSearch}
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action
                    </label>
                    <Select
                      value={actionFilter}
                      onChange={(value) => setActionFilter(String(value))}
                      options={actionOptions}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <Select
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(String(value))}
                      options={statusOptions}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date From
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date To
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actor
                    </label>
                    <input
                      type="text"
                      value={actorFilter}
                      onChange={(e) => setActorFilter(e.target.value)}
                      placeholder="Actor name or email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Logs Table */}
            <Table
              data={logs.data}
              columns={columns}
              loading={loading}
              emptyMessage="No logs found"
            />

            {/* Pagination */}
            {logs.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((logs.current_page - 1) * logs.per_page) + 1} to{' '}
                  {Math.min(logs.current_page * logs.per_page, logs.total)} of {logs.total} results
                </div>
                <div className="flex items-center space-x-2">
                  {logs.current_page > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        params.set('page', (logs.current_page - 1).toString());
                        window.location.href = `/admin/occupancy/logs?${params.toString()}`;
                      }}
                    >
                      Previous
                    </Button>
                  )}
                  {logs.current_page < logs.last_page && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        params.set('page', (logs.current_page + 1).toString());
                        window.location.href = `/admin/occupancy/logs?${params.toString()}`;
                      }}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OccupancyLogs;
