import React from 'react';
import Modal from '../../../shared/ui/Modal';
import Button from '../../../shared/ui/Button';

interface ExportCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterSelect: (filter: 'all' | 'paid' | 'unpaid') => void;
  isGeneratingReport: boolean;
}

const ExportCustomersModal: React.FC<ExportCustomersModalProps> = ({
  isOpen,
  onClose,
  onFilterSelect,
  isGeneratingReport
}) => {
  const handleFilterSelect = (filter: 'all' | 'paid' | 'unpaid') => {
    onFilterSelect(filter);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Export Customers Report"
      hapticFeedback={true}
    >
      <div className="py-2">
        <p className="text-gray-600 mb-4">Select which customers to include in the report:</p>
        
        <div className="space-y-3">
          <Button
            variant="primary"
            size="medium"
            className="w-full"
            onClick={() => handleFilterSelect('all')}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Report...
              </span>
            ) : (
              "All Customers"
            )}
          </Button>
          
          <Button
            variant="secondary"
            size="medium"
            className="w-full"
            onClick={() => handleFilterSelect('paid')}
            disabled={isGeneratingReport}
          >
            Paid Customers Only
          </Button>
          
          <Button
            variant="secondary"
            size="medium"
            className="w-full"
            onClick={() => handleFilterSelect('unpaid')}
            disabled={isGeneratingReport}
          >
            Unpaid Customers Only
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportCustomersModal;