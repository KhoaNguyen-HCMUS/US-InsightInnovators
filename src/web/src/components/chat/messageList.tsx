import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types/chat';
import MessageItem from './messageItem';
import TypingIndicator from './typingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading = false,
  className = "" 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bắt đầu cuộc trò chuyện</h3>
          <p className="text-gray-500 max-w-sm">
            Hỏi tôi về bất kỳ vấn đề sức khỏe nào. Tôi sẽ cung cấp thông tin tham khảo dựa trên nguồn y khoa đáng tin cậy.
          </p>
          
          {/* Quick Suggestions */}
          <div className="mt-6 space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-3">Gợi ý câu hỏi:</div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                💊 "Triệu chứng của bệnh gan nhiễm mỡ"
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                🌡️ "Tôi bị sốt và đau đầu"
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                ❤️ "Cách phòng ngừa tăng huyết áp"
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-y-auto p-4 space-y-1 ${className}`}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {messages.map((message, index) => (
        <MessageItem key={`${message.turn_index}-${index}`} message={message} />
      ))}
      
      {/* Typing Indicator */}
      {isLoading && <TypingIndicator />}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;