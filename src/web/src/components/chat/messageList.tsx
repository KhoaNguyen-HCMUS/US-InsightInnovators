import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types/chat';
import MessageItem from './messageItem';
import TypingIndicator from './typingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false, className = '' }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex-1 flex items-center justify-center p-4 ${className}`}>
        <div className='text-center max-w-lg mx-auto'>
          <div className='w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center shadow-sm'>
            <svg className='w-10 h-10 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
          </div>
          <h3 className='text-xl font-medium text-gray-900 mb-3'>Bắt đầu cuộc trò chuyện</h3>
          <p className='text-gray-600 mb-6'>
            Hỏi tôi về bất kỳ vấn đề sức khỏe nào. Tôi sẽ cung cấp thông tin tham khảo dựa trên nguồn y khoa đáng tin
            cậy.
          </p>

          {/* Quick Suggestions */}
          <div className='mt-6'>
            <div className='text-sm font-medium text-gray-700 mb-3'>Gợi ý câu hỏi:</div>
            <div className='space-y-3'>
              <div className='text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg border border-gray-100 transition-colors cursor-pointer shadow-sm'>
                💊 "Triệu chứng của bệnh gan nhiễm mỡ"
              </div>
              <div className='text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg border border-gray-100 transition-colors cursor-pointer shadow-sm'>
                🌡️ "Tôi bị sốt và đau đầu"
              </div>
              <div className='text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg border border-gray-100 transition-colors cursor-pointer shadow-sm'>
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
      className={`flex-1 overflow-y-auto p-5 space-y-4 ${className} scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}
      style={{ height: '100%' }}
    >
      <div className='pb-2'>
        {messages.map((message, index) => (
          <MessageItem key={`${message.turn_index}-${index}`} message={message} />
        ))}

        {/* Typing Indicator */}
        {isLoading && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className='h-4' />
      </div>
    </div>
  );
};

export default MessageList;
