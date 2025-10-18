import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { 
  X,
  DollarSign,
  Users,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';

// Budget Approval Modal
interface BudgetApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  project: any;
  action: 'approve' | 'reject';
}

export const BudgetApprovalModal = ({ isOpen, onClose, onSuccess, project, action }: BudgetApprovalModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    approved_budget: project?.estimated_budget || 0,
    reason: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (action === 'approve' && (!formData.approved_budget || formData.approved_budget <= 0)) {
      setErrors({ approved_budget: 'Approved budget must be greater than 0' });
      return;
    }
    
    if (action === 'reject' && !formData.reason.trim()) {
      setErrors({ reason: 'Reason is required for rejection' });
      return;
    }

    try {
      setLoading(true);
      const endpoint = action === 'approve' 
        ? `/api/infrastructure/projects/${project.id}/approve-budget`
        : `/api/infrastructure/projects/${project.id}/reject-budget`;
      
      const response = await fetch(endpoint, {
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
      } else {
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error(`Error ${action}ing budget:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {action === 'approve' ? 'Approve Budget' : 'Reject Budget'}
            </h2>
            <Button variant="outlined" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {action === 'approve' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approved Budget (PHP) *
                </label>
                <Input
                  type="number"
                  value={formData.approved_budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, approved_budget: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter approved budget"
                  error={errors.approved_budget}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Original estimate: ₱{project?.estimated_budget?.toLocaleString() || 0}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain why the budget is being rejected"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes or comments"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {loading ? 'Processing...' : (action === 'approve' ? 'Approve Budget' : 'Reject Budget')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Contract Award Modal
interface ContractAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  project: any;
  contractors: any[];
}

export const ContractAwardModal = ({ isOpen, onClose, onSuccess, project, contractors }: ContractAwardModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    contractor_id: '',
    contract_amount: project?.approved_budget || 0,
    award_date: new Date().toISOString().split('T')[0],
    terms: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contractor_id) {
      setErrors({ contractor_id: 'Please select a contractor' });
      return;
    }
    
    if (!formData.contract_amount || formData.contract_amount <= 0) {
      setErrors({ contract_amount: 'Contract amount must be greater than 0' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/infrastructure/projects/${project.id}/award-contract`, {
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
      } else {
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error('Error awarding contract:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Award Contract</h2>
            <Button variant="outlined" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Contractor *
              </label>
              <Select
                value={formData.contractor_id}
                onChange={(value) => setFormData(prev => ({ ...prev, contractor_id: value as string }))}
                options={contractors.map(contractor => ({
                  value: contractor.id.toString(),
                  label: `${contractor.company_name} (${contractor.rating}/5 stars)`
                }))}
                placeholder="Choose contractor"
              />
              {errors.contractor_id && (
                <p className="mt-1 text-sm text-red-600">{errors.contractor_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Amount (PHP) *
              </label>
              <Input
                type="number"
                value={formData.contract_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, contract_amount: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter contract amount"
                error={errors.contract_amount}
              />
              <p className="text-xs text-gray-500 mt-1">
                Approved budget: ₱{project?.approved_budget?.toLocaleString() || 0}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Award Date *
              </label>
              <Input
                type="date"
                value={formData.award_date}
                onChange={(e) => setFormData(prev => ({ ...prev, award_date: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Terms
              </label>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                placeholder="Enter contract terms and conditions"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Awarding...' : 'Award Contract'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Inspection Modal
interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  project: any;
}

export const InspectionModal = ({ isOpen, onClose, onSuccess, project }: InspectionModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    findings: '',
    passed: true,
    recommendations: '',
    next_inspection_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.findings.trim()) {
      setErrors({ findings: 'Inspection findings are required' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/infrastructure/projects/${project.id}/complete-inspection`, {
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
      } else {
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error('Error completing inspection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Complete Inspection</h2>
            <Button variant="outlined" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Findings *
              </label>
              <textarea
                value={formData.findings}
                onChange={(e) => setFormData(prev => ({ ...prev, findings: e.target.value }))}
                placeholder="Describe the inspection findings"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.findings && (
                <p className="mt-1 text-sm text-red-600">{errors.findings}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Result *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="passed"
                    checked={formData.passed}
                    onChange={() => setFormData(prev => ({ ...prev, passed: true }))}
                    className="mr-2"
                  />
                  <span className="text-green-600">Passed</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="passed"
                    checked={!formData.passed}
                    onChange={() => setFormData(prev => ({ ...prev, passed: false }))}
                    className="mr-2"
                  />
                  <span className="text-red-600">Failed</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations
              </label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                placeholder="Enter recommendations for improvement"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Inspection Date
              </label>
              <Input
                type="date"
                value={formData.next_inspection_date}
                onChange={(e) => setFormData(prev => ({ ...prev, next_inspection_date: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Completing...' : 'Complete Inspection'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Handover Modal
interface HandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  project: any;
}

export const HandoverModal = ({ isOpen, onClose, onSuccess, project }: HandoverModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    acceptance_confirmed: false,
    final_notes: '',
    completion_certificate: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptance_confirmed) {
      setErrors({ acceptance_confirmed: 'You must confirm acceptance to proceed' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/infrastructure/projects/${project.id}/handover`, {
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
      } else {
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error('Error completing handover:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Project Handover</h2>
            <Button variant="outlined" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800">
                    <strong>Ready for Handover:</strong> This project has completed all required phases and is ready for final handover.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.acceptance_confirmed}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptance_confirmed: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  I confirm that this project meets all requirements and is ready for handover *
                </span>
              </label>
              {errors.acceptance_confirmed && (
                <p className="mt-1 text-sm text-red-600">{errors.acceptance_confirmed}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Notes
              </label>
              <textarea
                value={formData.final_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, final_notes: e.target.value }))}
                placeholder="Enter any final notes or comments"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Certificate
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFormData(prev => ({ ...prev, completion_certificate: e.target.files?.[0] || null }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload completion certificate (PDF, DOC, DOCX)
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.acceptance_confirmed}>
                {loading ? 'Completing...' : 'Complete Handover'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Cancel Project Modal
interface CancelProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  project: any;
}

export const CancelProjectModal = ({ isOpen, onClose, onSuccess, project }: CancelProjectModalProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    reason: '',
    effective_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      setErrors({ reason: 'Cancellation reason is required' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/infrastructure/projects/${project.id}/cancel`, {
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
      } else {
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error('Error cancelling project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Cancel Project</h2>
            <Button variant="outlined" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Cancelling this project will stop all work and cannot be easily undone. 
                  Please provide a detailed reason for cancellation.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain why this project is being cancelled"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date *
              </label>
              <Input
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Cancelling...' : 'Cancel Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
