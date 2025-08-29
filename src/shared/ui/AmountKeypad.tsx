import React from 'react';

interface AmountKeypadProps {
  onNumberPress: (number: string) => void;
  onBackspacePress: () => void;
  onClearPress: () => void;
  onSubmitPress: () => void;
  submitDisabled?: boolean;
  submitText?: string;
}

const AmountKeypad: React.FC<AmountKeypadProps> = ({
  onNumberPress,
  onBackspacePress,
  onClearPress,
  onSubmitPress,
  submitDisabled = false,
  submitText = 'Confirm Amount',
}) => {
  const renderNumberButton = (number: string) => (
    <button
      className="rounded-full flex items-center justify-center text-xl font-bold border-2 border-gray-500 text-gray-700 hover:bg-gray-100 active:bg-gray-200 touch-target"
      onClick={() => onNumberPress(number)}
    >
      {number}
    </button>
  );

  return (
    <div className="flex flex-col h-full max-h-[50vh] p-2 sm:p-4">
      <div className="grid grid-cols-3 gap-2 flex-grow">
        {renderNumberButton('1')}
        {renderNumberButton('2')}
        {renderNumberButton('3')}
        {renderNumberButton('4')}
        {renderNumberButton('5')}
        {renderNumberButton('6')}
        {renderNumberButton('7')}
        {renderNumberButton('8')}
        {renderNumberButton('9')}
        <button
          className="rounded-full flex items-center justify-center text-lg font-bold border-2 border-red-500 text-red-500 hover:bg-red-100 active:bg-red-200 touch-target"
          onClick={onClearPress}
        >
          C
        </button>
        {renderNumberButton('0')}
        <button
          className="rounded-full flex items-center justify-center text-lg font-bold border-2 border-gray-500 text-gray-700 hover:bg-gray-100 active:bg-gray-200 touch-target"
          onClick={onBackspacePress}
        >
          ⌫
        </button>
      </div>
      <div className="mt-2">
        <button
          className={`w-full py-3 rounded-lg font-bold ${submitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'} text-neutral-50 touch-target-lg`}
          onClick={onSubmitPress}
          disabled={submitDisabled}
        >
          {submitText}
        </button>
      </div>
    </div>
  );
};

export default AmountKeypad;