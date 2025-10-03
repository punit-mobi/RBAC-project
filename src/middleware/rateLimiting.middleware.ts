import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * 🚀 RATE LIMITING BEST PRACTICES & EXPLANATION
 *
 * Rate limiting is a technique to control the number of requests a client can make
 * to your API within a specific time window. It's crucial for:
 *
 * 1. **Security**: Prevents brute force attacks, DDoS attacks
 * 2. **Performance**: Protects server resources from being overwhelmed
 * 3. **Fair Usage**: Ensures all users get equal access to resources
 * 4. **Cost Control**: Prevents excessive API usage that could increase costs
 *
 * KEY CONCEPTS:
 * - **Window**: Time period for counting requests (e.g., 15 minutes)
 * - **Limit**: Maximum requests allowed in that window (e.g., 100 requests)
 * - **Key Generator**: How to identify unique users (IP, user ID, etc.)
 * - **Skip**: When to bypass rate limiting (authenticated users, etc.)
 *
 * COMMON STRATEGIES:
 * 1. **IP-based**: Limit by client IP address
 * 2. **User-based**: Limit by authenticated user ID
 * 3. **Endpoint-specific**: Different limits for different endpoints
 * 4. **Tiered**: Different limits based on user subscription level
 */

// 🛡️ GENERAL API RATE LIMIT
// This applies to all API endpoints as a baseline protection
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 1000 requests per windowMs
  message: {
    status: false,
    status_code: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many requests from this IP, please try again later.",
    error: {
      retryAfter: "15 minutes",
      limit: 100,
      window: "15 minutes",
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      status: false,
      status_code: StatusCodes.TOO_MANY_REQUESTS,
      message: "Too many requests from this IP, please try again later.",
      error: {
        retryAfter: "15 minutes",
        limit: 100,
        window: "15 minutes",
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });
  },
});

// 🔐 AUTHENTICATION ENDPOINTS RATE LIMIT
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    status: false,
    status_code: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many attempts, please try again later.",
    error: {
      retryAfter: "15 minutes",
      limit: 5,
      window: "15 minutes",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      status: false,
      status_code: StatusCodes.TOO_MANY_REQUESTS,
      message: "Too many attempts, please try again later.",
      error: {
        retryAfter: "15 minutes",
        limit: 5,
        window: "15 minutes",
        endpoint: req.path,
        ip: req.ip,
      },
    });
  },
});

// 📝 PASSWORD RESET RATE LIMIT
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    status: false,
    status_code: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many password reset attempts, please try again later.",
    error: {
      retryAfter: "1 hour",
      limit: 3,
      window: "1 hour",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      status: false,
      status_code: StatusCodes.TOO_MANY_REQUESTS,
      message: "Too many password reset attempts, please try again later.",
      error: {
        retryAfter: "1 hour",
        limit: 3,
        window: "1 hour",
        ip: req.ip,
      },
    });
  },
});

// DATA OPERATIONS RATE LIMIT
export const dataOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 data operations per windowMs
  message: {
    status: false,
    status_code: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many data operations, please slow down your requests.",
    error: {
      retryAfter: "15 minutes",
      limit: 100,
      window: "15 minutes",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      status: false,
      status_code: StatusCodes.TOO_MANY_REQUESTS,
      message: "Too many data operations, please slow down your requests.",
      error: {
        retryAfter: "15 minutes",
        limit: 100,
        window: "15 minutes",
        endpoint: req.path,
        method: req.method,
      },
    });
  },
});

// 🚀 STRICT RATE LIMIT FOR SENSITIVE OPERATIONS
// Very restrictive for admin operations, user creation, etc.
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  message: {
    status: false,
    status_code: StatusCodes.TOO_MANY_REQUESTS,
    message:
      "Too many requests to sensitive endpoints, please try again later.",
    error: {
      retryAfter: "1 hour",
      limit: 10,
      window: "1 hour",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      status: false,
      status_code: StatusCodes.TOO_MANY_REQUESTS,
      message:
        "Too many requests to sensitive endpoints, please try again later.",
      error: {
        retryAfter: "1 hour",
        limit: 10,
        window: "1 hour",
        endpoint: req.path,
        ip: req.ip,
      },
    });
  },
});

// 🔄 USER-SPECIFIC RATE LIMIT
// Rate limit based on authenticated user ID instead of IP
export const createUserBasedLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.userId ? `user:${req.userId}` : `ip:${req.ip}`;
    },
    message: {
      status: false,
      status_code: StatusCodes.TOO_MANY_REQUESTS,
      message: "Too many requests from this user, please try again later.",
      error: {
        retryAfter: `${Math.ceil(windowMs / 60000)} minutes`,
        limit: max,
        window: `${Math.ceil(windowMs / 60000)} minutes`,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
      // Skip rate limiting for admin users
      return req.isAdmin === true;
    },
  });
};

// 📈 TIERED RATE LIMITING
// Different limits based on user subscription level
export const createTieredLimiter = (
  freeLimit: number,
  premiumLimit: number
) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req: Request) => {
      // Check user subscription level (you'll need to implement this logic)
      const isPremium = req.userId ? checkUserSubscription(req.userId) : false;
      return isPremium ? premiumLimit : freeLimit;
    },
    message: {
      status: false,
      status_code: StatusCodes.TOO_MANY_REQUESTS,
      message: "Rate limit exceeded. Upgrade to premium for higher limits.",
      error: {
        retryAfter: "15 minutes",
        upgradeRequired: true,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Helper function to check user subscription (implement based on your user model)
const checkUserSubscription = (userId: any): boolean => {
  // Implement your subscription checking logic here
  // This is just a placeholder
  return false;
};

// 🛠️ DEVELOPMENT RATE LIMIT
// More lenient limits for development environment
export const developmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit for development
  message: {
    status: false,
    status_code: StatusCodes.TOO_MANY_REQUESTS,
    message: "Development rate limit exceeded.",
    error: {
      retryAfter: "15 minutes",
      limit: 10000,
      environment: "development",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🎯 ENDPOINT-SPECIFIC RATE LIMITERS
export const rateLimiters = {
  // Authentication endpoints
  login: authLimiter,
  register: authLimiter,
  passwordReset: passwordResetLimiter,

  // Data operations
  users: dataOperationsLimiter,
  roles: dataOperationsLimiter,
  posts: dataOperationsLimiter,

  // Sensitive operations
  admin: strictLimiter,
  userCreation: strictLimiter,

  // General API protection
  general: generalApiLimiter,

  // Development
  development: developmentLimiter,
};

export default rateLimiters;
