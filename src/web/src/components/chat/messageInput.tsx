import React, { useState, useRef, useEffect } from 'react';
import { ChatUtils } from '../../utils/chatUtils';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Nhập tin nhắn về sức khỏe của bạn..." 
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isMedicalQuery = ChatUtils.containsMedicalTerms(message);

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        {/* Medical Query Indicator */}
        {isMedicalQuery && message.length > 5 && (
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Tôi phát hiện bạn đang hỏi về sức khỏe. Trợ lý AI sẽ cung cấp thông tin tham khảo từ nguồn y khoa đáng tin cậy.</span>
          </div>
        )}

        <div className={`flex items-end space-x-3 ${isFocused ? 'ring-2 ring-blue-500' : ''} rounded-lg border transition-all duration-200`}>
          {/* Message Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 border-0 resize-none focus:outline-none focus:ring-0 bg-transparent"
              style={{ 
                maxHeight: '150px',
                minHeight: '50px'
              }}
            />
          </div>

          {/* Send Button */}
          <div className="p-2">
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className={`p-2 rounded-lg transition-all duration-200 ${
                message.trim() && !disabled
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {disabled ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            <span>Enter để gửi, Shift+Enter để xuống dòng</span>
          </div>
          <div className={message.length > 500 ? 'text-red-500' : ''}>
            {message.length}/1000
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;