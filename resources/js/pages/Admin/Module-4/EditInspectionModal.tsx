import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import TextArea from '../../../components/TextArea';
import { ClipboardCheck, Calendar, User, Plus, Trash2, Building, FileText, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface EditInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inspection: any;
}

interface User {
  id: number;
  name: string;
  role: string;
}

const EditInspectionModal: React.FC<EditInspectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  inspection
}) => {
  const [loading, setLoading] = useState(false);
  const [inspectors, setInspectors] = useState<User[]>([]);
  const [violations, setViolations] = useState<string[]>([]);
  const [newViolation, setNewViolation] = useState('');
  const [formData, setFormData] = useState({
    status: 'scheduled',
    findings: '',
    recommendations: '',
    next_inspection_date: ''
  });

  useEffect(() => {
    if (isOpen && inspection) {
      setFormData({
        status: inspection.status || 'scheduled',
        findings: inspection.findings || '',
        recommendations: inspection.recommendations || '',
        next_inspection_date: inspection.next_inspection_date || ''
      });
      setViolations(inspection.violations || []);
      fetchInspectors();
    }
  }, [isOpen, inspection]);

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

  const addViolation = () => {
    if (newViolation.trim()) {
      setViolations(prev => [...prev, newViolation.trim()]);
      setNewViolation('');
    }
  };

  const removeViolation = (index: number) => {
    setViolations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/occupancy/inspections/${inspection.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formData.status,
          findings: formData.findings,
          violations: violations,
          recommendations: formData.recommendations,
          next_inspection_date: formData.next_inspection_date || null
        })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Inspection updated successfully'
        });
        onSuccess();
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to update inspection'
        });
      }
    } catch (error) {
      console.error('Error updating inspection:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update inspection'
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
      title="Update Inspection"
      className="min-w-[50vw] h-auto"
      icon={<ClipboardCheck className="w-6 h-6" />}
      actions={[
        {
          label: loading ? 'Updating...' : 'Update Inspection',
          onClick: () => handleSubmit({ preventDefault: () => {} } as React.FormEvent),
          variant: 'primary',
          loading: loading,
          disabled: loading
        }
      ]}
    >
      {inspection && (
        <div className="mb-6 p-4 bg-purple-100 border border-purple-200 rounded-lg">
          <h3 className="text-sm font-medium text-purple-900 mb-3 flex items-center">
            <Building className="w-4 h-4 mr-2" />
            Inspection Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-purple-700">Type:</span> {inspection.inspection_type?.replace('_', ' ').toUpperCase()}
            </div>
            <div>
              <span className="font-medium text-purple-700">Date:</span> {inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString() : 'N/A'}
            </div>
            <div>
              <span className="font-medium text-purple-700">Inspector:</span> {inspection.inspector?.name || 'Unassigned'}
            </div>
            <div>
              <span className="font-medium text-purple-700">Occupancy:</span> {inspection.occupancy?.beneficiary_name} - {inspection.occupancy?.unit_identifier}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-h-[50vh] overflow-y-auto pr-4">
        <div className="bg-green-50 rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Status *
            </label>
            <Select
              value={formData.status}
              onChange={(value) => handleInputChange('status', String(value))}
              options={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              required
            />
            <p className="text-xs text-gray-500">Current inspection status</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Findings
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <TextArea
                value={formData.findings}
                onChange={(e) => handleInputChange('findings', e.target.value)}
                placeholder="Describe what was found during the inspection..."
                rows={4}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">Detailed findings from the inspection</p>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Violations ({violations.length})
            </label>
            <div className="space-y-2">
              {violations.map((violation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1 flex items-center space-x-2 bg-white border border-orange-200 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-700">{violation}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeViolation(index)}
                    icon={<Trash2 size={14} />}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={newViolation}
                  onChange={(e) => setNewViolation(e.target.value)}
                  placeholder="Add a new violation..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addViolation())}
                />
                <Button
                  type="button"
                  variant="outlined"
                  onClick={addViolation}
                  icon={<Plus size={14} />}
                >
                  Add
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">List any violations found during inspection</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Recommendations
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <TextArea
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                placeholder="Recommendations for the occupancy..."
                rows={3}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">Recommendations based on inspection findings</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Next Inspection Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="date"
                value={formData.next_inspection_date}
                onChange={(e) => handleInputChange('next_inspection_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">
              Leave empty if no follow-up inspection is needed
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditInspectionModal;
