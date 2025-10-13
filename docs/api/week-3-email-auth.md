# Week 3: Email Integration and Admin Authentication

## Overview

Week 3 implementation focuses on comprehensive email integration with Resend and secure admin authentication system. This includes email templates, queue management, session handling, and security features.

## Email Service Implementation

### Core Features

- **Resend Integration**: Full integration with Resend API for email delivery
- **Email Queue System**: Batch processing to stay within free tier limits (3K emails/month)
- **Delivery Tracking**: Monitor email delivery status and handle failures
- **Template System**: Responsive, wedding-themed email templates in Indonesian and English
- **Rate Limiting**: Automatic queue management when approaching free tier limits

### Email Templates

#### 1. RSVP Confirmation
- **Trigger**: Immediate upon RSVP submission
- **Content**: Confirmation details, wedding information, attendance status
- **Features**: Mobile-responsive, Indonesian/English support

#### 2. Admin Notifications
- **Trigger**: New RSVP submission, wish requiring moderation
- **Content**: Detailed submission information, quick action links
- **Features**: Admin dashboard integration, moderation links

#### 3. RSVP Reminders
- **One Week Reminder**: Scheduled 7 days before wedding
- **Day-Before Reminder**: Scheduled 24 hours before wedding
- **Content**: Event details, timing, location, dress code

#### 4. Admin Summaries
- **Daily Summary**: RSVP and wish statistics for the day
- **Weekly Summary**: Comprehensive weekly statistics
- **Features**: Charts, quick actions, trend analysis

### Email Queue Management

```typescript
// Queue status monitoring
const queueStatus = emailService.getQueueStatus();
// Returns: { pending, scheduled, monthlyCount, limitRemaining }

// Process queued emails
const result = await emailService.processEmailQueue();
// Returns: { processed, failed, errors }
```

### Free Tier Compliance

- **Monthly Limit**: 3,000 emails (Resend free tier)
- **Estimated Usage**: ~520 emails for 200 guests
- **Buffer**: 83% margin for safety
- **Monitoring**: Real-time limit tracking and queue management

## Admin Authentication System

### Security Features

- **bcryptjs Password Hashing**: Secure password storage with salt rounds
- **Session Management**: KV-based session storage with expiration
- **CSRF Protection**: Token-based CSRF protection for all admin actions
- **Rate Limiting**: Account lockout after failed attempts
- **Secure Cookies**: HttpOnly, Secure, SameSite=Strict

### Authentication Flow

1. **Login**: POST `/api/auth/login`
   - Email/password validation
   - Rate limiting and lockout protection
   - Session creation and CSRF token generation

2. **Session Validation**: GET `/api/auth/login`
   - Session validity check
   - Activity timestamp update
   - CSRF token refresh

3. **Logout**: POST/GET `/api/auth/logout`
   - Session invalidation
   - Cookie cleanup
   - CSRF token removal

### Session Management

```typescript
// Session structure
interface AdminSession {
  id: string;
  adminId: string;
  email: string;
  loginTime: number;
  lastActivity: number;
  expiresAt: number;
}

// Session duration: 24 hours
// Automatic extension on activity
// Secure cookie handling
```

### Security Headers

- **Content Security Policy**: Prevent XSS attacks
- **X-Frame-Options**: Prevent clickjacking
- **X-Content-Type-Options**: Prevent MIME sniffing
- **Referrer Policy**: Control referrer information

## API Integration

### RSVP API Integration

```typescript
// Automatic email sending on RSVP submission
const result = await rsvpService.submitRsvp(data, context);

// Email integration
- Immediate confirmation email to guest
- Admin notification for new RSVP
- Reminder scheduling (1 week, 1 day before)
- Error handling and queue management
```

### Wishes API Integration

```typescript
// Automatic moderation notifications
const result = await wishesService.submitWish(data, context);

// Email integration
- Admin notification for wishes requiring moderation
- Batch processing for efficiency
- Error handling and retry logic
```

## Email Testing

### Test Endpoints

#### POST `/api/test/email`
Test individual email templates:

