import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
const prisma = require("../../prisma/client");
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

// Types
interface AuthRequest {
  body: {
    email: string;
    password: string;
    confirmPassword?: string;
  };
}

interface AuthenticatedRequest extends AuthRequest {
  user?: {
    id: string;
    email: string;
  };
}

export class AuthController {
  // Register new user
  static async register(req: AuthRequest, res: any) {
    try {
      // Validate request body
      const validationResult = registerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues
        });
      }

      const { email, password } = validationResult.data;

      // Check if user already exists
      const existingUser = await prisma.users.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email address already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.users.create({
        data: {
          email,
          password_hash: passwordHash,
        },
        select: {
          id: true,
          email: true,
          created_at: true,
        }
      });

      // Generate JWT token
      if (!JWT_SECRET) {
        return res.status(500).json({
          error: 'JWT secret not configured',
          message: 'Server misconfiguration: JWT secret missing'
        });
      }
      const token = jwt.sign(
        { 
          userId: user.id.toString(), 
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id.toString(),
            email: user.email,
            created_at: user.created_at,
          },
          token,
        }
      });

    } catch (error) {
      console.error('❌ Registration error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Registration failed'
      });
    }
  }

  // Login user
  static async login(req: AuthRequest, res: any) {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues
        });
      }

      const { email, password } = validationResult.data;

      // Find user by email
      const user = await prisma.users.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password_hash: true,
          created_at: true,
        }
      });

      if (!user) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      if (!JWT_SECRET) {
        return res.status(500).json({
          error: 'JWT secret not configured',
          message: 'Server misconfiguration: JWT secret missing'
        });
      }
      const token = jwt.sign(
        { 
          userId: user.id.toString(), 
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id.toString(),
            email: user.email,
            created_at: user.created_at,
          },
          token,
        }
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Login failed'
      });
    }
  }

  // Get current user profile
  static async getProfile(req: AuthenticatedRequest, res: any) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to access this resource'
        });
      }

      // Get user with profile information
      const user = await prisma.users.findUnique({
        where: { id: BigInt(req.user.id) },
        select: {
          id: true,
          email: true,
          created_at: true,
          profiles: {
            select: {
              height_cm: true,
              weight_kg: true,
              sex: true,
              activity_level: true,
              goal: true,
              bmi: true,
              bmr: true,
              tdee: true,
              updated_at: true,
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User profile not found'
        });
      }

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id.toString(),
            email: user.email,
            created_at: user.created_at,
            profile: user.profiles || null,
          }
        }
      });

    } catch (error) {
      console.error('❌ Get profile error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Failed to get profile'
      });
    }
  }

  // Refresh JWT token
  static async refreshToken(req: AuthenticatedRequest, res: any) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to refresh token'
        });
      }

      // Generate new JWT token
      if (!JWT_SECRET) {
        return res.status(500).json({
          error: 'JWT secret not configured',
          message: 'Server misconfiguration: JWT secret missing'
        });
      }
      const token = jwt.sign(
        { 
          userId: req.user.id, 
          email: req.user.email 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token,
        }
      });

    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Token refresh failed'
      });
    }
  }
}