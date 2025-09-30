import jwt from "jsonwebtoken";
const prisma = require("../../prisma/client");
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET at startup
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Interface for authenticated requests
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  userId?: bigint;
}

// JWT payload interface
interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Middleware to verify JWT token and add user to request
export const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7) // Remove 'Bearer ' prefix
        : null;

    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        message:
          "No token provided. Please include a valid JWT token in the Authorization header.",
      });
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      const verifiedToken = jwt.verify(token, JWT_SECRET!);
      decoded = verifiedToken as JwtPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: "Token expired",
          message: "Your session has expired. Please log in again.",
        });
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: "Invalid token",
          message: "The provided token is invalid.",
        });
      } else {
        throw jwtError;
      }
    }

    // Verify user still exists in database
    const user = await prisma.users.findUnique({
      where: { id: BigInt(decoded.userId) },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "The user associated with this token no longer exists.",
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id.toString(),
      email: user.email,
    };

    // Also set userId as bigint for backward compatibility
    req.userId = user.id;

    // Continue to next middleware
    next();
  } catch (error) {
    console.error("❌ Authentication middleware error:", error);
    return res.status(500).json({
      error: "Authentication error",
      message:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : "An error occurred during authentication",
    });
  }
};

// Optional authentication middleware (doesn't fail if no token provided)
export const optionalAuth = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
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
        },
      });

      if (user) {
        req.user = {
          id: user.id.toString(),
          email: user.email,
        };
        // Also set userId as bigint for backward compatibility
        req.userId = user.id;
      }
    } catch (jwtError) {
      // Invalid token, continue without user (don't fail)
      console.warn(
        "⚠️ Invalid token in optional auth:",
        jwtError instanceof Error ? jwtError.message : "Unknown error"
      );
    }

    next();
  } catch (error) {
    console.error("❌ Optional auth middleware error:", error);
    // Don't fail on optional auth errors
    next();
  }
};
