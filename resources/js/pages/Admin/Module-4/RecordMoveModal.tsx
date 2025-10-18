import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import TextArea from '../../../components/TextArea';
import { Home, Calendar, FileText, ArrowRight, ArrowLeft, Building } from 'lucide-react';
import Swal from 'sweetalert2';

interface RecordMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  occupancy: any;
  mode: 'move-in' | 'move-out';
}

const RecordMoveModal: React.FC<RecordMoveModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  occupancy,
  mode
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    move_date: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.move_date) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a move date'
      });
      return;
    }

    try {
      setLoading(true);
      
      const endpoint = mode === 'move-in' 
        ? `/api/occupancy/records/${occupancy.id}/move-in`
        : `/api/occupancy/records/${occupancy.id}/move-out`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          move_in_date: mode === 'move-in' ? formData.move_date : undefined,
          move_out_date: mode === 'move-out' ? formData.move_date : undefined,
          notes: formData.notes
        })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `${mode === 'move-in' ? 'Move-in' : 'Move-out'} recorded successfully`
        });
        onSuccess();
        onClose();
        resetForm();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || `Failed to record ${mode}`
        });
      }
    } catch (error) {
      console.error(`Error recording ${mode}:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to record ${mode}`
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      move_date: '',
      notes: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isMoveIn = mode === 'move-in';
  const title = isMoveIn ? 'Record Move-in' : 'Record Move-out';
  const icon = isMoveIn ? Home : Calendar;
  const Icon = icon;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="md"
      title={title}
      className="min-w-[50vw] h-auto"
      icon={<Icon className="w-6 h-6" />}
      actions={[
        {
          label: loading ? 'Recording...' : `Record ${isMoveIn ? 'Move-in' : 'Move-out'}`,
          onClick: () => handleSubmit({ preventDefault: () => {} } as React.FormEvent),
          variant: 'primary',
          loading: loading,
          disabled: loading
        }
      ]}
    >
      {occupancy && (
        <div className="mb-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Building className="w-4 h-4 mr-2" />
            Occupancy Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Beneficiary:</span> {occupancy.beneficiary_name}
            </div>
            <div>
              <span className="font-medium text-gray-700">Unit:</span> {occupancy.unit_identifier}
            </div>
            <div>
              <span className="font-medium text-gray-700">Program:</span> {occupancy.program_type.replace('_', ' ').toUpperCase()}
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span> {occupancy.status}
            </div>
          </div>
        </div>
      )}

      {/* Visual Timeline */}
      <div className="mb-6 flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isMoveIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Move-in</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${!isMoveIn ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Move-out</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-h-[50vh] overflow-y-auto pr-4">
        <div className={`rounded-lg p-6 ${isMoveIn ? 'bg-green-50' : 'bg-orange-50'}`}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                {isMoveIn ? 'Move-in' : 'Move-out'} Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="date"
                  value={formData.move_date}
                  onChange={(e) => handleInputChange('move_date', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                {isMoveIn 
                  ? 'Date when the beneficiary moved into the unit'
                  : 'Date when the beneficiary moved out of the unit'
                }
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                Additional Notes
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <TextArea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder={`Additional notes about the ${mode}...`}
                  rows={3}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Optional notes for this move record</p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default RecordMoveModal;
