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
      className="flex-1 aspect-square rounded-full flex items-center justify-center m-1 text-xl font-bold border-2 border-gray-500 text-gray-700 hover:bg-gray-100 active:bg-gray-200"
      onClick={() => onNumberPress(number)}
    >
      {number}
    </button>
  );

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between mb-2">
        {renderNumberButton('1')}
        {renderNumberButton('2')}
        {renderNumberButton('3')}
      </div>
      <div className="flex justify-between mb-2">
        {renderNumberButton('4')}
        {renderNumberButton('5')}
        {renderNumberButton('6')}
      </div>
      <div className="flex justify-between mb-2">
        {renderNumberButton('7')}
        {renderNumberButton('8')}
        {renderNumberButton('9')}
      </div>
      <div className="flex justify-between mb-2">
        <button
          className="flex-1 aspect-square rounded-full flex items-center justify-center m-1 text-lg font-bold border-2 border-red-500 text-red-500 hover:bg-red-100 active:bg-red-200"
          onClick={onClearPress}
        >
          C
        </button>
        {renderNumberButton('0')}
        <button
          className="flex-1 aspect-square rounded-full flex items-center justify-center m-1 text-lg font-bold border-2 border-gray-500 text-gray-700 hover:bg-gray-100 active:bg-gray-200"
          onClick={onBackspacePress}
        >
          ⌫
        </button>
      </div>
      <div className="flex mt-2">
        <button
          className={`flex-1 py-3 rounded-lg font-bold ${submitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'} text-white`}
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