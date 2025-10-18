import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import TextArea from '../../../components/TextArea';
import { User, Phone, Mail, MapPin, Home, Users, Calendar, Edit, Building, Hash } from 'lucide-react';
import Swal from 'sweetalert2';

interface EditOccupancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  occupancy: any;
}

interface HousingApplication {
  id: number;
  application_number: string;
  full_name: string;
  program_type: string;
}

const EditOccupancyModal: React.FC<EditOccupancyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  occupancy
}) => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<HousingApplication[]>([]);
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
    move_out_date: '',
    lease_start_date: '',
    lease_end_date: '',
    status: 'active',
    termination_reason: '',
    notes: '',
    application_id: ''
  });

  useEffect(() => {
    if (isOpen && occupancy) {
      setFormData({
        beneficiary_name: occupancy.beneficiary_name || '',
        contact_number: occupancy.contact_number || '',
        email: occupancy.email || '',
        address: occupancy.address || '',
        barangay: occupancy.barangay || '',
        unit_identifier: occupancy.unit_identifier || '',
        program_type: occupancy.program_type || 'socialized_housing',
        household_size: occupancy.household_size || 1,
        move_in_date: occupancy.move_in_date || '',
        move_out_date: occupancy.move_out_date || '',
        lease_start_date: occupancy.lease_start_date || '',
        lease_end_date: occupancy.lease_end_date || '',
        status: occupancy.status || 'active',
        termination_reason: occupancy.termination_reason || '',
        notes: occupancy.notes || '',
        application_id: occupancy.application_id?.toString() || ''
      });
      fetchApprovedApplications();
    }
  }, [isOpen, occupancy]);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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

      const response = await fetch(`/api/occupancy/records/${occupancy.id}`, {
        method: 'PUT',
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
          text: 'Occupancy record updated successfully'
        });
        onSuccess();
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to update occupancy record'
        });
      }
    } catch (error) {
      console.error('Error updating occupancy:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update occupancy record'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="lg"
      title="Edit Occupancy Record"
      className="min-w-[50vw] h-auto"
      icon={<Edit className="w-6 h-6" />}
      actions={[
        {
          label: loading ? 'Updating...' : 'Save Changes',
          onClick: () => handleSubmit({ preventDefault: () => {} } as React.FormEvent),
          variant: 'primary',
          loading: loading,
          disabled: loading
        }
      ]}
    >
      {/* Current Occupancy Info */}
      {occupancy && (
        <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-indigo-900 mb-2">Current Occupancy Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-indigo-700">Beneficiary:</span> {occupancy.beneficiary_name}
            </div>
            <div>
              <span className="font-medium text-indigo-700">Unit:</span> {occupancy.unit_identifier}
            </div>
            <div>
              <span className="font-medium text-indigo-700">Status:</span> {occupancy.status}
            </div>
            <div>
              <span className="font-medium text-indigo-700">Program:</span> {occupancy.program_type?.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>  
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-h-[50vh] overflow-y-auto pr-4 ">
          {/* Beneficiary Information */}
          <div className="bg-blue-50 rounded-lg p-6 space-y-4">
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
                    className="pl-10"
                    required
                  />
                </div>
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
                    className="pl-10"
                    required
                  />
                </div>
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
                    className="pl-10"
                  />
                </div>
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
                    className="pl-10"
                    required
                  />
                </div>
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
                  className="pl-10"
                  required
                />
              </div>
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
                  required
                />
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
                    className="pl-10"
                    required
                  />
                </div>
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

          {/* Status & Dates */}
          <div className="bg-green-50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Status *
                </label>
                <Select
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', String(value))}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'ended', label: 'Ended' },
                    { value: 'terminated', label: 'Terminated' },
                    { value: 'transferred', label: 'Transferred' }
                  ]}
                  required
                />
                <p className="text-xs text-gray-500">Current occupancy status</p>
              </div>
              
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
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">When beneficiary moved in</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Move-out Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={formData.move_out_date}
                    onChange={(e) => handleInputChange('move_out_date', e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">When beneficiary moved out</p>
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
                    className="pl-10"
                    required
                  />
                </div>
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
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">Optional end date</p>
              </div>
            </div>
          </div>

          {/* Termination Reason */}
          {formData.status === 'terminated' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <label className="block text-xs font-medium text-red-700 uppercase tracking-wide">
                Termination Reason
              </label>
              <TextArea
                value={formData.termination_reason}
                onChange={(e) => handleInputChange('termination_reason', e.target.value)}
                placeholder="Reason for termination..."
                rows={3}
                className="border-red-300 focus:border-red-500 focus:ring-red-500"
              />
              <p className="text-xs text-red-600">Required when status is terminated</p>
            </div>
          )}

          {/* Link to Application */}
          <div className="bg-purple-50 rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                Link to Housing Application
              </label>
              <Select
                value={formData.application_id}
                onChange={(value) => handleInputChange('application_id', String(value))}
                options={[
                  { value: '', label: 'No application linked' },
                  ...applications.map(app => ({
                    value: app.id.toString(),
                    label: `${app.application_number} - ${app.full_name} (${app.program_type})`
                  }))
                ]}
              />
              <p className="text-xs text-gray-500">Optional: Link to approved housing application</p>
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

export default EditOccupancyModal;
