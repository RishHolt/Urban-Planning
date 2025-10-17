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
  Eye,
  Building,
  Clock
} from 'lucide-react';
import { 
  Button, 
  Card, 
  Badge, 
  Input,
  Select
} from '../../../components';
import AppLayout from '../../../layouts/AppLayout';

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

const BuildingLogs: React.FC = () => {
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
      case 'payment_confirmed':
        return <CreditCard className="w-4 h-4" />;
      case 'forwarded_to_technical':
        return <Send className="w-4 h-4" />;
      case 'returned_to_zoning':
        return <RotateCcw className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'technical_review_started':
        return <Building className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'document_verified':
        return <Badge variant="success">Verified</Badge>;
      case 'document_rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'payment_confirmed':
        return <Badge variant="info">Payment Confirmed</Badge>;
      case 'status_changed':
        return <Badge variant="warning">Status Changed</Badge>;
      case 'forwarded_to_technical':
        return <Badge variant="info">Forwarded to Technical</Badge>;
      case 'returned_to_zoning':
        return <Badge variant="info">Returned to Zoning</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'technical_review_started':
        return <Badge variant="warning">Technical Review Started</Badge>;
      default:
        return <Badge variant="secondary">{action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge>;
    }
  };

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'document_verified', label: 'Document Verified' },
    { value: 'document_rejected', label: 'Document Rejected' },
    { value: 'payment_confirmed', label: 'Payment Confirmed' },
    { value: 'status_changed', label: 'Status Changed' },
    { value: 'forwarded_to_technical', label: 'Forwarded to Technical' },
    { value: 'returned_to_zoning', label: 'Returned to Zoning' },
    { value: 'approved', label: 'Approved' },
    { value: 'technical_review_started', label: 'Technical Review Started' }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadHistory();
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'action') {
      setActionFilter(value);
    } else if (filterType === 'date') {
      setDateFilter(value);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading application logs...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button 
              variant="primary" 
              className="mt-4"
              onClick={loadHistory}
            >
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full overflow-auto">
        <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <History className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Building Application Logs</h1>
              <p className="text-gray-600">Track all building/technical review activities and workflow actions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">{history.length} entries</span>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search applications, users, actions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Type
                </label>
                <Select
                  value={actionFilter}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                >
                  {actionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <Select
                  value={dateFilter}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button type="submit" variant="primary" className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Logs List */}
        <Card className="p-6">
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No application logs found</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getActionIcon(item.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          {getActionBadge(item.action)}
                        </div>
                        
                        {/* Show document type for document actions */}
                        {item.new_value && (item.action === 'document_verified' || item.action === 'document_rejected') && (
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Document:</strong> {item.new_value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        )}
                        
                        {/* Show status change details */}
                        {item.action === 'status_changed' && item.old_value && item.new_value && (
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Status:</strong> {item.old_value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} → {item.new_value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        )}
                        
                        {/* Show remarks */}
                        {item.remarks && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Remarks:</strong> {item.remarks}
                          </p>
                        )}
                        
                        {/* Application info */}
                        {item.application && (
                          <div className="text-sm text-gray-500 mb-2">
                            <strong>Application:</strong> {item.application.application_number} - {item.application.first_name} {item.application.last_name} ({item.application.project_type})
                          </div>
                        )}
                        
                        {/* Performed by and timestamp */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {item.performed_by && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{item.performed_by.name}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                        </div>
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
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
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

export default BuildingLogs;
