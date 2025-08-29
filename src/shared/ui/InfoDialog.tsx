import React from 'react';

interface InfoDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
}

const InfoDialog: React.FC<InfoDialogProps> = ({
  title,
  message,
  onConfirm,
  confirmText = 'Okay'
}) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-neutral-50 rounded hover:bg-green-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoDialog;