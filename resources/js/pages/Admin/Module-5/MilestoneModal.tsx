import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { 
  X,
  Calendar,
  DollarSign,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (milestone: any) => void;
  milestone?: any;
  projectId: number;
}

interface MilestoneFormData {
  title: string;
  description: string;
  target_date: string;
  completion_date?: string;
  budget_allocation: number;
  actual_cost: number;
  progress_percentage: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  deliverables: string;
  notes: string;
}

const MilestoneModal = ({ isOpen, onClose, onSuccess, milestone, projectId }: MilestoneModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<MilestoneFormData>({
    title: '',
    description: '',
    target_date: '',
    completion_date: '',
    budget_allocation: 0,
    actual_cost: 0,
    progress_percentage: 0,
    status: 'pending',
    deliverables: '',
    notes: ''
  });

  const isEdit = !!milestone;

  useEffect(() => {
    if (milestone && isOpen) {
      setFormData({
        title: milestone.title || '',
        description: milestone.description || '',
        target_date: milestone.target_date || '',
        completion_date: milestone.completion_date || '',
        budget_allocation: milestone.budget_allocation || 0,
        actual_cost: milestone.actual_cost || 0,
        progress_percentage: milestone.progress_percentage || 0,
        status: milestone.status || 'pending',
        deliverables: milestone.deliverables || '',
        notes: milestone.notes || ''
      });
    } else if (isOpen) {
      // Reset form for new milestone
      setFormData({
        title: '',
        description: '',
        target_date: '',
        completion_date: '',
        budget_allocation: 0,
        actual_cost: 0,
        progress_percentage: 0,
        status: 'pending',
        deliverables: '',
        notes: ''
      });
    }
  }, [milestone, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Milestone title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.target_date) newErrors.target_date = 'Target date is required';
    if (formData.budget_allocation < 0) newErrors.budget_allocation = 'Budget allocation cannot be negative';
    if (formData.actual_cost < 0) newErrors.actual_cost = 'Actual cost cannot be negative';
    if (formData.progress_percentage < 0 || formData.progress_percentage > 100) {
      newErrors.progress_percentage = 'Progress percentage must be between 0 and 100';
    }
    if (formData.status === 'completed' && !formData.completion_date) {
      newErrors.completion_date = 'Completion date is required for completed milestones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const url = isEdit ? `/api/infrastructure/milestones/${milestone.id}` : '/api/infrastructure/milestones';
      const method = isEdit ? 'PUT' : 'POST';
      
      const requestData = {
        ...formData,
        project_id: projectId
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      
      if (result.success) {
        onSuccess(result.data);
        onClose();
        resetForm();
      } else {
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} milestone:`, error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target_date: '',
      completion_date: '',
      budget_allocation: 0,
      actual_cost: 0,
      progress_percentage: 0,
      status: 'pending',
      deliverables: '',
      notes: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleStatusChange = (value: string | number | (string | number)[]) => {
    const status = value as string;
    setFormData(prev => ({ ...prev, status: status as any }));
    
    // Auto-set completion date if status is completed
    if (status === 'completed' && !formData.completion_date) {
      setFormData(prev => ({ ...prev, completion_date: new Date().toISOString().split('T')[0] }));
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEdit ? 'Edit Milestone' : 'Add New Milestone'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEdit ? 'Update milestone information' : 'Create a new project milestone'}
              </p>
            </div>
            <Button variant="outlined" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Milestone Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter milestone title"
                  error={errors.title}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this milestone involves"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                    error={errors.target_date}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Date
                  </label>
                  <Input
                    type="date"
                    value={formData.completion_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value || undefined }))}
                    error={errors.completion_date}
                  />
                </div>
              </div>
            </div>

            {/* Budget Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Budget Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Allocation (PHP) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.budget_allocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_allocation: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter budget allocation"
                    error={errors.budget_allocation}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Cost (PHP)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.actual_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, actual_cost: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter actual cost"
                    error={errors.actual_cost}
                  />
                </div>
              </div>

              {formData.budget_allocation > 0 && formData.actual_cost > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget Variance:</span>
                    <span className={`font-medium ${
                      formData.actual_cost > formData.budget_allocation ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(formData.actual_cost - formData.budget_allocation)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Variance %:</span>
                    <span className={`font-medium ${
                      formData.actual_cost > formData.budget_allocation ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {((formData.actual_cost - formData.budget_allocation) / formData.budget_allocation * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Progress Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress Percentage *
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, progress_percentage: parseInt(e.target.value) || 0 }))}
                      placeholder="0-100"
                      error={errors.progress_percentage}
                    />
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(Math.max(formData.progress_percentage, 0), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <Select
                    value={formData.status}
                    onChange={handleStatusChange}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'delayed', label: 'Delayed' }
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deliverables
                </label>
                <textarea
                  value={formData.deliverables}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliverables: e.target.value }))}
                  placeholder="List the deliverables for this milestone"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
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

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Milestones help track project progress and ensure timely completion. 
                    Set realistic target dates and update progress regularly.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Milestone' : 'Create Milestone')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MilestoneModal;
