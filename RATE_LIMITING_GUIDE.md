# 🚀 Rate Limiting Implementation Guide

## 📋 Table of Contents

1. [What is Rate Limiting?](#what-is-rate-limiting)
2. [Why Do We Need Rate Limiting?](#why-do-we-need-rate-limiting)
3. [Implementation Overview](#implementation-overview)
4. [Rate Limiting Strategies](#rate-limiting-strategies)
5. [Configuration Details](#configuration-details)
6. [Best Practices](#best-practices)
7. [Testing Rate Limits](#testing-rate-limits)
8. [Monitoring & Analytics](#monitoring--analytics)
9. [Troubleshooting](#troubleshooting)

## 🎯 What is Rate Limiting?

Rate limiting is a technique to control the number of requests a client can make to your API within a specific time window. It's like a bouncer at a club - it controls how many people can enter and how often.

### Key Concepts:

- **Window**: Time period for counting requests (e.g., 15 minutes)
- **Limit**: Maximum requests allowed in that window (e.g., 100 requests)
- **Key Generator**: How to identify unique users (IP, user ID, etc.)
- **Skip**: When to bypass rate limiting (authenticated users, etc.)

## 🛡️ Why Do We Need Rate Limiting?

### 1. **Security Protection**

- **Brute Force Attacks**: Prevents attackers from trying multiple password combinations
- **DDoS Protection**: Stops distributed denial-of-service attacks
- **API Abuse**: Prevents malicious users from overwhelming your server

### 2. **Performance Optimization**

- **Resource Protection**: Prevents server overload
- **Fair Usage**: Ensures all users get equal access
- **Cost Control**: Prevents excessive API usage that could increase costs

### 3. **Business Benefits**

- **User Experience**: Maintains consistent performance for legitimate users
- **Scalability**: Allows you to plan and scale your infrastructure
- **Compliance**: Meets security requirements and standards

## 🏗️ Implementation Overview

Our rate limiting system uses `express-rate-limit` with multiple strategies:

```typescript
// Different rate limiters for different use cases
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  // ... other configurations
});
```

## 🎛️ Rate Limiting Strategies

### 1. **IP-Based Rate Limiting**

```typescript
// Limits requests per IP address
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  // Uses req.ip as the key
});
```

### 2. **User-Based Rate Limiting**

```typescript
// Limits requests per authenticated user
export const createUserBasedLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req: Request) => {
      return req.userId ? `user:${req.userId}` : `ip:${req.ip}`;
    },
  });
};
```

### 3. **Endpoint-Specific Rate Limiting**

```typescript
// Different limits for different endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Very restrictive for auth
});

export const dataOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // More lenient for data operations
});
```

### 4. **Tiered Rate Limiting**

```typescript
// Different limits based on user subscription
export const createTieredLimiter = (
  freeLimit: number,
  premiumLimit: number
) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req: Request) => {
      const isPremium = checkUserSubscription(req.userId);
      return isPremium ? premiumLimit : freeLimit;
    },
  });
};
```

## ⚙️ Configuration Details

### Current Rate Limiting Configuration:

| Endpoint Type            | Window     | Limit         | Purpose                 |
| ------------------------ | ---------- | ------------- | ----------------------- |
| **General API**          | 15 minutes | 1000 requests | Baseline protection     |
| **Authentication**       | 15 minutes | 5 requests    | Prevent brute force     |
| **Password Reset**       | 1 hour     | 3 requests    | Prevent abuse           |
| **Data Operations**      | 15 minutes | 200 requests  | Normal usage            |
| **Sensitive Operations** | 1 hour     | 10 requests   | Admin/delete operations |

### Rate Limiter Types:

#### 1. **General API Limiter**

- **Purpose**: Baseline protection for all API endpoints
- **Limit**: 1000 requests per 15 minutes per IP
- **Applied to**: All `/api/*` routes

#### 2. **Authentication Limiter**

- **Purpose**: Prevent brute force attacks on login/register
- **Limit**: 5 requests per 15 minutes per IP
- **Applied to**: `/api/v1/auth/login`, `/api/v1/auth/register`

#### 3. **Password Reset Limiter**

- **Purpose**: Prevent password reset abuse
- **Limit**: 3 requests per hour per IP
- **Applied to**: `/api/v1/auth/request-password-reset`, `/api/v1/auth/reset-password/*`

#### 4. **Data Operations Limiter**

- **Purpose**: Normal CRUD operations
- **Limit**: 200 requests per 15 minutes per IP
- **Applied to**: GET, POST, PATCH operations

#### 5. **Strict Limiter**

- **Purpose**: Sensitive operations (admin, delete)
- **Limit**: 10 requests per hour per IP
- **Applied to**: DELETE operations, admin endpoints

## 🎯 Best Practices

### 1. **Choose Appropriate Limits**

```typescript
// ❌ Too restrictive - blocks legitimate users
max: 1;

// ✅ Balanced - allows normal usage but prevents abuse
max: 100;

// ❌ Too lenient - doesn't provide protection
max: 10000;
```

### 2. **Use Different Strategies for Different Endpoints**

```typescript
// Authentication endpoints need strict limits
authLimiter: 5 requests per 15 minutes

// Data reading can be more lenient
dataOperationsLimiter: 200 requests per 15 minutes

// Sensitive operations need strict limits
strictLimiter: 10 requests per hour
```

### 3. **Provide Clear Error Messages**

```typescript
message: {
  status: false,
  status_code: StatusCodes.TOO_MANY_REQUESTS,
  message: "Too many requests, please try again later.",
  error: {
    retryAfter: "15 minutes",
    limit: 100,
    window: "15 minutes"
  }
}
```

### 4. **Include Rate Limit Headers**

```typescript
standardHeaders: true, // Return rate limit info in headers
legacyHeaders: false, // Disable old X-RateLimit-* headers
```

### 5. **Skip Rate Limiting for Admins**

```typescript
skip: (req: Request) => {
  return req.isAdmin === true;
};
```

### 6. **Skip Successful Requests When Appropriate**

```typescript
skipSuccessfulRequests: true, // Don't count successful auth attempts
```

## 🧪 Testing Rate Limits

### 1. **Manual Testing with curl**

```bash
# Test authentication rate limit (should fail after 5 attempts)
for i in {1..6}; do
  curl -X POST http://localhost:4000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
  echo "Attempt $i"
done
```

### 2. **Testing with Postman**

1. Create a collection with multiple requests
2. Use Postman's Collection Runner
3. Set iterations to exceed the rate limit
4. Observe the rate limit responses

### 3. **Automated Testing**

```typescript
// Example test case
describe("Rate Limiting", () => {
  it("should block requests after limit exceeded", async () => {
    // Make requests up to the limit
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "wrong" });
    }

    // This should be rate limited
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "wrong" });

    expect(response.status).toBe(429);
    expect(response.body.message).toContain("Too many requests");
  });
});
```

## 📊 Monitoring & Analytics

### 1. **Rate Limit Headers**

The API returns these headers with each response:

```
RateLimit-Limit: 1000
RateLimit-Remaining: 999
RateLimit-Reset: 1640995200
```

### 2. **Logging Rate Limit Events**

```typescript
handler: (req: Request, res: Response) => {
  console.log(`Rate limit exceeded for IP: ${req.ip}`);
  console.log(`User Agent: ${req.get("User-Agent")}`);
  console.log(`Endpoint: ${req.path}`);

  res.status(429).json({
    // ... error response
  });
};
```

### 3. **Metrics to Track**

- Rate limit hits per endpoint
- Most common IPs hitting limits
- Time patterns of rate limit violations
- User agent analysis

## 🔧 Troubleshooting

### Common Issues:

#### 1. **Rate Limits Too Strict**

**Symptoms**: Legitimate users getting blocked
**Solution**: Increase limits or adjust time windows

```typescript
// Increase limit
max: 200, // instead of 50

// Increase time window
windowMs: 60 * 60 * 1000, // 1 hour instead of 15 minutes
```

#### 2. **Rate Limits Not Working**

**Symptoms**: No rate limiting happening
**Solution**: Check middleware order and configuration

```typescript
// Ensure rate limiter is applied before routes
app.use("/api", generalApiLimiter);
app.use("/api/v1/auth", authRouter);
```

#### 3. **Shared IP Issues**

**Symptoms**: Multiple users from same IP getting blocked
**Solution**: Use user-based rate limiting

```typescript
keyGenerator: (req: Request) => {
  return req.userId ? `user:${req.userId}` : `ip:${req.ip}`;
};
```

#### 4. **Development Environment Issues**

**Symptoms**: Rate limits interfering with development
**Solution**: Use different limits for development

```typescript
const isDevelopment = process.env.NODE_ENV === "development";
const limit = isDevelopment ? 10000 : 100;
```

## 🚀 Advanced Features

### 1. **Redis-Based Rate Limiting**

For production applications with multiple servers:

```typescript
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

export const redisRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

### 2. **Dynamic Rate Limiting**

Adjust limits based on server load:

```typescript
export const dynamicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: Request) => {
    const serverLoad = getServerLoad();
    return serverLoad > 80 ? 50 : 200;
  },
});
```

### 3. **Whitelist/Blacklist Support**

```typescript
export const whitelistRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req: Request) => {
    const whitelistedIPs = ["192.168.1.1", "10.0.0.1"];
    return whitelistedIPs.includes(req.ip);
  },
});
```

## 📝 Summary

Rate limiting is essential for:

- ✅ **Security**: Preventing brute force and DDoS attacks
- ✅ **Performance**: Maintaining server stability
- ✅ **Fair Usage**: Ensuring equal access for all users
- ✅ **Cost Control**: Preventing excessive resource usage

Our implementation provides:

- 🎯 **Multiple Strategies**: Different limits for different use cases
- 🛡️ **Security Focus**: Strict limits on authentication endpoints
- 📊 **Monitoring**: Clear error messages and headers
- 🔧 **Flexibility**: Easy to adjust limits and strategies

Remember: Rate limiting is a balance between security and usability. Start with conservative limits and adjust based on your application's needs and user behavior patterns.
