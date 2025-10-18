import React from 'react';

// Simple test version to check if the issue is with the complex component structure
export const BudgetApprovalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">Test Modal</h2>
          <p>This is a test modal to check if the issue is resolved.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const ContractAwardModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">Test Modal 2</h2>
          <p>This is another test modal.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const InspectionModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">Test Modal 3</h2>
          <p>This is another test modal.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const HandoverModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">Test Modal 4</h2>
          <p>This is another test modal.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const CancelProjectModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">Test Modal 5</h2>
          <p>This is another test modal.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
