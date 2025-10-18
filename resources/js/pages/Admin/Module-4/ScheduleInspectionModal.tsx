import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import TextArea from '../../../components/TextArea';
import { ClipboardCheck, Calendar, User, FileText, Building, Search } from 'lucide-react';
import Swal from 'sweetalert2';

interface ScheduleInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  occupancy?: any; // Optional if called from InspectionsList
}

interface User {
  id: number;
  name: string;
  role: string;
}

interface OccupancyRecord {
  id: number;
  beneficiary_name: string;
  unit_identifier: string;
  program_type: string;
}

const ScheduleInspectionModal: React.FC<ScheduleInspectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  occupancy
}) => {
  const [loading, setLoading] = useState(false);
  const [occupancies, setOccupancies] = useState<OccupancyRecord[]>([]);
  const [inspectors, setInspectors] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    occupancy_id: occupancy?.id?.toString() || '',
    inspector_id: '',
    inspection_date: '',
    inspection_type: 'routine',
    recommendations: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchOccupancies();
      fetchInspectors();
    }
  }, [isOpen]);

  const fetchOccupancies = async () => {
    try {
      const response = await fetch('/api/occupancy/records?per_page=100');
      const data = await response.json();
      if (data.success) {
        setOccupancies(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching occupancies:', error);
    }
  };

  const fetchInspectors = async () => {
    try {
      const response = await fetch('/api/users?role=housing_inspector');
      const data = await response.json();
      if (data.success) {
        setInspectors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching inspectors:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.occupancy_id || !formData.inspection_date) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields'
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/occupancy/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          occupancy_id: parseInt(formData.occupancy_id),
          inspector_id: formData.inspector_id ? parseInt(formData.inspector_id) : null,
          inspection_date: formData.inspection_date,
          inspection_type: formData.inspection_type,
          recommendations: formData.recommendations
        })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Inspection scheduled successfully'
        });
        onSuccess();
        onClose();
        resetForm();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to schedule inspection'
        });
      }
    } catch (error) {
      console.error('Error scheduling inspection:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to schedule inspection'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      occupancy_id: occupancy?.id?.toString() || '',
      inspector_id: '',
      inspection_date: '',
      inspection_type: 'routine',
      recommendations: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="md"
      title="Schedule Inspection"
      className="min-w-[50vw] h-auto"
      icon={<ClipboardCheck className="w-6 h-6" />}
      actions={[
        {
          label: loading ? 'Scheduling...' : 'Schedule Inspection',
          onClick: () => handleSubmit({ preventDefault: () => {} } as React.FormEvent),
          variant: 'primary',
          loading: loading,
          disabled: loading
        }
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[50vh] overflow-y-auto pr-4">
        <div className="bg-blue-50 rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Occupancy Record *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select
                value={formData.occupancy_id}
                onChange={(value) => handleInputChange('occupancy_id', String(value))}
                options={[
                  { value: '', label: 'Select Occupancy Record' },
                  ...occupancies.map(occ => ({
                    value: occ.id.toString(),
                    label: `${occ.beneficiary_name} - ${occ.unit_identifier} (${occ.program_type.replace('_', ' ').toUpperCase()})`
                  }))
                ]}
                className="pl-10"
                required
                disabled={!!occupancy} // Disable if occupancy is pre-selected
              />
            </div>
            {occupancy && (
              <p className="text-xs text-blue-600 mt-1">
                Pre-selected for {occupancy.beneficiary_name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                Inspection Type *
              </label>
              <Select
                value={formData.inspection_type}
                onChange={(value) => handleInputChange('inspection_type', String(value))}
                options={[
                  { value: 'routine', label: 'Routine' },
                  { value: 'complaint', label: 'Complaint' },
                  { value: 'move_in', label: 'Move-in' },
                  { value: 'move_out', label: 'Move-out' },
                  { value: 'compliance', label: 'Compliance' }
                ]}
                required
              />
              <p className="text-xs text-gray-500">Type of inspection to be conducted</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                Inspection Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="date"
                  value={formData.inspection_date}
                  onChange={(e) => handleInputChange('inspection_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Today's date
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Scheduled date for inspection</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Inspector
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select
                value={formData.inspector_id}
                onChange={(value) => handleInputChange('inspector_id', String(value))}
                options={[
                  { value: '', label: 'Unassigned' },
                  ...inspectors.map(inspector => ({
                    value: inspector.id.toString(),
                    label: inspector.name
                  }))
                ]}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">
              Leave unassigned to assign later
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Recommendations
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <TextArea
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                placeholder="Any specific recommendations or notes for this inspection..."
                rows={3}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">Optional pre-inspection notes</p>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleInspectionModal;
