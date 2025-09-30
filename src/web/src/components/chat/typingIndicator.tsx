import React from 'react';
import '../../../src/components/chat/chatAnimations.css';

const TypingIndicator: React.FC = () => {
  return (
    <div className='flex justify-start mb-4 animate-fadeIn'>
      <div className='flex items-start space-x-3'>
        <div className='w-10 h-10 rounded-full bg-green-600 shadow-sm flex items-center justify-center text-white font-medium'>
          <span className='text-sm'>AI</span>
        </div>

        <div className='bg-white border border-gray-200 shadow-sm rounded-lg rounded-tl-none p-4 max-w-xs'>
          <div className='flex space-x-2'>
            <div className='w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce bounce-delay-1'></div>
            <div className='w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce bounce-delay-2'></div>
            <div className='w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce bounce-delay-3'></div>
          </div>
          <div className='text-sm text-gray-600 mt-2 font-medium'>Trợ lý AI đang soạn trả lời...</div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
