export interface ChatSession {
  session_id: string;
  purpose: string;
  lang?: string;
  started_at: string;
  ended_at: string | null;
  preview: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  turn_index: number;
  created_at: string;
  meta?: {
    diagnosis_context?: any;
    medical_snippets?: string[];
    context_messages_count?: number;
  };
}

export interface CreateSessionRequest {
  purpose?: string;
  lang?: string;
  model_name?: string;
}

export interface SendMessageRequest {
  session_id: string;
  content: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    session_id: string;
    messages: ChatMessage[];
    diagnosis_context?: any;
  };
}

export interface SessionsResponse {
  success: boolean;
  data: ChatSession[];
}

export interface ChatHistoryResponse {
  success: boolean;
  data: {
    session_id: string;
    purpose: string;
    started_at: string;
    messages: ChatMessage[];
  };
}
