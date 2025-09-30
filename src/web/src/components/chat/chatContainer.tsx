import React, { useState, useEffect } from 'react';
import type { ChatSession, ChatMessage, CreateSessionRequest } from '../../types/chat';
import { ChatService } from '../../services/chat';
import { ChatUtils } from '../../utils/chatUtils';
import ChatHeader from './chatHeader';
import MessageList from './messageList';
import MessageInput from './messageInput';
import SessionSidebar from './sessionSidebar';
import ChatWelcome from './chatWelcome';

const ChatContainer: React.FC = () => {
  // State Management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions on component mount
  useEffect(() => {
    loadUserSessions();
  }, []);

  // Load messages when session changes
  useEffect(() => {
    if (currentSession) {
      loadChatHistory(currentSession.session_id);
    } else {
      setMessages([]);
    }
  }, [currentSession]);

  // Load user's chat sessions
  const loadUserSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await ChatService.getUserSessions();
      setSessions(response.data);

      // Auto-select most recent session if available
      if (response.data.length > 0) {
        setCurrentSession(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setError('Không thể tải danh sách phiên trò chuyện');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Load chat history for a session
  const loadChatHistory = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await ChatService.getChatHistory(sessionId);
      console.log('Chat history response:', response);

      if (response.data && response.data.messages) {
        setMessages(response.data.messages);
      } else {
        setMessages([]);
        console.warn('No messages found in the response');
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setError('Không thể tải lịch sử trò chuyện');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new chat session
  const createNewSession = async () => {
    try {
      setIsLoading(true);
      const request: CreateSessionRequest = {
        purpose: 'medical_diagnosis',
        lang: 'vi',
      };

      const newSession = await ChatService.createSession(request);
      console.log('New session created:', newSession);

      // Update sessions list
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
      setError(null);
    } catch (error) {
      console.error('Failed to create session:', error);
      setError('Không thể tạo phiên trò chuyện mới');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async (content: string) => {
    if (!currentSession) {
      await createNewSession();
      // Wait for session to be created, then send message
      setTimeout(() => sendMessage(content), 500);
      return;
    }

    try {
      setIsLoading(true);

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        turn_index: messages.length,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send to backend
      const response = await ChatService.sendMessage({
        session_id: currentSession.session_id,
        content,
      });

      // Replace messages with response from backend
      setMessages(response.data.messages);

      // Scroll to bottom
      ChatUtils.scrollToBottom('messages-container');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');

      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  // Select session
  const selectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className='flex h-screen bg-linear-(--gradient-primary) overflow-hidden'>
      {/* Session Sidebar */}
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSession?.session_id || null}
        onSelectSession={selectSession}
        onNewSession={createNewSession}
        isLoading={isLoadingSessions}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col min-w-0 relative bg-bg'>
        {/* Chat Header */}
        <ChatHeader
          currentSession={currentSession}
          onNewChat={createNewSession}
          onToggleSidebar={toggleSidebar}
          messagesCount={messages.length}
        />

        {/* Error Display */}
        {error && (
          <div className='bg-error-bg border-l-4 border-error p-4 mx-4 mt-2 mb-1 rounded-r-md shadow-sm'>
            <div className='flex items-center'>
              <svg className='w-5 h-5 text-error mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                />
              </svg>
              <div>
                <p className='text-sm font-medium text-error-foreground'>{error}</p>
                <button onClick={() => setError(null)} className='text-xs text-error hover:underline mt-1'>
                  Đóng thông báo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Content */}
        <div className='flex-1 flex flex-col overflow-hidden relative'>
          {!currentSession && !isLoadingSessions ? (
            <ChatWelcome onStartChat={createNewSession} />
          ) : (
            <>
              {/* Messages */}
              <div id='messages-container' className='flex-1 overflow-hidden relative'>
                <MessageList
                  messages={messages}
                  isLoading={isLoading && messages.length > 0}
                  className='absolute inset-0'
                />
              </div>

              {/* Message Input */}
              <div className='w-full bg-bg-card shadow-md z-10'>
                <MessageInput
                  onSendMessage={sendMessage}
                  disabled={isLoading}
                  placeholder={currentSession ? 'Nhập câu hỏi về sức khỏe...' : 'Đang tạo phiên mới...'}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
