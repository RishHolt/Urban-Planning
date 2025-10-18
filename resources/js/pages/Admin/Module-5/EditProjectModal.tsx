import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { 
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
  project: any;
}

interface ProjectFormData {
  title: string;
  description: string;
  project_type: 'general' | 'housing_related';
  category: string;
  priority: string;
  address: string;
  barangay: string;
  latitude: number;
  longitude: number;
  estimated_budget: number;
  start_date: string;
  completion_date: string;
  housing_application_id?: number;
  notes: string;
}

const EditProjectModal = ({ isOpen, onClose, onSuccess, project }: EditProjectModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    project_type: 'general',
    category: 'road',
    priority: 'medium',
    address: '',
    barangay: '',
    latitude: 14.5995,
    longitude: 120.9842,
    estimated_budget: 0,
    start_date: '',
    completion_date: '',
    housing_application_id: undefined,
    notes: ''
  });

  const steps = [
    { number: 1, title: 'Basic Information', icon: Building2 },
    { number: 2, title: 'Location', icon: MapPin },
    { number: 3, title: 'Budget & Timeline', icon: DollarSign },
    { number: 4, title: 'Housing Link', icon: Calendar }
  ];

  const categories = [
    { value: 'road', label: 'Road' },
    { value: 'bridge', label: 'Bridge' },
    { value: 'water', label: 'Water' },
    { value: 'sewage', label: 'Sewage' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'building', label: 'Building' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'critical', label: 'Critical Priority' }
  ];

  const barangays = [
    'Barangay A', 'Barangay B', 'Barangay C', 'Barangay D', 'Barangay E',
    'Barangay F', 'Barangay G', 'Barangay H', 'Barangay I', 'Barangay J'
  ];

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        project_type: project.project_type || 'general',
        category: project.category || 'road',
        priority: project.priority || 'medium',
        address: project.address || '',
        barangay: project.barangay || '',
        latitude: project.latitude || 14.5995,
        longitude: project.longitude || 120.9842,
        estimated_budget: project.estimated_budget || 0,
        start_date: project.start_date || '',
        completion_date: project.completion_date || '',
        housing_application_id: project.housing_application_id || undefined,
        notes: project.notes || ''
      });
    }
  }, [project, isOpen]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Project title is required';
      if (!formData.description.trim()) newErrors.description = 'Project description is required';
      if (!formData.category) newErrors.category = 'Project category is required';
      if (!formData.priority) newErrors.priority = 'Priority level is required';
    }

    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.barangay) newErrors.barangay = 'Barangay is required';
      if (!formData.latitude || formData.latitude === 0) newErrors.latitude = 'Valid latitude is required';
      if (!formData.longitude || formData.longitude === 0) newErrors.longitude = 'Valid longitude is required';
    }

    if (step === 3) {
      if (!formData.estimated_budget || formData.estimated_budget <= 0) {
        newErrors.estimated_budget = 'Estimated budget must be greater than 0';
      }
      if (!formData.start_date) newErrors.start_date = 'Start date is required';
      if (!formData.completion_date) newErrors.completion_date = 'Completion date is required';
      if (formData.start_date && formData.completion_date && new Date(formData.start_date) >= new Date(formData.completion_date)) {
        newErrors.completion_date = 'Completion date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep) || !project?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/infrastructure/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        onSuccess(result.data);
        onClose();
      } else {
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setErrors({});
  };

  const calculateDuration = () => {
    if (formData.start_date && formData.completion_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.completion_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const canEdit = () => {
    return project?.status === 'proposal' || project?.status === 'budget_approval';
  };

  if (!isOpen || !project) return null;

  if (!canEdit()) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Cannot Edit Project</h2>
              <Button variant="outlined" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Cannot Be Edited</h3>
              <p className="text-gray-600">
                This project cannot be edited because it has progressed beyond the proposal or budget approval stage.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Current status: <span className="font-medium">{project.status}</span>
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
              <p className="text-sm text-gray-600">Update project details step by step</p>
              <p className="text-xs text-gray-500 mt-1">Project: {project.project_number}</p>
            </div>
            <Button variant="outlined" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive ? 'border-blue-500 bg-blue-50' :
                      isCompleted ? 'border-green-500 bg-green-50' :
                      'border-gray-300 bg-white'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <StepIcon className={`w-5 h-5 ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                      error={errors.title}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Type *
                    </label>
                    <Select
                      value={formData.project_type}
                      onChange={(value) => setFormData(prev => ({ ...prev, project_type: value as 'general' | 'housing_related' }))}
                      options={[
                        { value: 'general', label: 'General Infrastructure' },
                        { value: 'housing_related', label: 'Housing Related' }
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the project in detail"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <Select
                      value={formData.category}
                      onChange={(value) => setFormData(prev => ({ ...prev, category: value as string }))}
                      options={categories}
                    />
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority *
                    </label>
                    <Select
                      value={formData.priority}
                      onChange={(value) => setFormData(prev => ({ ...prev, priority: value as string }))}
                      options={priorities}
                    />
                    {errors.priority && (
                      <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter project address"
                    error={errors.address}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barangay *
                  </label>
                  <Select
                    value={formData.barangay}
                    onChange={(value) => setFormData(prev => ({ ...prev, barangay: value as string }))}
                    options={barangays.map(barangay => ({ value: barangay, label: barangay }))}
                    placeholder="Select barangay"
                  />
                  {errors.barangay && (
                    <p className="mt-1 text-sm text-red-600">{errors.barangay}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude *
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                      placeholder="14.5995"
                      error={errors.latitude}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude *
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                      placeholder="120.9842"
                      error={errors.longitude}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> You can get coordinates from Google Maps by right-clicking on the location and selecting "What's here?"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Budget & Timeline */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget & Timeline</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Budget (PHP) *
                  </label>
                  <Input
                    type="number"
                    value={formData.estimated_budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_budget: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter estimated budget"
                    error={errors.estimated_budget}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      error={errors.start_date}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Completion Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.completion_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                      error={errors.completion_date}
                    />
                  </div>
                </div>

                {calculateDuration() > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Project Duration:</strong> {calculateDuration()} days
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Housing Link (Optional) */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Housing Link (Optional)</h3>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> This step is optional. Only link to housing applications if this infrastructure project is specifically related to a housing development.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Housing Application ID
                  </label>
                  <Input
                    type="number"
                    value={formData.housing_application_id || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      housing_application_id: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Enter housing application ID (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes or comments"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <Button variant="outlined" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Project'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;
