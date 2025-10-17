import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  RotateCcw,
  CreditCard,
  Eye
} from 'lucide-react';
import { 
  Button, 
  Card, 
  Badge, 
  Input,
  Select
} from '../../components';
import AppLayout from '../../layouts/AppLayout';

interface ApplicationHistory {
  id: number;
  zoning_application_id: number;
  action: string;
  old_value?: string;
  new_value?: string;
  remarks?: string;
  performed_by?: {
    id: number;
    name: string;
  };
  created_at: string;
  application?: {
    application_number: string;
    first_name: string;
    last_name: string;
    project_type: string;
  };
}

const ApplicationLogs: React.FC = () => {
  const [history, setHistory] = useState<ApplicationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadHistory();
  }, [currentPage, searchTerm, actionFilter, dateFilter]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: itemsPerPage.toString(),
        search: searchTerm,
        action: actionFilter,
        date: dateFilter
      });

      const response = await fetch(`/api/application-history?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch application history');
      }
      
      const result = await response.json();
      if (result.success) {
        setHistory(result.data);
        setTotalPages(result.meta?.last_page || 1);
      } else {
        throw new Error('API returned error');
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setError('Failed to load application history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'status_changed':
        return <AlertCircle className="w-4 h-4" />;
      case 'document_verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'document_rejected':
        return <XCircle className="w-4 h-4" />;
      case 'forwarded_to_technical':
        return <Send className="w-4 h-4" />;
      case 'returned_to_zoning':
        return <RotateCcw className="w-4 h-4" />;
      case 'payment_confirmed':
        return <CreditCard className="w-4 h-4" />;
      case 'document_reuploaded':
        return <FileText className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getActionVariant = (action: string) => {
    switch (action) {
      case 'status_changed':
      case 'forwarded_to_technical':
      case 'returned_to_zoning':
        return 'info';
      case 'document_verified':
      case 'payment_confirmed':
        return 'success';
      case 'document_rejected':
        return 'danger';
      case 'document_reuploaded':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatActionText = (action: string, oldValue?: string, newValue?: string) => {
    switch (action) {
      case 'status_changed':
        return `Status changed from ${oldValue || 'N/A'} to ${newValue || 'N/A'}`;
      case 'document_verified':
        return `Document verified: ${newValue || 'Unknown document'}`;
      case 'document_rejected':
        return `Document rejected: ${newValue || 'Unknown document'}`;
      case 'forwarded_to_technical':
        return 'Application forwarded to technical review';
      case 'returned_to_zoning':
        return 'Application returned to zoning for final approval';
      case 'payment_confirmed':
        return 'Payment confirmed';
      case 'payment_status_changed':
        return `Payment status changed from ${oldValue || 'N/A'} to ${newValue || 'N/A'}`;
      case 'document_reuploaded':
        return `Document re-uploaded: ${newValue || 'Unknown document'}`;
      default:
        return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadHistory();
  };

  const handleFilterChange = (filter: string, value: string) => {
    switch (filter) {
      case 'action':
        setActionFilter(value);
        break;
      case 'date':
        setDateFilter(value);
        break;
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application logs...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Logs</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadHistory}>
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Application Logs</h1>
              <p className="text-gray-600">Complete audit trail of all application activities</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="info">
                <History className="w-4 h-4 mr-1" />
                {history.length} entries
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by application number, name, or action..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Type
                </label>
                <Select
                  value={actionFilter}
                  onChange={(value) => handleFilterChange('action', value as string)}
                  options={[
                    { value: '', label: 'All actions' },
                    { value: 'status_changed', label: 'Status Changes' },
                    { value: 'document_verified', label: 'Document Verified' },
                    { value: 'document_rejected', label: 'Document Rejected' },
                    { value: 'forwarded_to_technical', label: 'Forwarded to Technical' },
                    { value: 'returned_to_zoning', label: 'Returned to Zoning' },
                    { value: 'payment_confirmed', label: 'Payment Confirmed' },
                    { value: 'document_reuploaded', label: 'Document Re-uploaded' }
                  ]}
                  placeholder="All actions"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <Select
                  value={dateFilter}
                  onChange={(value) => handleFilterChange('date', value as string)}
                  options={[
                    { value: '', label: 'All dates' },
                    { value: 'today', label: 'Today' },
                    { value: 'yesterday', label: 'Yesterday' },
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' },
                    { value: 'quarter', label: 'This Quarter' }
                  ]}
                  placeholder="All dates"
                />
              </div>
              
              <div className="flex items-end space-x-2">
                <Button type="submit" variant="primary" icon={<Search className="w-4 h-4" />}>
                  Search
                </Button>
                <Button type="button" variant="outlined" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto">
          <Card className="p-6">
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                  <p className="text-gray-600">No application logs match your current filters.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getActionIcon(item.action)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={getActionVariant(item.action)}>
                              {item.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            {item.application && (
                              <span className="text-sm text-gray-600">
                                {item.application.application_number}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {formatActionText(item.action, item.old_value, item.new_value)}
                          </p>
                          
                          {item.application && (
                            <p className="text-sm text-gray-600 mb-2">
                              {item.application.first_name} {item.application.last_name} - {item.application.project_type}
                            </p>
                          )}
                          
                          {item.remarks && (
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {item.remarks}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right text-sm text-gray-500">
                          <p>{new Date(item.created_at).toLocaleDateString()}</p>
                          <p>{new Date(item.created_at).toLocaleTimeString()}</p>
                          {item.performed_by && (
                            <p className="mt-1 text-xs">
                              by {item.performed_by.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ApplicationLogs;