```json
{
  "testType": "rsvp_confirmation|admin_notification|wish_moderation|reminder_one_week|reminder_day_before|admin_summary_daily|admin_summary_weekly|all_templates",
  "email": "test@example.com"
}
```

#### GET `/api/test/email`
Get email service status:

```json
{
  "emailService": {
    "queueStatus": { "pending": 0, "scheduled": 2, "monthlyCount": 45, "limitRemaining": 2955 },
    "configured": true
  },
  "services": {
    "rsvp": { "total": 50, "attending": 40, "unable": 10 },
    "wishes": { "total": 30, "approved": 25, "pending": 3, "rejected": 2 }
  }
}
```

### Test Coverage

- ✅ All email templates
- ✅ Queue functionality
- ✅ Free tier limits
- ✅ Error handling
- ✅ Integration with APIs
- ✅ Session management
- ✅ CSRF protection

## Configuration

### Environment Variables

```bash
# Email Configuration
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@example.com

# Authentication
ADMIN_PASSWORD_HASH=$2b$10$... (bcryptjs hash)
AUTH_SECRET=your_auth_secret

# KV Storage
ADMIN_KV=your_kv_namespace
```

### Database Schema Updates

No schema changes required for Week 3. Uses existing:
- `rsvps` table for email data
- `guest_wishes` table for moderation
- KV namespace for sessions

## Security Considerations

### Email Security

- **Input Validation**: All email inputs validated and sanitized
- **Rate Limiting**: Prevent email spam and abuse
- **Error Handling**: Graceful failure without information leakage
- **Template Security**: XSS prevention in email templates

### Authentication Security

- **Password Security**: bcryptjs with 12 salt rounds
- **Session Security**: Secure session tokens with expiration
- **CSRF Protection**: Token-based CSRF protection
- **Account Lockout**: 15-minute lockout after 5 failed attempts

### Data Privacy

- **Email Privacy**: GDPR-compliant email handling
- **Session Privacy**: Minimal session data storage
- **Cookie Security**: Secure, HttpOnly cookies
- **Log Security**: No sensitive data in logs

## Performance Optimization

### Email Performance

- **Queue Processing**: Batch processing for efficiency
- **Free Tier Management**: Intelligent queue management
- **Error Recovery**: Automatic retry with exponential backoff
- **Template Caching**: Pre-compiled email templates

### Authentication Performance

- **Session Caching**: KV-based session storage
- **Fast Validation**: Efficient session validation
- **Minimal Database**: Reduced database queries
- **Cookie Optimization**: Efficient cookie handling

## Monitoring and Analytics

### Email Metrics

- **Delivery Rates**: Track email delivery success
- **Queue Status**: Monitor queue length and processing
- **Free Tier Usage**: Real-time limit tracking
- **Error Rates**: Monitor and alert on failures

### Authentication Metrics

- **Login Attempts**: Track successful/failed logins
- **Session Duration**: Monitor session lifetimes
- **Security Events**: Track lockouts and suspicious activity
- **Performance**: Monitor authentication response times

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check RESEND_API_KEY configuration
   - Verify free tier limits
   - Check queue status

2. **Authentication Failures**
   - Verify ADMIN_PASSWORD_HASH
   - Check KV namespace configuration
   - Review session logs

3. **Queue Processing Issues**
   - Monitor queue status
   - Check error logs
   - Verify free tier compliance

### Debug Tools

- Email test endpoints for template validation
- Session validation endpoints
- Queue status monitoring
- Comprehensive error logging

## Next Steps (Week 4)

Week 4 will focus on:
- Admin dashboard development
- Protected route middleware
- Admin error pages
- Security headers implementation
- Email unsubscribe functionality
- Password reset features

## Summary

Week 3 successfully implemented:

✅ **Complete email service** with Resend integration
✅ **6 email templates** with responsive design
✅ **Queue management** for free tier compliance
✅ **Secure authentication** with bcryptjs
✅ **Session management** with KV storage
✅ **CSRF protection** and rate limiting
✅ **Email testing** endpoints
✅ **API integration** for RSVP and wishes
✅ **Security features** and error handling
✅ **Free tier optimization** and monitoring

The system is now ready for admin dashboard development in Week 4, with a solid foundation of email communication and secure authentication.