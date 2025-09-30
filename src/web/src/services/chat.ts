import type {
  ChatSession,
  ChatMessage,
  CreateSessionRequest,
  SendMessageRequest,
  ChatResponse,
  SessionsResponse,
  ChatHistoryResponse,
} from '../types/chat';

export class ChatService {
  private static getApiUrl(): string {
    return import.meta.env?.VITE_API_URL || '';
  }

  private static getHeaders(): HeadersInit {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Create new chat session
  static async createSession(request: CreateSessionRequest): Promise<ChatSession> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/chat/session`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          purpose: request.purpose || 'medical_diagnosis',
          lang: request.lang || 'vi',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to create session');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Create session error:', error);
      throw error;
    }
  }

  // Send message in chat
  static async sendMessage(request: SendMessageRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/chat/message`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });
      console.log('Send message request:', request);
      const data = await response.json();
      console.log('Send message response:', data);
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      return data;
    } catch (error) {
      console.error('❌ Send message error:', error);
      throw error;
    }
  }

  // Get chat history for session
  static async getChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
    try {
      // According to the API documentation, the parameter is directly in the path, not a query parameter
      const response = await fetch(`${this.getApiUrl()}/api/chat/session?sessionId=${sessionId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to get chat history');
      }

      return data;
    } catch (error) {
      console.error('❌ Get chat history error:', error);
      throw error;
    }
  }

  // Get user's chat sessions
  static async getUserSessions(): Promise<SessionsResponse> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/chat/sessions`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to get sessions');
      }

      return data;
    } catch (error) {
      console.error('❌ Get sessions error:', error);
      throw error;
    }
  }
}
