import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { 
  History,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronRight,
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Home,
  DollarSign,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface LogEntry {
  id: number;
  application_id: number;
  actor_id: number;
  action: string;
  old_status?: string;
  new_status?: string;
  reason?: string;
  note?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  actor: {
    name: string;
    email: string;
    role: string;
  };
  application: {
    application_number: string;
    full_name: string;
    program_type: string;
    status: string;
  };
}

interface FilterOptions {
  action: string;
  actor: string;
  date_from: string;
  date_to: string;
  application_status: string;
  program_type: string;
}

const HousingLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    action: 'all',
    actor: 'all',
    date_from: '',
    date_to: '',
    application_status: 'all',
    program_type: 'all'
  });
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total_logs: 0,
    today_logs: 0,
    unique_actors: 0,
    applications_processed: 0
  });

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [searchTerm, filters, currentPage]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.action !== 'all') params.append('action', filters.action);
      if (filters.actor !== 'all') params.append('actor_id', filters.actor);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.application_status !== 'all') params.append('application_status', filters.application_status);
      if (filters.program_type !== 'all') params.append('program_type', filters.program_type);
      params.append('page', currentPage.toString());

      const response = await fetch(`/api/housing/logs?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setLogs(result.data || []);
        setTotalPages(result.meta?.last_page || 1);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/housing/logs/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data || stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.action !== 'all') params.append('action', filters.action);
      if (filters.actor !== 'all') params.append('actor_id', filters.actor);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.application_status !== 'all') params.append('application_status', filters.application_status);
      if (filters.program_type !== 'all') params.append('program_type', filters.program_type);

      const response = await fetch(`/api/housing/logs/export?${params.toString()}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `housing-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const toggleLogExpansion = (logId: number) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getActionIcon = (action: string) => {
    const actionIcons = {
      submitted: FileText,
      document_verified: CheckCircle,
      inspection_scheduled: Calendar,
      inspection_completed: CheckCircle,
      approved: CheckCircle,
      rejected: XCircle,
      info_requested: AlertCircle,
      withdrawn: XCircle,
      status_changed: Activity,
      document_uploaded: FileText,
      comment_added: FileText,
      payment_verified: CheckCircle,
      application_created: FileText,
      application_updated: FileText
    };
    return actionIcons[action as keyof typeof actionIcons] || Activity;
  };

  const getActionColor = (action: string) => {
    const actionColors = {
      submitted: 'text-blue-600',
      document_verified: 'text-green-600',
      inspection_scheduled: 'text-blue-600',
      inspection_completed: 'text-green-600',
      approved: 'text-green-600',
      rejected: 'text-red-600',
      info_requested: 'text-yellow-600',
      withdrawn: 'text-red-600',
      status_changed: 'text-purple-600',
      document_uploaded: 'text-blue-600',
      comment_added: 'text-gray-600',
      payment_verified: 'text-green-600',
      application_created: 'text-blue-600',
      application_updated: 'text-gray-600'
    };
    return actionColors[action as keyof typeof actionColors] || 'text-gray-600';
  };

  const getActionLabel = (action: string) => {
    const actionLabels = {
      submitted: 'Application Submitted',
      document_verified: 'Document Verified',
      inspection_scheduled: 'Inspection Scheduled',
      inspection_completed: 'Inspection Completed',
      approved: 'Application Approved',
      rejected: 'Application Rejected',
      info_requested: 'Information Requested',
      withdrawn: 'Application Withdrawn',
      status_changed: 'Status Changed',
      document_uploaded: 'Document Uploaded',
      comment_added: 'Comment Added',
      payment_verified: 'Payment Verified',
      application_created: 'Application Created',
      application_updated: 'Application Updated'
    };
    return actionLabels[action as keyof typeof actionLabels] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
      submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
      document_verification: { label: 'Document Verification', color: 'bg-purple-100 text-purple-800' },
      field_inspection: { label: 'Field Inspection', color: 'bg-orange-100 text-orange-800' },
      final_review: { label: 'Final Review', color: 'bg-indigo-100 text-indigo-800' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      info_requested: { label: 'Info Requested', color: 'bg-yellow-100 text-yellow-800' },
      on_hold: { label: 'On Hold', color: 'bg-gray-100 text-gray-800' },
      appeal: { label: 'Appeal', color: 'bg-purple-100 text-purple-800' },
      withdrawn: { label: 'Withdrawn', color: 'bg-red-100 text-red-800' },
      offer_issued: { label: 'Offer Issued', color: 'bg-green-100 text-green-800' },
      beneficiary_assigned: { label: 'Beneficiary Assigned', color: 'bg-green-100 text-green-800' },
      closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getProgramTypeLabel = (type: string) => {
    const types = {
      rental_subsidy: 'Rental Subsidy',
      socialized_housing: 'Socialized Housing',
      in_city_relocation: 'In-City Relocation'
    };
    return types[type as keyof typeof types] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      HOUSING_ADMIN: 'bg-red-100 text-red-800',
      HOUSING_OFFICER: 'bg-blue-100 text-blue-800',
      HOUSING_INSPECTOR: 'bg-green-100 text-green-800',
      HOUSING_CLERK: 'bg-purple-100 text-purple-800',
      CITIZEN: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex-shrink-0 mb-4 pb-2">
        <div className="flex justify-between items-start">
          <Header 
            variant="secondary"
            title="Housing Application Logs"
            subtext="Complete audit trail of all housing application activities."
          />
          <div className="flex items-center space-x-3">
            <Button variant="outlined" onClick={loadLogs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outlined" onClick={exportLogs}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Logs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_logs}</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Today's Logs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.today_logs}</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.unique_actors}</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Home className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Applications Processed</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.applications_processed}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6" padding="lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select
                    value={filters.action}
                    onChange={(value) => setFilters(prev => ({ ...prev, action: value as string }))}
                    options={[
                      { value: 'all', label: 'All Actions' },
                      { value: 'submitted', label: 'Application Submitted' },
                      { value: 'document_verified', label: 'Document Verified' },
                      { value: 'inspection_scheduled', label: 'Inspection Scheduled' },
                      { value: 'inspection_completed', label: 'Inspection Completed' },
                      { value: 'approved', label: 'Application Approved' },
                      { value: 'rejected', label: 'Application Rejected' },
                      { value: 'info_requested', label: 'Information Requested' },
                      { value: 'withdrawn', label: 'Application Withdrawn' },
                      { value: 'status_changed', label: 'Status Changed' },
                      { value: 'document_uploaded', label: 'Document Uploaded' },
                      { value: 'comment_added', label: 'Comment Added' },
                      { value: 'payment_verified', label: 'Payment Verified' }
                    ]}
                    placeholder="Filter by action"
                  />
                  
                  <Select
                    value={filters.actor}
                    onChange={(value) => setFilters(prev => ({ ...prev, actor: value as string }))}
                    options={[
                      { value: 'all', label: 'All Actors' },
                      { value: '1', label: 'John Doe (Admin)' },
                      { value: '2', label: 'Jane Smith (Officer)' },
                      { value: '3', label: 'Mike Johnson (Inspector)' },
                      { value: '4', label: 'Sarah Wilson (Clerk)' }
                    ]}
                    placeholder="Filter by actor"
                  />
                  
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      placeholder="Date From"
                      value={filters.date_from}
                      onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                    />
                    <Input
                      type="date"
                      placeholder="Date To"
                      value={filters.date_to}
                      onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                    />
                  </div>
                </div>
            </Card>

            {/* Logs */}
            <Card title="Activity Logs" subtitle={`${logs.length} log entries found`} padding="lg">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Logs Found</h3>
                    <p className="text-gray-600">
                      No log entries match your current filters.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => {
                      const ActionIcon = getActionIcon(log.action);
                      const isExpanded = expandedLogs.has(log.id);
                      
                      return (
                        <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                                <ActionIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{getActionLabel(log.action)}</h4>
                                  {log.old_status && log.new_status && (
                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                      <span>{log.old_status}</span>
                                      <span>→</span>
                                      <span>{log.new_status}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="flex items-center space-x-1">
                                    <User className="w-4 h-4" />
                                    <span>{log.actor?.name || 'System'}</span>
                                    {log.actor?.role && (
                                      <Badge className={getRoleColor(log.actor.role)}>
                                        {log.actor.role}
                                      </Badge>
                                    )}
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDate(log.created_at)}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge variant="default">
                                {log.application.application_number}
                              </Badge>
                              <Button
                                variant="outlined"
                                size="sm"
                                onClick={() => toggleLogExpansion(log.id)}
                              >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Application Details</h5>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-gray-600">Application:</span> {log.application.application_number}</p>
                                    <p><span className="text-gray-600">Applicant:</span> {log.application.full_name}</p>
                                    <p><span className="text-gray-600">Program:</span> {getProgramTypeLabel(log.application.program_type)}</p>
                                    <p><span className="text-gray-600">Status:</span> {getStatusBadge(log.application.status)}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Action Details</h5>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-gray-600">Actor:</span> {log.actor.name} ({log.actor.email})</p>
                                    <p><span className="text-gray-600">Role:</span> {log.actor.role}</p>
                                    <p><span className="text-gray-600">IP Address:</span> {log.ip_address || 'N/A'}</p>
                                    <p><span className="text-gray-600">Timestamp:</span> {formatDate(log.created_at)}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {(log.reason || log.note) && (
                                <div className="mt-4">
                                  <h5 className="font-medium text-gray-900 mb-2">Additional Information</h5>
                                  <div className="space-y-2 text-sm">
                                    {log.reason && (
                                      <p><span className="text-gray-600">Reason:</span> {log.reason}</p>
                                    )}
                                    {log.note && (
                                      <p><span className="text-gray-600">Note:</span> {log.note}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
  );
};

// Add default layout for persistent sidebar/topnav
HousingLogs.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default HousingLogs;
