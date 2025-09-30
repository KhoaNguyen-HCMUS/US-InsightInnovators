import React from 'react';
import type { ChatMessage } from '../../types/chat';
import { ChatUtils } from '../../utils/chatUtils';

interface MessageItemProps {
  message: ChatMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { content, citations } = ChatUtils.extractCitations(message.content);
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
            isUser ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            {isUser ? 'U' : 'AI'}
          </div>
          
          <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {/* Message Content */}
            <div className={`inline-block p-3 rounded-lg ${
              isUser 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              <div className="whitespace-pre-wrap">{content}</div>
              
              {/* Medical Citations */}
              {citations.length > 0 && !isUser && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    📚 Nguồn tham khảo:
                  </div>
                  {citations.map((citation, index) => (
                    <div key={index} className="text-xs text-gray-500 italic mb-1 pl-3 border-l-2 border-gray-300">
                      "{citation}"
                    </div>
                  ))}
                </div>
              )}
              
              {/* Medical Snippets Info */}
              {message.meta?.medical_snippets && message.meta.medical_snippets.length > 0 && !isUser && (
                <div className="mt-2 text-xs text-gray-500">
                  🔍 Tìm thấy {message.meta.medical_snippets.length} tài liệu y khoa liên quan
                </div>
              )}
            </div>
            
            {/* Timestamp */}
            <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {ChatUtils.formatMessageTime(message.created_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;