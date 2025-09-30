import axios from 'axios';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

interface DiagnoseRequest {
  question_vi: string;
  topk: number;
  userId?: string;
}

interface MLResponse {
  question_vi: string;
  query_en: string;
  topk: number;
  answer_vi: string;
  snippets: string[];
}

export class DiagnoseService {
  private mlServiceUrl: string;

  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  async processQuestion(request: DiagnoseRequest): Promise<MLResponse> {
    try {
      // Call ML service
      const response = await axios.post(`${this.mlServiceUrl}/api/process`, {
        question_vi: request.question_vi,
        topk: request.topk
      }, {
        timeout: 30000 // 30s timeout
      });

      const result = response.data;

      // Save to database if user is logged in
      if (request.userId) {
        await this.saveDiagnosis({
          userId: request.userId,
          question: request.question_vi,
          queryEn: result.query_en,
          answer: result.answer_vi,
          snippets: result.snippets
        });
      }

      return result;

    } catch (error) {
      console.error('ML Service error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Medical AI service is currently unavailable');
        }
        throw new Error(`Medical AI service error: ${error.message}`);
      }
      
      throw error;
    }
  }

  async getUserHistory(userId: string) {
    try {
      // Get diagnosis history from chat_sessions with purpose = 'single_diagnosis'
      const sessions = await prisma.chat_sessions.findMany({
        where: { 
          user_id: BigInt(userId),
          purpose: 'single_diagnosis' 
        },
        orderBy: { 
          started_at: 'desc' 
        },
        take: 50,
        include: {
          chat_messages: {
            where: {
              role: { in: ['user', 'assistant'] }
            },
            orderBy: { turn_index: 'asc' },
            take: 2 // Get question and answer
          }
        }
      });

      return sessions.map(session => {
        const userMessage = session.chat_messages.find(msg => msg.role === 'user');
        const aiMessage = session.chat_messages.find(msg => msg.role === 'assistant');
        
        return {
          id: session.id.toString(),
          question_vi: userMessage?.content || '',
          answer_vi: aiMessage?.content || '',
          created_at: session.started_at,
          meta: aiMessage?.meta ? JSON.parse(aiMessage.meta as string) : null
        };
      });

    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to retrieve diagnosis history');
    }
  }

  private async saveDiagnosis(data: {
    userId: string;
    question: string;
    queryEn: string;
    answer: string;
    snippets: string[];
  }) {
    try {
      // Create a single diagnosis session
      const session = await prisma.chat_sessions.create({
        data: {
          user_id: BigInt(data.userId),
          purpose: 'single_diagnosis', // Different from chat sessions
          lang: 'vi',
          model_name: 'gemini-2.0-flash-exp',
          started_at: new Date(),
          ended_at: new Date() // Immediately end for single Q&A
        }
      });

      // Save user question
      await prisma.chat_messages.create({
        data: {
          session_id: session.id,
          role: 'user',
          turn_index: 1,
          content: data.question,
        }
      });

      // Save AI answer with metadata
      await prisma.chat_messages.create({
        data: {
          session_id: session.id,
          role: 'assistant',
          turn_index: 2,
          content: data.answer,
          meta: JSON.stringify({
            query_en: data.queryEn,
            snippets: data.snippets,
            diagnosis_type: 'single_question'
          }),
          top_passages: JSON.stringify(data.snippets)
        }
      });

    } catch (error) {
      console.error('Failed to save diagnosis:', error);
      // Don't throw error - diagnosis still works without saving
    }
  }
}