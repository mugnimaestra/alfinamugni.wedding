# Week 2 Core APIs Documentation

## Overview

This document describes the core APIs implemented in Week 2 of the wedding website development, including RSVP management, guest wishes, rate limiting, spam detection, and comprehensive error handling.

## Table of Contents

1. [RSVP API](#rsvp-api)
2. [Wishes API](#wishes-api)
3. [Rate Limiting System](#rate-limiting-system)
4. [Spam Detection System](#spam-detection-system)
5. [Error Handling](#error-handling)
6. [Validation Schemas](#validation-schemas)
7. [Testing Endpoints](#testing-endpoints)
8. [Configuration](#configuration)

---

## RSVP API

### Endpoints

#### POST `/api/rsvp`
Submit or update an RSVP with comprehensive validation and rate limiting.

**Request Body:**
```json
{
  "guest_name": "John Doe",
  "email": "john@example.com",
  "phone": "+628123456789",
  "attending": "both",
  "plus_one_count": 1,
  "plus_one_name": "Jane Doe",
  "meal_preference": "chicken",
  "plus_one_meal": "vegetarian",
  "accommodation_needed": false,
  "special_requests": "Wheelchair access needed",
  "dietary_restrictions": "Nut allergy"
}
```

**Response:**
```json
{
  "success": true,
  "message": "RSVP berhasil dikirim! Email konfirmasi telah dikirim.",
  "data": {
    "id": 123,
    "guest_name": "John Doe",
    "email": "john@example.com",
    "attending": "both",
    "plus_one_count": 1,
    "created_at": "2025-10-12T11:00:00.000Z",
    "updated_at": "2025-10-12T11:00:00.000Z"
  },
  "isUpdate": false,
  "spamInfo": {
    "score": 5,
    "isSpam": false,
    "shouldBlock": false,
    "shouldModerate": false,
    "reasons": []
  }
}
```

#### GET `/api/rsvp?email={email}`
Retrieve existing RSVP by email address.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "guest_name": "John Doe",
    "email": "john@example.com",
    "attending": "both",
    "plus_one_count": 1,
    "plus_one_name": "Jane Doe",
    "meal_preference": "chicken",
    "plus_one_meal": "vegetarian",
    "accommodation_needed": false,
    "special_requests": "Wheelchair access needed",
    "dietary_restrictions": "Nut allergy",
    "created_at": "2025-10-12T11:00:00.000Z",
    "updated_at": "2025-10-12T11:00:00.000Z"
  }
}
```

### Features

- **Indonesian Context Validation**: Phone number validation for Indonesian formats
- **Rate Limiting**: 1 RSVP per email per hour, 3 per IP per hour
- **Spam Detection**: Multi-layer spam detection with scoring
- **Email Notifications**: Automatic confirmation and admin notifications
- **Update Support**: Automatically updates existing RSVPs

---

## Wishes API

### Endpoints

#### POST `/api/wishes`
Submit a guest wish with moderation and spam detection.

**Request Body:**
```json
{
  "guest_name": "Sarah Smith",
  "email": "sarah@example.com",
  "message": "Congratulations on your wedding! Wishing you both a lifetime of happiness and love together."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Terima kasih atas ucapan baik Anda! Pesan akan tampil di website.",
  "data": {
    "id": 456,
    "guest_name": "Sarah Smith",
    "message": "Congratulations on your wedding! Wishing you both a lifetime of happiness and love together.",
    "approved": true,
    "created_at": "2025-10-12T11:00:00.000Z"
  },
  "autoApproved": true,
  "requiresModeration": false,
  "spamInfo": {
    "score": 8,
    "isSpam": false,
    "shouldBlock": false,
    "shouldModerate": false,
    "reasons": []
  }
}
```

#### GET `/api/wishes?limit=50&offset=0&featured=false`
Retrieve approved wishes with pagination.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "guest_name": "Sarah Smith",
      "message": "Congratulations on your wedding! Wishing you both a lifetime of happiness and love together.",
      "created_at": "2025-10-12T11:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1,
    "hasMore": false
  }
}
```

### Features

- **Auto-Moderation**: Intelligent content moderation with configurable thresholds
- **Spam Detection**: Advanced spam detection for guest messages
- **Pagination**: Efficient pagination for large wish lists
- **Content Filtering**: Automatic filtering of inappropriate content
- **Admin Notifications**: Email notifications for pending moderation

---

## Rate Limiting System

### Configuration

The rate limiting system uses Cloudflare KV storage for distributed rate limiting across multiple instances.

### Rate Limits

| Endpoint | Type | Limit | Window |
|----------|------|-------|--------|
| RSVP | Email-based | 1 per hour | 1 hour |
| RSVP | IP-based | 3 per hour | 1 hour |
| Wishes | IP-based | 5 per hour | 1 hour |
| Photo Upload | IP-based | 10 per hour | 1 hour |
| General API | IP-based | 100 per minute | 1 minute |
| Admin API | IP-based | 1000 per hour | 1 hour |

### Headers

All rate-limited responses include appropriate headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1728748800
Retry-After: 60
```

### Implementation

```typescript
import { RateLimiters } from '~/lib/rate-limiter';

// Initialize rate limiters
RateLimiters.initialize(env.KV_RATE_LIMIT);

// Check rate limit
const limiter = RateLimiters.getRsvpLimiter();
const result = await limiter.checkLimit(email);
```

---

## Spam Detection System

### Detection Methods

1. **Keyword Detection**: International and Indonesian spam keywords
2. **Frequency Analysis**: IP and email-based submission frequency
3. **Pattern Recognition**: Suspicious message patterns and templates
4. **Email Validation**: Temporary email and suspicious domain detection
5. **Behavior Analysis**: User agent and request pattern analysis

### Scoring System

- **0-30**: Low risk (auto-approved)
- **31-70**: Medium risk (moderation required)
- **71-100**: High risk (blocked)

### Configuration

```typescript
import { createSpamDetector, SPAM_DETECTION_CONFIGS } from '~/lib/spam-detector';

const spamDetector = createSpamDetector(kv, SPAM_DETECTION_CONFIGS.moderate);
const result = await spamDetector.detectSpam({
  email: 'user@example.com',
  name: 'John Doe',
  message: 'Congratulations!',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});
```

### Indonesian Context

- Indonesian spam keywords (e.g., "duit gratis", "investasi bodong")
- Indonesian email provider typo correction
- Local suspicious domain patterns

---

## Error Handling

### Standardized Response Format

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "error": {
    "type": "ERROR_TYPE",
    "message": string,
    "details": any,
    "field": string,
    "code": string,
    "timestamp": string,
    "requestId": string
  },
  "timestamp": string,
  "requestId": string
}
```

### Error Types

- `VALIDATION_ERROR`: Input validation failures
- `DATABASE_ERROR`: Database operation failures
- `RATE_LIMIT_ERROR`: Rate limit exceeded
- `AUTHENTICATION_ERROR`: Authentication required
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND_ERROR`: Resource not found
- `CONFLICT_ERROR`: Resource conflicts
- `SPAM_DETECTED_ERROR`: Content flagged as spam
- `INTERNAL_SERVER_ERROR`: Unexpected server errors

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request / Validation Error
- `401`: Authentication Required
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `429`: Rate Limit Exceeded
- `500`: Internal Server Error
- `503`: Service Unavailable

---

## Validation Schemas

### RSVP Validation

```typescript
const RsvpSchema = z.object({
  guest_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  attending: z.enum(['both', 'akad', 'reception', 'unable']),
  plus_one_count: z.number().int().min(0).max(5),
  plus_one_name: z.string().max(100).optional(),
  meal_preference: z.enum(['chicken', 'beef', 'fish', 'vegetarian', 'vegan']).optional(),
  plus_one_meal: z.enum(['chicken', 'beef', 'fish', 'vegetarian', 'vegan']).optional(),
  accommodation_needed: z.boolean().default(false),
  special_requests: z.string().max(500).optional(),
  dietary_restrictions: z.string().max(300).optional()
});
```

### Wishes Validation

```typescript
const GuestWishSchema = z.object({
  guest_name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  message: z.string().min(10).max(1000)
});
```

### Indonesian-Specific Validation

- **Phone Numbers**: Indonesian mobile and landline patterns
- **Email Domains**: Common Indonesian provider typo correction
- **Name Validation**: Support for Indonesian characters

---

## Testing Endpoints

### API Test Suite

#### GET `/api/test?action=status`
Get available test types and usage information.

#### POST `/api/test?type={testType}`
Run specific test scenarios:

- `rsvp`: Test RSVP submission
- `wishes`: Test wish submission
- `rate-limit`: Test rate limiting
- `spam-detection`: Test spam detection
- `validation`: Test input validation

#### GET `/api/test?action=health`
Check system health and database connectivity.

### Example Usage

```bash
# Test RSVP functionality
curl -X POST "https://your-domain.com/api/test?type=rsvp"

# Test spam detection
curl -X POST "https://your-domain.com/api/test?type=spam-detection"

# Check system health
curl "https://your-domain.com/api/test?action=health"
```

---

## Configuration

### Environment Variables

```bash
# Database
DB=your-d1-database
KV_RATE_LIMIT=your-kv-namespace

# Email Service
RESEND_API_KEY=your-resend-api-key
ADMIN_EMAIL=admin@yourdomain.com

# Application
ENVIRONMENT=production
AUTH_SECRET=your-auth-secret
```

### Service Configuration

```typescript
// RSVP Service Configuration
const rsvpConfig = {
  enableRateLimiting: true,
  enableSpamDetection: true,
  autoConfirmRsvps: true,
  maxPlusOnes: 5,
  enableEmailNotifications: true
};

// Wishes Service Configuration
const wishesConfig = {
  enableRateLimiting: true,
  enableSpamDetection: true,
  autoApproveWishes: true,
  enableModeration: true,
  maxMessageLength: 1000,
  minMessageLength: 10,
  enableEmailNotifications: true
};
```

### Spam Detection Configuration

```typescript
const spamConfig = {
  blockThreshold: 80,
  moderateThreshold: 50,
  keywordWeight: 30,
  frequencyWeight: 25,
  patternWeight: 20,
  emailWeight: 15,
  behaviorWeight: 10,
  enableKeywordDetection: true,
  enableFrequencyDetection: true,
  enablePatternDetection: true,
  enableEmailValidation: true,
  enableBehaviorAnalysis: true
};
```

---

## Performance Considerations

### Free Tier Optimization

- **Rate Limiting**: Efficient KV-based rate limiting to stay within limits
- **Database Queries**: Optimized queries with proper indexing
- **Caching**: KV storage for frequently accessed data
- **Request Size**: Limited request payloads to reduce bandwidth
- **Batch Operations**: Efficient batch processing where possible

### Monitoring

- Request ID tracking for debugging
- Comprehensive error logging
- Performance metrics collection
- Rate limit monitoring
- Spam detection effectiveness tracking

---

## Security Features

### Input Validation

- Comprehensive Zod schema validation
- Input sanitization and normalization
- SQL injection prevention
- XSS protection

### Rate Limiting

- Distributed rate limiting using KV storage
- Multiple rate limit strategies (IP, email, endpoint)
- Configurable limits and windows
- Graceful degradation on failures

### Spam Detection

- Multi-layer detection system
- Machine learning-ready architecture
- Configurable sensitivity levels
- Automatic content moderation

### Data Protection

- Email normalization for privacy
- IP address logging for security
- Secure error messages
- Request tracking for audit trails

---

## Next Steps (Week 3)

1. **Email Integration**: Complete email service integration
2. **Admin Dashboard**: Build comprehensive admin interface
3. **Analytics**: Implement usage analytics and reporting
4. **Performance Monitoring**: Add detailed performance metrics
5. **Security Hardening**: Additional security measures and audits

---

## Support

For issues or questions regarding the Week 2 APIs:

1. Check the test endpoints for system status
2. Review error logs with request IDs
3. Consult this documentation for proper usage
4. Test with the provided test suite before deployment