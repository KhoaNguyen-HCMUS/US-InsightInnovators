import React from 'react';
import type { ChatSession } from '../../types/chat';
import { ChatUtils } from '../../utils/chatUtils';

interface ChatHeaderProps {
  currentSession: ChatSession | null;
  onNewChat: () => void;
  onToggleSidebar?: () => void;
  messagesCount?: number;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  currentSession, 
  onNewChat,
  onToggleSidebar,
  messagesCount = 0
}) => {
  const sessionTitle = currentSession 
    ? `Phiên ${currentSession.id}` 
    : 'Chưa có phiên trò chuyện';

  const sessionTime = currentSession 
    ? ChatUtils.formatMessageTime(currentSession.started_at)
    : '';

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Session Info */}
        <div className="flex items-center space-x-3">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* AI Avatar & Status */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              {/* Online Status */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            
            <div>
              <div className="font-medium text-gray-900">Trợ lý Y khoa AI</div>
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Đang trực tuyến</span>
                {currentSession && (
                  <>
                    <span>•</span>
                    <span>{messagesCount} tin nhắn</span>
                    {sessionTime && (
                      <>
                        <span>•</span>
                        <span>{sessionTime}</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Session Info */}
          {currentSession && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Phiên {currentSession.id}</span>
            </div>
          )}

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Cuộc trò chuyện mới</span>
          </button>

          {/* More Options */}
          <div className="relative">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Session Purpose Badge */}
      {currentSession && currentSession.purpose !== 'medical_diagnosis' && (
        <div className="mt-2 flex items-center space-x-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {currentSession.purpose === 'general_health' ? 'Tư vấn sức khỏe tổng quát' : 
             currentSession.purpose === 'symptom_checker' ? 'Kiểm tra triệu chứng' : 
             'Chẩn đoán y khoa'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;