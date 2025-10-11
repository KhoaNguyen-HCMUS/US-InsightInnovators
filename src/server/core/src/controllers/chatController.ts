import { Request, Response } from 'express';
import { z } from 'zod';
import { ChatService } from '../services/chatService';

// Validation schemas
const createSessionSchema = z.object({
  purpose: z.string().optional().default('medical_diagnosis'), // Only one purpose
  lang: z.string().optional().default('vi'),
  model_name: z.string().optional().default('gemini-2.0-flash-exp')
});

const sendMessageSchema = z.object({
  session_id: z.string(),
  content: z.string().min(1, 'Message content is required'),
});

// Types
interface ChatRequest extends Request {
  body: {
    session_id?: string;
    content?: string;
    purpose?: string;
    lang?: string;
    model_name?: string;
  };
  user?: {
    id: string;
    email: string;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  turn_index: number;
  created_at: Date;
  meta?: any;
}

export class ChatController {
  // FIX: Use ChatController.getChatService() instead of this.getChatService()
  static getChatService() {
    return new ChatService();
  }

  // Create new chat session
  static async createSession(req: ChatRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to start a chat session'
        });
      }

      console.log('🔍 User authenticated:', req.user);

      const validationResult = createSessionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.log('❌ Validation failed:', validationResult.error);
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues
        });
      }

      const { purpose, lang, model_name } = validationResult.data;
      console.log('✅ Request validated:', { purpose, lang, model_name });

      // FIX: Use ChatController.getChatService() instead of this.getChatService()
      const chatService = ChatController.getChatService();
      const session = await chatService.createSession({
        userId: req.user.id,
        purpose,
        lang,
        modelName: model_name
      });

      console.log('✅ Session created successfully:', session.id.toString());

      return res.json({
        success: true,
        data: {
          session_id: session.id.toString(),
          purpose: session.purpose,
          lang: session.lang,
          started_at: session.started_at
        }
      });

    } catch (error) {
      console.error('❌ Create session error:', error);
      console.error('❌ Full error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      return res.status(500).json({
        error: 'Failed to create chat session',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Unable to start chat session'
      });
    }
  }

  // Send message in chat session
  static async sendMessage(req: ChatRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to send messages'
        });
      }

      const validationResult = sendMessageSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues
        });
      }

      const { session_id, content } = validationResult.data;

      // FIX: Use ChatController.getChatService()
      const chatService = ChatController.getChatService();
      const result = await chatService.sendMessage({
        sessionId: session_id,
        userId: req.user.id,
        userMessage: content
      });

      return res.json({
        success: true,
        data: {
          session_id,
          messages: result.messages,
          diagnosis_context: result.diagnosisContext
        }
      });

    } catch (error) {
      console.error('❌ Send message error:', error);
      return res.status(500).json({
        error: 'Failed to send message',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Unable to process message'
      });
    }
  }

  // Get chat history for session
  static async getChatHistory(req: ChatRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to view chat history'
        });
      }
  
      // ✅ FIX: Get sessionId from query parameter instead of path parameter
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({
          error: 'Session ID is required as query parameter',
          message: 'Please provide sessionId in query string'
        });
      }
  
      const chatService = ChatController.getChatService();
      const history = await chatService.getChatHistory(sessionId, req.user.id);
  
      return res.json({
        success: true,
        data: history
      });
  
    } catch (error) {
      console.error('❌ Get chat history error:', error);
      return res.status(500).json({
        error: 'Failed to get chat history',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Unable to retrieve chat history'
      });
    }
  }

  // Get user's chat sessions
  static async getUserSessions(req: ChatRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to view sessions'
        });
      }

      // FIX: Use ChatController.getChatService()
      const chatService = ChatController.getChatService();
      const sessions = await chatService.getUserSessions(req.user.id);

      return res.json({
        success: true,
        data: sessions
      });

    } catch (error) {
      console.error('❌ Get user sessions error:', error);
      return res.status(500).json({
        error: 'Failed to get sessions',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Unable to retrieve chat sessions'
      });
    }
  }
}