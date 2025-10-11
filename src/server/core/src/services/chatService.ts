import { PrismaClient } from '../generated/prisma';
import axios from 'axios';

const prisma = new PrismaClient();

interface CreateSessionRequest {
  userId: string;
  purpose: string;
  lang: string;
  modelName: string;
}

interface SendMessageRequest {
  sessionId: string;
  userId: string;
  userMessage: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  turn_index: number;
  created_at: Date;
  meta?: any;
}

export class ChatService {
  private mlServiceUrl: string;

  constructor() {
    // FIX: Remove extra path if exists
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    // Clean up URL - remove trailing slash and extra paths
    this.mlServiceUrl = this.mlServiceUrl.replace(/\/+$/, '').replace('/predict-food101', '');
    
    console.log('🔧 ML Service URL configured:', this.mlServiceUrl);
  }

  async createSession(request: CreateSessionRequest) {
    try {
      const session = await prisma.chat_sessions.create({
        data: {
          user_id: BigInt(request.userId),
          purpose: request.purpose,
          lang: request.lang,
          model_name: request.modelName,
          started_at: new Date()
        }
      });

      // Add welcome message
      await prisma.chat_messages.create({
        data: {
          session_id: session.id,
          role: 'assistant',
          turn_index: 1,
          content: `Xin chào! Tôi là trợ lý y khoa AI của bạn. 

Tôi có thể giúp bạn:
• Phân tích các triệu chứng bạn đang gặp
• Đưa ra tư vấn sơ bộ về tình trạng sức khỏe
• Đề xuất các bước tiếp theo cần làm

**Lưu ý quan trọng:** Thông tin tôi cung cấp chỉ mang tính tham khảo, không thay thế việc thăm khám trực tiếp với bác sĩ.

Hãy mô tả các triệu chứng bạn đang gặp phải nhé!`,
        }
      });

      return session;

    } catch (error) {
      console.error('Database error creating session:', error);
      throw new Error('Failed to create chat session');
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<{
    messages: ChatMessage[];
    diagnosisContext?: any;
  }> {
    try {
      // Verify session ownership
      const session = await prisma.chat_sessions.findFirst({
        where: {
          id: BigInt(request.sessionId),
          user_id: BigInt(request.userId)
        }
      });

      if (!session) {
        throw new Error('Chat session not found or access denied');
      }

      // Get last 10 messages for AI context (KEEP THIS)
      const contextMessages = await prisma.chat_messages.findMany({
        where: { 
          session_id: BigInt(request.sessionId),
          role: { not: 'system' }
        },
        orderBy: { turn_index: 'desc' },
        take: 10  // ✅ Still get 10 for context
      });

      // Build chat history for ML service
      const chatHistory = contextMessages
        .reverse()
        .map(msg => `${msg.role}: ${msg.content}`)
        .slice(0, -1); // Remove current user message if exists

      // Get current turn index
      const lastMessage = await prisma.chat_messages.findFirst({
        where: { session_id: BigInt(request.sessionId) },
        orderBy: { turn_index: 'desc' }
      });

      const userTurnIndex = (lastMessage?.turn_index || 0) + 1;
      const aiTurnIndex = userTurnIndex + 1;

      // Save user message
      await prisma.chat_messages.create({
        data: {
          session_id: BigInt(request.sessionId),
          role: 'user',
          turn_index: userTurnIndex,
          content: request.userMessage,
        }
      });

      // Call ML service with chat context
      let aiResponse: string;
      let diagnosisContext: any = null;
      let medicalSnippets: string[] = [];

      try {
        console.log(`🤖 Calling ML service: ${this.mlServiceUrl}/api/chat`);
        
        const mlResponse = await axios.post(`${this.mlServiceUrl}/api/chat`, {
          message: request.userMessage,
          chat_history: chatHistory,
          session_id: request.sessionId
        }, {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        aiResponse = mlResponse.data.response;
        diagnosisContext = mlResponse.data.diagnosis_context;
        medicalSnippets = mlResponse.data.medical_snippets || [];

        console.log(`✅ ML service response received`);

      } catch (mlError) {
        console.error('❌ ML service error details:', {
          url: `${this.mlServiceUrl}/api/chat`,
          error: mlError.response?.data || mlError.message,
          status: mlError.response?.status
        });
        
        // Fallback response
        const hasSymptoms = chatHistory.some(msg => 
          msg.includes('đau') || msg.includes('sốt') || msg.includes('mệt') || 
          msg.includes('khó thở') || msg.includes('chóng mặt')
        );

        if (hasSymptoms) {
          aiResponse = `Tôi hiểu bạn đang có một số triệu chứng mà chúng ta đã thảo luận. 

Hiện tại hệ thống gặp vấn đề kỹ thuật, nhưng dựa trên cuộc trò chuyện của chúng ta:

**Khuyến nghị chung:**
• Theo dõi các triệu chứng bạn đã đề cập
• Ghi lại thời gian, mức độ của các triệu chứng
• Nếu triệu chứng trầm trọng hơn: liên hệ bác sĩ

**Trường hợp cần đến viện ngay:**
• Khó thở nghiêm trọng • Đau ngực dữ dội • Sốt cao trên 39°C

**Lưu ý:** Thông tin chỉ mang tính tham khảo, không thay thế việc khám bác sĩ.`;
        } else {
          aiResponse = `Xin lỗi, tôi gặp vấn đề kỹ thuật. Vui lòng thử lại sau hoặc liên hệ bác sĩ nếu cần tư vấn gấp.`;
        }
      }

      // Save AI response  
      const aiMessage = await prisma.chat_messages.create({
        data: {
          session_id: BigInt(request.sessionId),
          role: 'assistant',
          turn_index: aiTurnIndex,
          content: aiResponse,
          meta: diagnosisContext ? JSON.stringify({
            diagnosis_context: diagnosisContext,
            medical_snippets: medicalSnippets,
            context_messages_count: chatHistory.length
          }) : undefined,
          top_passages: medicalSnippets.length > 0 ? JSON.stringify(medicalSnippets) : undefined
        }
      });

      // FIX: Only return the new AI response (1 message)
      const formattedMessage: ChatMessage = {
        role: 'assistant',
        content: aiMessage.content || '',
        turn_index: aiMessage.turn_index,
        created_at: aiMessage.created_at,
        meta: aiMessage.meta ? JSON.parse(aiMessage.meta as string) : undefined
      };

      return {
        messages: [formattedMessage],  // ✅ Only 1 AI response message
        diagnosisContext
      };

    } catch (error) {
      console.error('❌ Send message error:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId: string, userId: string) {
    try {
      const session = await prisma.chat_sessions.findFirst({
        where: {
          id: BigInt(sessionId),
          user_id: BigInt(userId)
        },
        include: {
          chat_messages: {
            where: {
              role: { not: 'system' }
            },
            orderBy: { turn_index: 'asc' }
          }
        }
      });

      if (!session) {
        throw new Error('Chat session not found or access denied');
      }

      return {
        session_id: session.id.toString(),
        purpose: session.purpose,
        started_at: session.started_at,
        messages: session.chat_messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          turn_index: msg.turn_index,
          created_at: msg.created_at
        }))
      };

    } catch (error) {
      console.error('Get chat history error:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string) {
    try {
      const sessions = await prisma.chat_sessions.findMany({
        where: { 
          user_id: BigInt(userId),
          purpose: 'medical_diagnosis'
        },
        orderBy: { started_at: 'desc' },
        take: 20,
        select: {
          id: true,
          purpose: true,
          started_at: true,
          ended_at: true,
          chat_messages: {
            where: { role: 'user' },
            take: 1,
            orderBy: { turn_index: 'asc' },
            select: { content: true }
          }
        }
      });

      return sessions.map(session => ({
        session_id: session.id.toString(),
        purpose: session.purpose,
        started_at: session.started_at,
        ended_at: session.ended_at,
        preview: session.chat_messages[0]?.content?.substring(0, 100) + '...' || 'No messages'
      }));

    } catch (error) {
      console.error('Get user sessions error:', error);
      throw error;
    }
  }
}