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
      loadChatHistory(currentSession.id);
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
      setMessages(response.data.messages || []);
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
        model_name: 'gemini-2.0-flash-exp'
      };

      const newSession = await ChatService.createSession(request);
      
      // Update sessions list
      setSessions(prev => [newSession, ...prev]);
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
        created_at: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to backend
      const response = await ChatService.sendMessage({
        session_id: currentSession.id,
        content
      });

      // Replace messages with response from backend
      setMessages(response.data.messages);
      
      // Scroll to bottom
      ChatUtils.scrollToBottom('messages-container');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
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
    <div className="flex h-screen bg-gray-50">
      {/* Session Sidebar */}
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        onSelectSession={selectSession}
        onNewSession={createNewSession}
        isLoading={isLoadingSessions}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <ChatHeader
          currentSession={currentSession}
          onNewChat={createNewSession}
          onToggleSidebar={toggleSidebar}
          messagesCount={messages.length}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-600 hover:text-red-800 underline mt-1"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Content */}
        {!currentSession && !isLoadingSessions ? (
          <ChatWelcome onStartChat={createNewSession} />
        ) : (
          <>
            {/* Messages */}
            <div id="messages-container" className="flex-1 overflow-hidden">
              <MessageList 
                messages={messages} 
                isLoading={isLoading && messages.length > 0}
              />
            </div>

            {/* Message Input */}
            <MessageInput
              onSendMessage={sendMessage}
              disabled={isLoading}
              placeholder={
                currentSession 
                  ? "Nhập câu hỏi về sức khỏe..." 
                  : "Đang tạo phiên mới..."
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;