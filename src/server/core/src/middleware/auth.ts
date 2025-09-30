import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET at startup
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Interface for authenticated requests
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    userId: string;
  };
}

// JWT payload interface
interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Middleware to verify JWT token and add user to request
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('🔐 Auth middleware - Header:', authHeader);
  console.log('🔐 Auth middleware - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      message: 'Please provide a valid access token'
    });
  }

  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET not configured');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: 'JWT secret not configured'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email });
    
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      userId: decoded.userId // For compatibility
    };
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Please provide a valid access token'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Token verification failed'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token provided)
export const optionalAuth = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7)
      : null;

    if (!token) {
      // No token provided, continue without user
      return next();
    }

    // Try to verify token
    try {
      const verifiedToken = jwt.verify(token, JWT_SECRET!);
      const decoded = verifiedToken as JwtPayload;
      
      // Verify user exists
      const user = await prisma.users.findUnique({
        where: { id: BigInt(decoded.userId) },
        select: {
          id: true,
          email: true,
        }
      });

      if (user) {
        req.user = {
          id: user.id.toString(),
          email: user.email,
        };
      }
    } catch (jwtError) {
      // Invalid token, continue without user (don't fail)
      console.warn('⚠️ Invalid token in optional auth:', jwtError instanceof Error ? jwtError.message : 'Unknown error');
    }

    next();

  } catch (error) {
    console.error('❌ Optional auth middleware error:', error);
    // Don't fail on optional auth errors
    next();
  }
};