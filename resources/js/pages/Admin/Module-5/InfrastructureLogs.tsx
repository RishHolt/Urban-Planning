import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
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
  Building2,
  DollarSign,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface LogEntry {
  id: number;
  project_id: number;
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
  project: {
    project_number: string;
    title: string;
    status: string;
    project_type: string;
  };
}

interface FilterOptions {
  action: string;
  actor: string;
  date_from: string;
  date_to: string;
  project_status: string;
  project_type: string;
}

const InfrastructureLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    action: 'all',
    actor: 'all',
    date_from: '',
    date_to: '',
    project_status: 'all',
    project_type: 'all'
  });
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total_logs: 0,
    today_logs: 0,
    unique_actors: 0,
    projects_affected: 0
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
      if (filters.project_status !== 'all') params.append('project_status', filters.project_status);
      if (filters.project_type !== 'all') params.append('project_type', filters.project_type);
      params.append('page', currentPage.toString());

      const response = await fetch(`/api/infrastructure/logs?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setLogs(result.data.data || []);
        setTotalPages(result.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/infrastructure/logs/stats');
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
      if (filters.project_status !== 'all') params.append('project_status', filters.project_status);
      if (filters.project_type !== 'all') params.append('project_type', filters.project_type);

      const response = await fetch(`/api/infrastructure/logs/export?${params.toString()}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `infrastructure-logs-${new Date().toISOString().split('T')[0]}.csv`;
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
      created: FileText,
      status_changed: Activity,
      budget_approved: CheckCircle,
      budget_rejected: XCircle,
      contract_awarded: Building2,
      construction_started: Building2,
      inspection_completed: CheckCircle,
      handover: CheckCircle,
      cancelled: XCircle,
      milestone_created: Calendar,
      milestone_updated: Calendar,
      contractor_assigned: Users,
      contractor_updated: Users,
      note_added: FileText,
      document_uploaded: FileText
    };
    return actionIcons[action as keyof typeof actionIcons] || Activity;
  };

  const getActionColor = (action: string) => {
    const actionColors = {
      created: 'text-blue-600',
      status_changed: 'text-purple-600',
      budget_approved: 'text-green-600',
      budget_rejected: 'text-red-600',
      contract_awarded: 'text-green-600',
      construction_started: 'text-orange-600',
      inspection_completed: 'text-green-600',
      handover: 'text-green-600',
      cancelled: 'text-red-600',
      milestone_created: 'text-blue-600',
      milestone_updated: 'text-blue-600',
      contractor_assigned: 'text-green-600',
      contractor_updated: 'text-blue-600',
      note_added: 'text-gray-600',
      document_uploaded: 'text-blue-600'
    };
    return actionColors[action as keyof typeof actionColors] || 'text-gray-600';
  };

  const getActionLabel = (action: string) => {
    const actionLabels = {
      created: 'Project Created',
      status_changed: 'Status Changed',
      budget_approved: 'Budget Approved',
      budget_rejected: 'Budget Rejected',
      contract_awarded: 'Contract Awarded',
      construction_started: 'Construction Started',
      inspection_completed: 'Inspection Completed',
      handover: 'Project Handover',
      cancelled: 'Project Cancelled',
      milestone_created: 'Milestone Created',
      milestone_updated: 'Milestone Updated',
      contractor_assigned: 'Contractor Assigned',
      contractor_updated: 'Contractor Updated',
      note_added: 'Note Added',
      document_uploaded: 'Document Uploaded'
    };
    return actionLabels[action as keyof typeof actionLabels] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      proposal: { label: 'Proposal', color: 'bg-gray-100 text-gray-800' },
      budget_approval: { label: 'Budget Approval', color: 'bg-yellow-100 text-yellow-800' },
      bidding: { label: 'Bidding', color: 'bg-blue-100 text-blue-800' },
      construction: { label: 'Construction', color: 'bg-orange-100 text-orange-800' },
      inspection: { label: 'Inspection', color: 'bg-purple-100 text-purple-800' },
      handover: { label: 'Handover', color: 'bg-indigo-100 text-indigo-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.proposal;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getProjectTypeLabel = (type: string) => {
    const types = {
      general: 'General Infrastructure',
      housing_related: 'Housing Related'
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
      INFRA_ADMIN: 'bg-red-100 text-red-800',
      INFRA_ENGINEER: 'bg-blue-100 text-blue-800',
      INFRA_OFFICER: 'bg-green-100 text-green-800',
      PROJECT_MANAGER: 'bg-purple-100 text-purple-800',
      CITIZEN: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Head title="Infrastructure Logs" />
      
      {/* Page Header */}
      <div className="flex-shrink-0 mb-4 pb-2">
        <div className="flex justify-between items-start">
          <Header 
            variant="secondary"
            title="Infrastructure Activity Logs"
            subtext="Complete audit trail of all infrastructure project activities."
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
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Projects Affected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.projects_affected}</p>
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
                { value: 'created', label: 'Project Created' },
                { value: 'status_changed', label: 'Status Changed' },
                { value: 'budget_approved', label: 'Budget Approved' },
                { value: 'budget_rejected', label: 'Budget Rejected' },
                { value: 'contract_awarded', label: 'Contract Awarded' },
                { value: 'construction_started', label: 'Construction Started' },
                { value: 'inspection_completed', label: 'Inspection Completed' },
                { value: 'handover', label: 'Project Handover' },
                { value: 'cancelled', label: 'Project Cancelled' },
                { value: 'milestone_created', label: 'Milestone Created' },
                { value: 'contractor_assigned', label: 'Contractor Assigned' }
              ]}
              placeholder="Filter by action"
            />
            
            <Select
              value={filters.actor}
              onChange={(value) => setFilters(prev => ({ ...prev, actor: value as string }))}
              options={[
                { value: 'all', label: 'All Actors' },
                { value: '1', label: 'Admin User' },
                { value: '2', label: 'Project Manager' },
                { value: '3', label: 'Engineer' },
                { value: '4', label: 'Officer' }
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
        <Card className="mb-6" padding="lg">
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
                          {log.project.project_number}
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
                            <h5 className="font-medium text-gray-900 mb-2">Project Details</h5>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-600">Project:</span> {log.project.project_number}</p>
                              <p><span className="text-gray-600">Title:</span> {log.project.title}</p>
                              <p><span className="text-gray-600">Type:</span> {getProjectTypeLabel(log.project.project_type)}</p>
                              <p><span className="text-gray-600">Status:</span> {getStatusBadge(log.project.status)}</p>
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
InfrastructureLogs.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default InfrastructureLogs;
