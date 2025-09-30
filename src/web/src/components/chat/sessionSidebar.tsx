import React from 'react';
import type { ChatSession } from '../../types/chat';
import { ChatUtils } from '../../utils/chatUtils';

interface SessionSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onNewSession: () => void;
  isLoading?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  isLoading = false,
  isOpen = true,
  onClose
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-0 
        w-80 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${!isOpen ? 'md:w-0 md:border-r-0' : ''}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lịch sử trò chuyện</h2>
            <button
              onClick={onClose}
              className="md:hidden p-1 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={onNewSession}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Cuộc trò chuyện mới</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="mb-3 p-3 bg-gray-100 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                <p className="text-xs mt-1">Bắt đầu trò chuyện đầu tiên của bạn!</p>
              </div>
            ) : (
              <div className="p-2">
                {sessions.map((session) => {
                  const isActive = session.id === currentSessionId;
                  const sessionTime = ChatUtils.formatMessageTime(session.started_at);
                  
                  return (
                    <button
                      key={session.id}
                      onClick={() => onSelectSession(session)}
                      className={`
                        w-full text-left p-3 mb-2 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' 
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${
                            isActive ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            Phiên {session.id}
                          </div>
                          
                          <div className={`text-xs mt-1 ${
                            isActive ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {sessionTime}
                          </div>

                          {/* Session Purpose */}
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {session.purpose === 'medical_diagnosis' ? 'Chẩn đoán y khoa' :
                               session.purpose === 'general_health' ? 'Tư vấn sức khỏe' :
                               session.purpose === 'symptom_checker' ? 'Kiểm tra triệu chứng' :
                               'Tư vấn y khoa'}
                            </span>
                          </div>
                        </div>

                        {isActive && (
                          <div className="ml-2 flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              <p>💡 Mẹo: Thông tin chỉ mang tính tham khảo</p>
              <p>Hãy tham khảo ý kiến bác sĩ khi cần thiết</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionSidebar;