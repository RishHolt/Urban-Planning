import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import TextArea from '../../../components/TextArea';
import { AlertTriangle, Calendar, FileText, Building, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface TerminateOccupancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  occupancy: any;
}

const TerminateOccupancyModal: React.FC<TerminateOccupancyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  occupancy
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    move_out_date: '',
    termination_reason: ''
  });
  const [confirmed, setConfirmed] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.move_out_date || !formData.termination_reason.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields'
      });
      return;
    }

    if (!confirmed) {
      Swal.fire({
        icon: 'error',
        title: 'Confirmation Required',
        text: 'Please confirm that you understand this action is permanent'
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/occupancy/records/${occupancy.id}/terminate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          move_out_date: formData.move_out_date,
          termination_reason: formData.termination_reason
        })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Occupancy terminated successfully'
        });
        onSuccess();
        onClose();
        resetForm();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to terminate occupancy'
        });
      }
    } catch (error) {
      console.error('Error terminating occupancy:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to terminate occupancy'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      move_out_date: '',
      termination_reason: ''
    });
    setConfirmed(false);
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
      variant="warning"
      className="min-w-[50vw] h-auto"
      title="Terminate Occupancy"
      icon={<AlertTriangle className="w-6 h-6" />}
      actions={[
        {
          label: loading ? 'Terminating...' : 'Terminate Occupancy',
          onClick: () => handleSubmit({ preventDefault: () => {} } as React.FormEvent),
          variant: 'danger',
          loading: loading,
          disabled: loading || !confirmed
        }
      ]}
    >
      {/* Warning */}
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Warning</h3>
            <p className="text-sm text-red-700 mt-1">
              This action will permanently terminate the occupancy and change its status to "Terminated". 
              This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {occupancy && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
          <h3 className="text-sm font-medium text-red-900 mb-3 flex items-center">
            <Building className="w-4 h-4 mr-2" />
            Occupancy to be Terminated
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-red-700">Beneficiary:</span> {occupancy.beneficiary_name}
            </div>
            <div>
              <span className="font-medium text-red-700">Unit:</span> {occupancy.unit_identifier}
            </div>
            <div>
              <span className="font-medium text-red-700">Program:</span> {occupancy.program_type.replace('_', ' ').toUpperCase()}
            </div>
            <div>
              <span className="font-medium text-red-700">Current Status:</span> {occupancy.status}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-h-[50vh] overflow-y-auto pr-4">
        <div className="bg-red-50 rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Move-out Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="date"
                value={formData.move_out_date}
                onChange={(e) => handleInputChange('move_out_date', e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Date when the beneficiary moved out of the unit
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              Termination Reason *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <TextArea
                value={formData.termination_reason}
                onChange={(e) => handleInputChange('termination_reason', e.target.value)}
                placeholder="Please provide a detailed reason for terminating this occupancy..."
                rows={4}
                className="pl-10 border-red-300 focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              This reason will be recorded in the occupancy history
            </p>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  I understand this action is permanent
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  By checking this box, I confirm that I understand this will permanently terminate the occupancy 
                  and this action cannot be undone.
                </p>
              </div>
            </div>
          </label>
        </div>
      </form>
    </Modal>
  );
};

export default TerminateOccupancyModal;
