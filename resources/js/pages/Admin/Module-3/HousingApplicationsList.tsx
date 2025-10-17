import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  Building,
  Shield,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface HousingApplication {
  id: number;
  application_number: string;
  status: string;
  score: number | null;
  submitted_at: string;
  full_name: string;
  current_address: string;
  barangay: string;
  program_type: string;
  household_size: number;
  total_household_income: number;
  assigned_staff?: {
    name: string;
  };
  applicant?: {
    name: string;
    email: string;
    mobile: string;
  };
  created_at: string;
}

interface FilterOptions {
  status: string;
  program_type: string;
  assigned_staff: string;
  date_from: string;
  date_to: string;
  score_min: string;
  score_max: string;
}

const HousingApplicationsList = () => {
  const [applications, setApplications] = useState<HousingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    program_type: 'all',
    assigned_staff: 'all',
    date_from: '',
    date_to: '',
    score_min: '',
    score_max: ''
  });
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);

  useEffect(() => {
    loadApplications();
  }, [searchTerm, filters, sortBy, currentPage]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.program_type !== 'all') params.append('program_type', filters.program_type);
      if (filters.assigned_staff !== 'all') params.append('assigned_staff_id', filters.assigned_staff);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.score_min) params.append('score_min', filters.score_min);
      if (filters.score_max) params.append('score_max', filters.score_max);
      params.append('sort', sortBy);
      params.append('page', currentPage.toString());

      const response = await fetch(`/api/housing/applications?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setApplications(result.data.data || []);
        setTotalPages(result.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
      submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
      document_verification: { label: 'Document Verification', color: 'bg-orange-100 text-orange-800' },
      field_inspection: { label: 'Field Inspection', color: 'bg-purple-100 text-purple-800' },
      final_review: { label: 'Final Review', color: 'bg-indigo-100 text-indigo-800' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      info_requested: { label: 'Info Requested', color: 'bg-amber-100 text-amber-800' },
      on_hold: { label: 'On Hold', color: 'bg-slate-100 text-slate-800' },
      appeal: { label: 'Appeal', color: 'bg-pink-100 text-pink-800' },
      withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
      offer_issued: { label: 'Offer Issued', color: 'bg-emerald-100 text-emerald-800' },
      beneficiary_assigned: { label: 'Beneficiary Assigned', color: 'bg-teal-100 text-teal-800' },
      closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'submitted':
      case 'document_verification':
      case 'field_inspection':
      case 'final_review':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'info_requested':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgramTypeLabel = (type: string) => {
    const types = {
      rental_subsidy: 'Rental Subsidy',
      socialized_housing: 'Socialized Housing',
      in_city_relocation: 'In-City Relocation'
    };
    return types[type as keyof typeof types] || type;
  };

  const handleSelectApplication = (id: number) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app.id));
    }
  };

  const handleBulkAction = (action: string) => {
    // Implement bulk actions
    console.log('Bulk action:', action, selectedApplications);
  };

  const exportToCSV = () => {
    // Implement CSV export
    console.log('Export to CSV');
  };

  return (
    <div className="space-y-6">
      <Head title="Housing Applications" />
      
      {/* Page Header */}
      <div className="flex-shrink-0 mb-4 pb-2">
        <div className="flex justify-between items-start">
          <Header 
            variant="secondary"
            title="Housing Applications"
            subtext="Manage and review housing assistance applications."
          />
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value as string }))}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'submitted', label: 'Submitted' },
                { value: 'document_verification', label: 'Document Verification' },
                { value: 'field_inspection', label: 'Field Inspection' },
                { value: 'final_review', label: 'Final Review' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'info_requested', label: 'Info Requested' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'withdrawn', label: 'Withdrawn' }
              ]}
            />
            <Select
              value={filters.program_type}
              onChange={(value) => setFilters(prev => ({ ...prev, program_type: value as string }))}
              options={[
                { value: 'all', label: 'All Programs' },
                { value: 'rental_subsidy', label: 'Rental Subsidy' },
                { value: 'socialized_housing', label: 'Socialized Housing' },
                { value: 'in_city_relocation', label: 'In-City Relocation' }
              ]}
            />
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as string)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'status', label: 'Status' },
                { value: 'score', label: 'Score' },
                { value: 'name', label: 'Name' }
              ]}
            />
            <Button 
              variant="outlined" 
              icon={<Download className="w-4 h-4" />}
              onClick={() => loadApplications()}
            >
              Refresh
            </Button>
            <Button variant="outlined" icon={<Download className="w-4 h-4" />} onClick={exportToCSV}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedApplications.length === applications.length && applications.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(application.id)}
                        onChange={() => handleSelectApplication(application.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-blue-600">{application.application_number}</div>
                        <div className="text-sm text-gray-500">{application.barangay}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{application.full_name}</div>
                        {application.applicant && (
                          <div className="text-sm text-gray-500 space-y-1">
                            {application.applicant.mobile && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{application.applicant.mobile}</span>
                              </div>
                            )}
                            {application.applicant.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{application.applicant.email}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(application.status)}
                        {getStatusBadge(application.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default" size="sm">{getProgramTypeLabel(application.program_type)}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.assigned_staff ? (
                        <div className="text-sm">
                          <div className="font-medium">{application.assigned_staff.name}</div>
                          <div className="text-gray-500">Staff</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div>{formatDate(application.submitted_at || application.created_at)}</div>
                        <div className="text-gray-500">{new Date(application.submitted_at || application.created_at).toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/housing/applications/${application.id}`}
                          icon={<Eye className="w-4 h-4" />}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<MoreHorizontal className="w-4 h-4" />}
                        >
                          More
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
    </div>
  );
};

// Add default layout for persistent sidebar/topnav
HousingApplicationsList.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default HousingApplicationsList;
