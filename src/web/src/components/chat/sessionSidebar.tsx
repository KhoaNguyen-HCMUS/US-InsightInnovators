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
  onClose,
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden' onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-0 
        w-80 bg-bg-card border-r border-border-light shadow-md md:shadow-none
        transform transition-all duration-300 ease-in-out
        flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${!isOpen ? 'md:w-64 md:border-r md:min-w-[220px]' : ''}
      `}
      >
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-border-light bg-bg-muted'>
            <h2 className='text-lg font-semibold text-text-header'>Lịch sử trò chuyện</h2>
            <button
              onClick={onClose}
              className='md:hidden p-1 text-text-muted hover:text-text-body rounded-full hover:bg-bg-hover transition-colors duration-150'
              aria-label='Đóng danh sách trò chuyện'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          {/* New Chat Button */}
          <div className='p-4 border-b border-border-light bg-bg'>
            <button
              onClick={onNewSession}
              className='w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-primary-contrast rounded-lg hover:bg-primary-hover transition-colors duration-200 shadow-sm hover:shadow-md'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
              </svg>
              <span>Cuộc trò chuyện mới</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-strong scrollbar-track-transparent'>
            {isLoading ? (
              <div className='p-4 space-y-3'>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className='p-3 bg-bg-muted rounded-lg animate-pulse'>
                    <div className='h-4 bg-border-light rounded mb-2'></div>
                    <div className='h-3 bg-border-light rounded w-2/3'></div>
                    <div className='h-5 bg-border-light rounded-full w-1/4 mt-2'></div>
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className='p-4 text-center text-text-muted flex flex-col items-center justify-center h-full'>
                <div className='mb-4 p-4 rounded-full bg-bg-muted'>
                  <svg className='w-12 h-12 text-text-muted' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                    />
                  </svg>
                </div>
                <p className='text-base font-medium text-text-body'>Chưa có cuộc trò chuyện nào</p>
                <p className='text-sm mt-2 text-text-muted'>Bắt đầu trò chuyện đầu tiên của bạn!</p>
              </div>
            ) : (
              <div className='p-3 space-y-2'>
                {sessions.map((session) => {
                  const isActive = session.session_id === currentSessionId;
                  const sessionTime = ChatUtils.formatMessageTime(session.started_at);

                  return (
                    <button
                      key={session.session_id}
                      onClick={() => onSelectSession(session)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? 'bg-opacity-10 border border-primary shadow-sm'
                            : 'bg-bg border border-border-light hover:bg-bg-hover hover:border-border-strong'
                        }
                      `}
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 min-w-0'>
                          <div className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-'}`}>
                            Phiên {session.session_id.substring(0, 8)}...
                          </div>

                          <div className={`text-xs mt-1 ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                            {sessionTime}
                          </div>

                          {/* Session Purpose */}
                          <div className='mt-2'>
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                isActive ? ' bg-opacity-15 text-primary' : 'bg-bg-muted text-text-body'
                              }`}
                            >
                              <span className='mr-1'>
                                {session.purpose === 'medical_diagnosis'
                                  ? '🩺'
                                  : session.purpose === 'general_health'
                                  ? '🏥'
                                  : session.purpose === 'symptom_checker'
                                  ? '🔍'
                                  : '💊'}
                              </span>
                              <span>
                                {session.purpose === 'medical_diagnosis'
                                  ? 'Chẩn đoán y khoa'
                                  : session.purpose === 'general_health'
                                  ? 'Tư vấn sức khỏe'
                                  : session.purpose === 'symptom_checker'
                                  ? 'Kiểm tra triệu chứng'
                                  : 'Tư vấn y khoa'}
                              </span>
                            </span>
                          </div>
                        </div>

                        {isActive && (
                          <div className='ml-2 flex-shrink-0'>
                            <div className='w-3 h-3 bg-primary rounded-full animate-pulse'></div>
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
          <div className='p-4 border-t border-border-light bg-bg-muted'>
            <div className='text-xs text-text-muted text-center'>
              <div className='flex items-center justify-center mb-1'>
                <span className='inline-flex items-center justify-center w-5 h-5 bg-info-bg text-info rounded-full mr-1'>
                  💡
                </span>
                <span className='font-medium text-text-body'>Lưu ý quan trọng</span>
              </div>
              <p>Thông tin chỉ mang tính tham khảo</p>
              <p className='font-medium mt-1 text-text-body'>Hãy tham khảo ý kiến bác sĩ khi cần thiết</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionSidebar;
