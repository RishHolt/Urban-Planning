import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../../layouts/AppLayout';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { 
  FileText,
  Download,
  Calendar,
  BarChart3,
  Building2,
  Users,
  DollarSign,
  Filter,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface ReportData {
  project_id: number;
  report_type: string;
  generated_at: string;
  executive_summary?: string;
  status?: string;
  budget_utilization?: number;
  timeline_status?: string;
  key_issues?: string[];
  recommendations?: string[];
  specifications?: string;
  quality_control?: string;
  inspections?: string[];
  technical_issues?: string[];
}

const ReportsPage = () => {
  const [reportType, setReportType] = useState('progress');
  const [selectedProject, setSelectedProject] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [contractor, setContractor] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/infrastructure/projects');
      const result = await response.json();
      if (result.success) {
        setProjects(result.data.data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const generateReport = async () => {
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }

    try {
      setLoading(true);
      const endpoint = reportType === 'progress' 
        ? `/api/infrastructure/reports/progress/${selectedProject}`
        : `/api/infrastructure/reports/technical/${selectedProject}`;
      
      const response = await fetch(endpoint);
      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!reportData) {
      alert('Please generate a report first');
      return;
    }

    // Mock export functionality
    const filename = `${reportType}-report-${selectedProject}-${new Date().toISOString().split('T')[0]}.${format}`;
    console.log(`Exporting ${filename}`);
    alert(`Exporting report as ${format.toUpperCase()}: ${filename}`);
  };

  const reportTypes = [
    { value: 'progress', label: 'Progress Report', icon: BarChart3, description: 'Executive summary with budget and timeline status' },
    { value: 'technical', label: 'Technical Report', icon: Building2, description: 'Engineering specifications and quality control' },
    { value: 'budget', label: 'Budget Summary', icon: DollarSign, description: 'Financial analysis and cost breakdown' },
    { value: 'completion', label: 'Completion Report', icon: CheckCircle, description: 'Final project summary and handover' }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return CheckCircle;
      case 'delayed': return AlertTriangle;
      case 'at_risk': return Clock;
      default: return BarChart3;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-600';
      case 'delayed': return 'text-yellow-600';
      case 'at_risk': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Head title="Infrastructure Reports" />
      
      {/* Page Header */}
      <div className="flex-shrink-0 mb-4 pb-2">
        <div className="flex justify-between items-start">
          <Header 
            variant="secondary"
            title="Infrastructure Reports"
            subtext="Generate and export project reports and analytics."
          />
          
          <div className="flex items-center space-x-3">
            <Button variant="outlined" onClick={generateReport} disabled={loading || !selectedProject}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Configuration */}
        <div className="lg:col-span-1">
          <Card title="Report Configuration" padding="lg">
            <div className="space-y-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
                <div className="space-y-3">
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.value}
                        onClick={() => setReportType(type.value)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          reportType === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className={`w-5 h-5 mt-0.5 ${
                            reportType === type.value ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <h4 className={`font-medium ${
                              reportType === type.value ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {type.label}
                            </h4>
                            <p className={`text-sm ${
                              reportType === type.value ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <Select
                  value={selectedProject}
                  onChange={(value) => setSelectedProject(value as string)}
                  options={[
                    { value: '', label: 'Select a project...' },
                    ...projects.map(project => ({
                      value: project.id.toString(),
                      label: `${project.project_number} - ${project.title}`
                    }))
                  ]}
                  placeholder="Choose project"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    placeholder="From Date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="To Date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              {/* Additional Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contractor</label>
                <Select
                  value={contractor}
                  onChange={(value) => setContractor(value as string)}
                  options={[
                    { value: '', label: 'All contractors' },
                    { value: '1', label: 'ABC Construction Corp.' },
                    { value: '2', label: 'XYZ Engineering Services' },
                    { value: '3', label: 'Metro Infrastructure Ltd.' }
                  ]}
                  placeholder="Filter by contractor"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2">
          <Card title="Report Preview" padding="lg">
            {!reportData ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Generated</h3>
                <p className="text-gray-600">
                  Select a project and click "Generate Report" to preview your report.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {reportTypes.find(t => t.value === reportType)?.label}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Generated on {formatDate(reportData.generated_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outlined" size="sm" onClick={() => exportReport('pdf')}>
                        <Download className="w-4 h-4" />
                        PDF
                      </Button>
                      <Button variant="outlined" size="sm" onClick={() => exportReport('excel')}>
                        <Download className="w-4 h-4" />
                        Excel
                      </Button>
                      <Button variant="outlined" size="sm" onClick={() => exportReport('csv')}>
                        <Download className="w-4 h-4" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div className="space-y-6">
                  {reportType === 'progress' && reportData.executive_summary && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h3>
                      <p className="text-gray-700">{reportData.executive_summary}</p>
                    </div>
                  )}

                  {reportType === 'technical' && reportData.specifications && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                      <p className="text-gray-700">{reportData.specifications}</p>
                    </div>
                  )}

                  {/* Status and Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reportData.status && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Project Status</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{reportData.status}</span>
                        </div>
                      </div>
                    )}

                    {reportData.budget_utilization && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Budget Utilization</h4>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${reportData.budget_utilization}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{reportData.budget_utilization}%</span>
                        </div>
                      </div>
                    )}

                    {reportData.timeline_status && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Timeline Status</h4>
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const StatusIcon = getStatusIcon(reportData.timeline_status);
                            return <StatusIcon className={`w-4 h-4 ${getStatusColor(reportData.timeline_status)}`} />;
                          })()}
                          <span className={`text-sm ${getStatusColor(reportData.timeline_status)}`}>
                            {reportData.timeline_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Key Issues */}
                  {reportData.key_issues && reportData.key_issues.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Issues</h3>
                      <ul className="space-y-2">
                        {reportData.key_issues.map((issue, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <span className="text-gray-700">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {reportData.recommendations && reportData.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {reportData.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                            <span className="text-gray-700">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Technical Details */}
                  {reportType === 'technical' && (
                    <div className="space-y-4">
                      {reportData.quality_control && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Quality Control</h4>
                          <p className="text-gray-700">{reportData.quality_control}</p>
                        </div>
                      )}

                      {reportData.inspections && reportData.inspections.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Inspections</h4>
                          <ul className="space-y-1">
                            {reportData.inspections.map((inspection, index) => (
                              <li key={index} className="text-gray-700">• {inspection}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {reportData.technical_issues && reportData.technical_issues.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Technical Issues</h4>
                          <ul className="space-y-1">
                            {reportData.technical_issues.map((issue, index) => (
                              <li key={index} className="text-gray-700">• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

// Add default layout for persistent sidebar/topnav
ReportsPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default ReportsPage;
