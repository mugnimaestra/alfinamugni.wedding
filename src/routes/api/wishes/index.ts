import type { RequestHandler } from '@builder.io/qwik-city';
import { type Env } from '../../../lib/database';
import { createWishesService } from '../../../services/wishes-service';
import { createEmailService } from '../../../lib/email';

// Submit guest wish with enhanced validation, rate limiting, and spam detection
export const onPost: RequestHandler = async ({ request, json, platform }) => {
  try {
    // Get client information
    const clientIP = request.headers.get('CF-Connecting-IP') ||
                    request.headers.get('X-Forwarded-For') ||
                    request.headers.get('X-Real-IP') ||
                    'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    // Parse and validate content-type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw json(400, {
        error: 'Invalid content-type',
        success: false,
        message: 'Request must be application/json'
      });
    }

    // Parse request body with size limit
    let formData: unknown;
    try {
      const rawBody = await request.text();
      if (rawBody.length > 5000) { // 5KB limit for wishes
        throw new Error('Request body too large');
      }
      formData = JSON.parse(rawBody);
    } catch {
      throw json(400, {
        error: 'Invalid JSON',
        success: false,
        message: 'Request body must be valid JSON'
      });
    }

    // Create wishes service
    const wishesService = createWishesService(platform.env as Env);

    // Submit wish
    const result = await wishesService.submitWish(formData as {
      guest_name: string;
      email?: string;
      message: string;
    }, {
      ipAddress: clientIP,
      userAgent: userAgent
    });

    // Send admin notification if wish requires moderation
    const emailInfo: { adminNotificationSent?: boolean; emailErrors?: string[] } = {};
    
    if (result.success && result.wish && result.requiresModeration) {
      try {
        // Create email service
        const emailService = createEmailService(platform.env.RESEND_API_KEY);
        
        const emailErrors: string[] = [];
        
        // Send admin notification for wish moderation
        try {
          const adminEmail = platform.env.ADMIN_EMAIL || 'admin@alfinamugni.wedding';
          const adminResult = await emailService.sendWishModerationNotification(result.wish, adminEmail);
          emailInfo.adminNotificationSent = adminResult.success;
          if (!adminResult.success) {
            emailErrors.push(`Admin notification failed: ${adminResult.error}`);
          }
        } catch (error) {
          emailErrors.push(`Admin notification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        if (emailErrors.length > 0) {
          emailInfo.emailErrors = emailErrors;
          console.warn('Email sending warnings:', emailErrors);
        }
        
      } catch (error) {
        console.error('Email service error:', error);
        emailInfo.emailErrors = [`Email service error: ${error instanceof Error ? error.message : 'Unknown error'}`];
      }
    }

    // Create response with rate limit headers if available
    const statusCode = result.success ? 200 : (result.rateLimitInfo ? 429 : 400);
    const responseData = {
      success: result.success,
      message: result.message,
      data: result.wish ? {
        id: result.wish.id,
        guest_name: result.wish.guest_name,
        message: result.wish.message,
        approved: result.wish.approved,
        created_at: result.wish.created_at
      } : undefined,
      autoApproved: result.autoApproved,
      requiresModeration: result.requiresModeration,
      spamInfo: result.spamInfo,
      emailInfo: emailInfo.adminNotificationSent !== undefined ? {
        adminNotificationSent: emailInfo.adminNotificationSent,
        emailErrors: emailInfo.emailErrors
      } : undefined
    };

    if (result.rateLimitInfo) {
      const response = new Response(JSON.stringify(responseData), {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.rateLimitInfo.limit.toString(),
          'X-RateLimit-Remaining': result.rateLimitInfo.remaining.toString(),
          'X-RateLimit-Reset': result.rateLimitInfo.resetTime.toString()
        }
      });
      throw response;
    }

    throw json(statusCode, responseData);

  } catch (error) {
    console.error('Guest wish submission error:', error);

    // If error is already a Response, re-throw it
    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi atau hubungi admin.'
    });
  }
};

// Get approved wishes (public endpoint) with pagination
export const onGet: RequestHandler = async ({ request, json, platform }) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const featured = url.searchParams.get('featured') === 'true';

    // Create wishes service
    const wishesService = createWishesService(platform.env as Env);

    // Get approved wishes
    const result = await wishesService.getApprovedWishes({
      limit,
      offset,
      featured
    });

    throw json(200, {
      success: true,
      data: result.wishes,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Guest wishes retrieval error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Unable to load wishes at this time'
    });
  }
};