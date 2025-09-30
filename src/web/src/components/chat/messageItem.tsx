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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'} w-full md:max-w-[80%] lg:max-w-[70%]`}>
        {/* Avatar and Message Container */}
        <div
          className={`flex items-start ${isUser ? 'flex-row-reverse' : 'flex-row'} ${
            isUser ? 'space-x-reverse space-x-3' : 'space-x-3'
          }`}
        >
          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm ${
              isUser ? 'bg-blue-600' : 'bg-green-600'
            } ${isUser ? 'ml-2' : 'mr-2'}`}
          >
            {isUser ? <span className='text-sm'>Bạn</span> : <span className='text-sm'>AI</span>}
          </div>

          {/* Message Content */}
          <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block p-4 rounded-lg shadow-sm ${
                isUser
                  ? 'bg-blue-500 text-white rounded-tr-none border border-blue-600'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
              }`}
            >
              <div className='whitespace-pre-wrap text-[15px] leading-relaxed'>{content}</div>

              {/* Medical Citations */}
              {citations.length > 0 && !isUser && (
                <div className='mt-4 pt-3 border-t border-gray-200'>
                  <div className='text-sm font-medium text-gray-700 mb-2 flex items-center'>
                    <span className='mr-1'>📚</span>
                    <span>Nguồn tham khảo:</span>
                  </div>
                  {citations.map((citation, index) => (
                    <div key={index} className='text-xs text-gray-600 italic mb-2 pl-3 border-l-2 border-blue-200 py-1'>
                      "{citation}"
                    </div>
                  ))}
                </div>
              )}

              {/* Medical Snippets Info */}
              {message.meta?.medical_snippets && message.meta.medical_snippets.length > 0 && !isUser && (
                <div className='mt-3 text-xs flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded'>
                  <span className='mr-1'>🔍</span>
                  <span>Tìm thấy {message.meta.medical_snippets.length} tài liệu y khoa liên quan</span>
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right mr-1' : 'text-left ml-1'}`}>
              {ChatUtils.formatMessageTime(message.created_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
