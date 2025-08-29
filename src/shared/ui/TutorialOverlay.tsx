import React from 'react';

interface TutorialOverlayProps {
  targetElement?: HTMLElement | null;
  message: string;
  onNext: () => void;
  onPrev?: () => void;
  onSkip?: () => void;
  step: number;
  totalSteps: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  targetElement,
  message,
  onNext,
  onPrev,
  onSkip,
  step,
  totalSteps,
  position = 'bottom'
}) => {
  const [overlayStyle, setOverlayStyle] = React.useState<React.CSSProperties>({});
  
  React.useEffect(() => {
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      let top = 0;
      let left = 0;
      
      switch (position) {
        case 'top':
          top = rect.top - 120;
          left = rect.left + rect.width / 2 - 150;
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2 - 150;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 60;
          left = rect.left - 320;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 60;
          left = rect.right + 20;
          break;
      }
      
      setOverlayStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 99999,
        maxWidth: '300px',
      });
    }
  }, [targetElement, position]);
  
  if (!targetElement) {
    return null;
  }
  
  return (
    <>
      {/* Overlay to highlight the target element */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 pointer-events-none"
        style={{
          zIndex: 99998,
          clipPath: targetElement ? `polygon(
            0% 0%,
            0% 100%,
            100% 100%,
            100% 0%,
            0% 0%,
            ${targetElement.getBoundingClientRect().left}px ${targetElement.getBoundingClientRect().top}px,
            ${targetElement.getBoundingClientRect().left}px ${targetElement.getBoundingClientRect().bottom}px,
            ${targetElement.getBoundingClientRect().right}px ${targetElement.getBoundingClientRect().bottom}px,
            ${targetElement.getBoundingClientRect().right}px ${targetElement.getBoundingClientRect().top}px,
            ${targetElement.getBoundingClientRect().left}px ${targetElement.getBoundingClientRect().top}px
          )` : undefined
        }}
      />
      
      {/* Tutorial message box */}
      <div
        className="fixed bg-white rounded-lg shadow-xl p-4 border border-gray-200"
        style={{...overlayStyle, zIndex: 99999}}
      >
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-800">Tutorial Step {step} of {totalSteps}</h3>
        </div>
        
        <p className="text-gray-600 mb-4">{message}</p>
        
        <div className="flex justify-between">
          <div>
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
              >
                Skip
              </button>
            )}
          </div>
          
          <div className="space-x-2">
            {onPrev && step > 1 && (
              <button
                onClick={onPrev}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
              >
                Previous
              </button>
            )}
            
            <button
              onClick={onNext}
              className="px-3 py-1 text-sm bg-indigo-600 text-neutral-50 rounded-md hover:bg-indigo-700"
            >
              {step === totalSteps ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialOverlay;