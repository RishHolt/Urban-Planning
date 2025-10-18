import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import TextArea from '../../../components/TextArea';
import { User, Phone, Mail, MapPin, Home, Users, Calendar, Building, Hash } from 'lucide-react';
import Swal from 'sweetalert2';

interface CreateOccupancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface HousingApplication {
  id: number;
  application_number: string;
  full_name: string;
  program_type: string;
  mobile: string;
  email: string;
  current_address: string;
  barangay: string;
  household_size: number;
}

const CreateOccupancyModal: React.FC<CreateOccupancyModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<HousingApplication[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState({
    beneficiary_name: '',
    contact_number: '',
    email: '',
    address: '',
    barangay: '',
    unit_identifier: '',
    program_type: 'socialized_housing',
    household_size: 1,
    move_in_date: '',
    lease_start_date: '',
    lease_end_date: '',
    notes: '',
    application_id: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchApprovedApplications();
    }
  }, [isOpen]);

  const fetchApprovedApplications = async () => {
    try {
      const response = await fetch('/api/housing/applications?status=approved&per_page=100');
      const data = await response.json();
      if (data.success) {
        setApplications(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const handleApplicationSelect = (applicationId: string) => {
    if (applicationId) {
      const selectedApp = applications.find(app => app.id.toString() === applicationId);
      if (selectedApp) {
        // Auto-populate form with application data
        setFormData(prev => ({
          ...prev,
          application_id: applicationId,
          beneficiary_name: selectedApp.full_name,
          contact_number: selectedApp.mobile,
          email: selectedApp.email,
          address: selectedApp.current_address,
          barangay: selectedApp.barangay,
          household_size: selectedApp.household_size,
          program_type: selectedApp.program_type
        }));
      }
    } else {
      // Clear application-linked data if no application selected
      setFormData(prev => ({
        ...prev,
        application_id: '',
        beneficiary_name: '',
        contact_number: '',
        email: '',
        address: '',
        barangay: '',
        household_size: 1,
        program_type: 'socialized_housing'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Basic validation
    if (!formData.beneficiary_name || !formData.contact_number || !formData.address || 
        !formData.unit_identifier || !formData.move_in_date || !formData.lease_start_date) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields'
      });
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        application_id: formData.application_id || null,
        household_size: parseInt(formData.household_size.toString())
      };

      // Debug: Log the data being sent
      console.log('Submitting occupancy data:', submitData);

      const response = await fetch('/api/occupancy/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Occupancy record created successfully'
        });
        onSuccess();
        onClose();
        resetForm();
      } else {
        // Log validation errors for debugging
        console.error('Validation errors:', data.errors);
        
        // Set field-specific errors
        if (data.errors) {
          setErrors(data.errors);
        }
        
        const errorMessages = data.errors 
          ? Object.values(data.errors).flat().join('\n')
          : data.message || 'Failed to create occupancy record';
        
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          html: `<pre style="text-align: left; font-size: 12px;">${errorMessages}</pre>`
        });
      }
    } catch (error) {
      console.error('Error creating occupancy:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create occupancy record'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      beneficiary_name: '',
      contact_number: '',
      email: '',
      address: '',
      barangay: '',
      unit_identifier: '',
      program_type: 'socialized_housing',
      household_size: 1,
      move_in_date: '',
      lease_start_date: '',
      lease_end_date: '',
      notes: '',
      application_id: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Helper component to display field errors
  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field] || errors[field].length === 0) return null;
    
    return (
      <div className="mt-1 text-sm text-red-600">
        {errors[field].map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="lg"
      className="min-w-[50vw] h-auto"
      title="Create New Occupancy"
      icon={<Home className="w-6 h-6" />}
      actions={[
        {
          label: loading ? 'Creating...' : 'Create Occupancy',
          onClick: () => handleSubmit({ preventDefault: () => {} } as React.FormEvent),
          variant: 'primary',
          loading: loading,
          disabled: loading
        }
      ]}
    >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          {/* Application Selection */}
          <div className="bg-blue-100 rounded-lg p-6 space-y-4 border-2 border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <h3 className="text-lg font-semibold text-blue-900">Application Selection</h3>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-900">
                Select Housing Application
              </label>
              <Select
                value={formData.application_id}
                onChange={(value) => handleApplicationSelect(String(value))}
                options={[
                  { value: '', label: 'No application (Manual Entry)' },
                  ...applications.map(app => ({
                    value: app.id.toString(),
                    label: `${app.application_number} - ${app.full_name} - ${app.barangay}`
                  }))
                ]}
                className="w-full"
              />
              <p className="text-xs text-blue-700">
                Select an approved application to auto-fill beneficiary details, or leave blank to enter manually
              </p>
            </div>
          </div>

          {/* Beneficiary Information */}
          <div className="bg-blue-50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-blue-900">Beneficiary Information</h3>
              </div>
              {formData.application_id && (
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                  <span>Auto-populated from Application #{applications.find(app => app.id.toString() === formData.application_id)?.application_number}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    value={formData.beneficiary_name}
                    onChange={(e) => handleInputChange('beneficiary_name', e.target.value)}
                    placeholder="Enter full name"
                    className={`pl-10 ${errors.beneficiary_name ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                <FieldError field="beneficiary_name" />
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Contact Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="tel"
                    value={formData.contact_number}
                    onChange={(e) => handleInputChange('contact_number', e.target.value)}
                    placeholder="+63 912 345 6789"
                    className={`pl-10 ${errors.contact_number ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                <FieldError field="contact_number" />
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                <FieldError field="email" />
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Household Size *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    min="1"
                    value={formData.household_size}
                    onChange={(e) => handleInputChange('household_size', parseInt(e.target.value))}
                    className={`pl-10 ${errors.household_size ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                <FieldError field="household_size" />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <TextArea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete address"
                  rows={2}
                  className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              <FieldError field="address" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Barangay *
                </label>
                <Select
                  value={formData.barangay}
                  onChange={(value) => handleInputChange('barangay', String(value))}
                  options={[
                    { value: '', label: 'Select Barangay' },
                    { value: 'Barangay 1', label: 'Barangay 1' },
                    { value: 'Barangay 2', label: 'Barangay 2' },
                    { value: 'Barangay 3', label: 'Barangay 3' },
                    { value: 'Barangay 4', label: 'Barangay 4' },
                    { value: 'Barangay 5', label: 'Barangay 5' }
                  ]}
                  className={errors.barangay ? 'border-red-500' : ''}
                  required
                />
                <FieldError field="barangay" />
              </div>
              
            </div>
          </div>

          {/* Unit Information */}
          <div className="bg-indigo-50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Unit Identifier *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    value={formData.unit_identifier}
                    onChange={(e) => handleInputChange('unit_identifier', e.target.value)}
                    placeholder="Unit 101, Building A"
                    className={`pl-10 ${errors.unit_identifier ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                <FieldError field="unit_identifier" />
                <p className="text-xs text-gray-500">Unique identifier for the housing unit</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Program Type *
                </label>
                <Select
                  value={formData.program_type}
                  onChange={(value) => handleInputChange('program_type', String(value))}
                  options={[
                    { value: 'socialized_housing', label: 'Socialized Housing' },
                    { value: 'rental_subsidy', label: 'Rental Subsidy' },
                    { value: 'relocation', label: 'Relocation' }
                  ]}
                  required
                />
                <p className="text-xs text-gray-500">Type of housing program</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-green-50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Move-in Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={formData.move_in_date}
                    onChange={(e) => handleInputChange('move_in_date', e.target.value)}
                    className={`pl-10 ${errors.move_in_date ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                <FieldError field="move_in_date" />
                <p className="text-xs text-gray-500">When beneficiary moved in</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Lease Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={formData.lease_start_date}
                    onChange={(e) => handleInputChange('lease_start_date', e.target.value)}
                    className={`pl-10 ${errors.lease_start_date ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                <FieldError field="lease_start_date" />
                <p className="text-xs text-gray-500">Official lease start date</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Lease End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={formData.lease_end_date}
                    onChange={(e) => handleInputChange('lease_end_date', e.target.value)}
                    className={`pl-10 ${errors.lease_end_date ? 'border-red-500' : ''}`}
                  />
                </div>
                <FieldError field="lease_end_date" />
                <p className="text-xs text-gray-500">Optional end date</p>
              </div>
            </div>
          </div>


          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Additional Notes
            </label>
            <TextArea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about this occupancy..."
              rows={3}
            />
            <p className="text-xs text-gray-500">Optional notes for internal reference</p>
          </div>
        </form>
    </Modal>
  );
};

export default CreateOccupancyModal;
