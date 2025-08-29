import React from 'react';
import { useTranslation } from 'react-i18next';

interface TutorialInfoProps {
  title: string;
  description: string;
  assignedStall: string;
  assignedStallName: string;
  onStart: () => void;
}

const TutorialInfo: React.FC<TutorialInfoProps> = ({
  title,
  description,
  assignedStall,
  assignedStallName,
  onStart
}) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">{t('tutorial.info.assignedToStall')}</span> {assignedStallName} <span>{t('tutorial.info.stall')}</span>
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-neutral-50 font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out"
        >
          {t('tutorial.info.startTutorialButton')}
        </button>
      </div>
    </div>
  );
};

export default TutorialInfo;