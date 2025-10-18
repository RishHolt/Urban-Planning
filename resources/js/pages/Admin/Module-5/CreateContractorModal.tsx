import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { 
  X,
  Users,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CreateContractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contractor: any) => void;
}

interface ContractorFormData {
  company_name: string;
  contact_person: string;
  contact_number: string;
  email: string;
  address: string;
  business_permit_number: string;
  tin_number: string;
  rating: number;
  status: 'active' | 'inactive';
}

const CreateContractorModal = ({ isOpen, onClose, onSuccess }: CreateContractorModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ContractorFormData>({
    company_name: '',
    contact_person: '',
    contact_number: '',
    email: '',
    address: '',
    business_permit_number: '',
    tin_number: '',
    rating: 3,
    status: 'active'
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!formData.contact_person.trim()) newErrors.contact_person = 'Contact person is required';
    if (!formData.contact_number.trim()) newErrors.contact_number = 'Contact number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email format is invalid';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.business_permit_number.trim()) newErrors.business_permit_number = 'Business permit number is required';
    if (!formData.tin_number.trim()) newErrors.tin_number = 'TIN number is required';
    if (formData.rating < 1 || formData.rating > 5) newErrors.rating = 'Rating must be between 1 and 5';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/infrastructure/contractors', {
        method: 'POST',
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
        resetForm();
      } else {
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error('Error creating contractor:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      contact_person: '',
      contact_number: '',
      email: '',
      address: '',
      business_permit_number: '',
      tin_number: '',
      rating: 3,
      status: 'active'
    });
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-2xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Contractor</h2>
              <p className="text-sm text-gray-600">Enter contractor information</p>
            </div>
            <Button variant="outlined" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Company Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Enter company name"
                    error={errors.company_name}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person *
                  </label>
                  <Input
                    value={formData.contact_person}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                    placeholder="Enter contact person name"
                    error={errors.contact_person}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <Input
                    value={formData.contact_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                    placeholder="Enter contact number"
                    error={errors.contact_number}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    error={errors.email}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter company address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Permit Number *
                  </label>
                  <Input
                    value={formData.business_permit_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_permit_number: e.target.value }))}
                    placeholder="Enter business permit number"
                    error={errors.business_permit_number}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TIN Number *
                  </label>
                  <Input
                    value={formData.tin_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, tin_number: e.target.value }))}
                    placeholder="Enter TIN number"
                    error={errors.tin_number}
                  />
                </div>
              </div>
            </div>

            {/* Performance & Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance & Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center space-x-2">
                    {renderStars(formData.rating, (rating) => setFormData(prev => ({ ...prev, rating })))}
                  </div>
                  {errors.rating && (
                    <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' }
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The contractor will be created with 0 completed projects. 
                    The project count will be updated automatically as projects are assigned and completed.
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
                {loading ? 'Creating...' : 'Create Contractor'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateContractorModal;
