import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
          AI
        </div>
        
        <div className="bg-gray-100 rounded-lg rounded-bl-none p-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <div className="text-sm text-gray-500 mt-1">Trợ lý AI đang soạn trả lời...</div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;