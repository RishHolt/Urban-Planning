import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Calendar, User, FileText, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, Plus } from 'lucide-react';
import { Button, Card, PageHeader, Badge } from '../../../components';
import { apiService, type User as ApiUser } from '../../../lib/api';

interface HousingApplication {
  id: number;
  application_number: string;
  status: string;
  score: number | null;
  submitted_at: string;
  full_name: string;
  current_address: string;
  monthly_income: number;
  household_size: number;
  housing_type: string;
  created_at: string;
  updated_at: string;
}

const MyHousingApplications: React.FC = () => {
  const [applications, setApplications] = useState<HousingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<ApiUser | null>(null);

  // Get user data on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (localUser && localUser.id) {
          try {
            const response = await apiService.getCurrentUser();
            if (response.success && response.user) {
              setUserData(response.user);
            } else {
              localStorage.removeItem('user');
              setUserData(null);
            }
          } catch (error) {
            localStorage.removeItem('user');
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        setUserData(null);
      }
    };

    checkAuthStatus();
  }, []);

  // Load applications
  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        // Fetch from API
        const response = await fetch('/api/housing/applications', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          // Handle paginated response - data is nested under data.data
          const applicationsData = result.data.data || result.data;
          setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        // Keep empty array on error
        setApplications([]);
        
        // Fallback to mock data for demo - remove this in production
        const mockApplications: HousingApplication[] = [
          {
            id: 1,
            application_number: 'HB-2024-001',
            status: 'submitted',
            score: 85,
            submitted_at: '2024-01-15T10:30:00Z',
            full_name: 'Juan Dela Cruz',
            current_address: '123 Main Street, Barangay 1, Caloocan City',
            monthly_income: 25000,
            household_size: 4,
            housing_type: 'rented',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            application_number: 'HB-2024-002',
            status: 'under_review',
            score: 92,
            submitted_at: '2024-01-10T09:15:00Z',
            full_name: 'Maria Santos',
            current_address: '456 Business Ave, Barangay 2, Caloocan City',
            monthly_income: 18000,
            household_size: 3,
            housing_type: 'informal',
            created_at: '2024-01-10T09:15:00Z',
            updated_at: '2024-01-12T14:20:00Z'
          }
        ];
        
        setApplications(mockApplications);
      } finally {
        setLoading(false);
      }
    };

    // Only load if user is authenticated
    if (userData !== null) {
      loadApplications();
    } else {
      setLoading(false);
    }
  }, [userData]);

  const handleUserDataChange = (user: ApiUser | null) => {
    setUserData(user);
  };

  const handleLogout = () => {
    console.log('Logout completed');
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'submitted': return 'info';
      case 'under_review': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'requires_changes': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'submitted': return <FileText className="w-4 h-4" />;
      case 'under_review': return <FileText className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'requires_changes': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleViewDetails = (application: HousingApplication) => {
    router.visit(`/my-housing-applications/${application.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          userData={userData}
          onUserDataChange={handleUserDataChange}
          onLogout={handleLogout}
        />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        userData={userData}
        onUserDataChange={handleUserDataChange}
        onLogout={handleLogout}
      />
      
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => router.visit('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Landing Page</span>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Housing Applications</h1>
            <p className="text-gray-600 mt-2">Track the status of your housing beneficiary applications</p>
          </div>

          {/* Applications List */}
          {!applications || applications.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-600 mb-6">You haven't submitted any housing applications yet.</p>
              <Button 
                onClick={() => router.visit('/housing/apply')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit New Application
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications && applications.map((application) => (
                <Card key={application.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(application)}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">#{application.application_number}</h3>
                      <p className="text-sm text-gray-500">{application.full_name}</p>
                    </div>
                    <Badge 
                      variant={getStatusVariant(application.status) as any}
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      {getStatusIcon(application.status)}
                      <span className="capitalize">{application.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-2">{application.current_address}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(application.submitted_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {application.household_size} family members
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>₱{application.monthly_income.toLocaleString()}/month</span>
                    </div>
                    {application.score && (
                      <div className="flex items-center text-sm">
                        <div className="flex items-center text-purple-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span>Score: {application.score}/100</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Housing Type</span>
                      <span className="font-semibold text-gray-900 capitalize">{application.housing_type}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyHousingApplications;