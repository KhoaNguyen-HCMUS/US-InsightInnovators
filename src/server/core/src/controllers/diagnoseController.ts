import { Request, Response } from 'express';
import { z } from 'zod';
import { DiagnoseService } from '../services/diagnoseService';

// Validation schema
const diagnoseSchema = z.object({
  question_vi: z.string().min(1, 'Question is required'),
  topk: z.number().min(1).max(20).optional().default(8)
});

// Types
interface DiagnoseRequest extends Request {
  body: {
    question_vi: string;
    topk?: number;
  };
  user?: {
    id: string;
    email: string;
  };
}

export class DiagnoseController {
  private static diagnoseService = new DiagnoseService();

  // Main diagnose endpoint
  static async diagnose(req: DiagnoseRequest, res: Response) {
    try {
      // Validate request body
      const validationResult = diagnoseSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues
        });
      }

      const { question_vi, topk } = validationResult.data;
      const userId = req.user?.id;

      // Process diagnosis
      const result = await this.diagnoseService.processQuestion({
        question_vi,
        topk,
        userId
      });

      return res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('❌ Diagnosis error:', error);
      return res.status(500).json({
        error: 'Diagnosis failed',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Unable to process medical question'
      });
    }
  }

  // Get user's diagnosis history
  static async getHistory(req: DiagnoseRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to view history'
        });
      }

      const history = await this.diagnoseService.getUserHistory(req.user.id);

      return res.json({
        success: true,
        data: history
      });

    } catch (error) {
      console.error('❌ Get history error:', error);
      return res.status(500).json({
        error: 'Failed to get history',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Unable to retrieve diagnosis history'
      });
    }
  }
}