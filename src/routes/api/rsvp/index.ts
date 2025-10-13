import type { RequestHandler } from '@builder.io/qwik-city';
import { type Env } from '../../../lib/database';
import { createRsvpService } from '../../../services/rsvp-service';
import { createEmailService } from '../../../lib/email';

// RSVP API endpoint with enhanced validation, rate limiting, and spam detection
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
      const response = json(400, {
        error: 'Invalid content-type',
        success: false,
        message: 'Request must be application/json'
      });
      throw response;
    }

    // Parse request body with size limit
    let formData: unknown;
    try {
      const rawBody = await request.text();
      if (rawBody.length > 10000) { // 10KB limit
        throw new Error('Request body too large');
      }
      formData = JSON.parse(rawBody);
    } catch {
      const response = json(400, {
        error: 'Invalid JSON',
        success: false,
        message: 'Request body must be valid JSON'
      });
      throw response;
    }

    // Create RSVP service
    const rsvpService = createRsvpService(platform.env as Env);

    // Submit RSVP
    const result = await rsvpService.submitRsvp(formData as {
      guest_name: string;
      email: string;
      phone?: string;
      attending: 'both' | 'akad' | 'reception' | 'unable';
      plus_one_count: number;
      plus_one_name?: string;
      meal_preference?: 'chicken' | 'beef' | 'fish' | 'vegetarian' | 'vegan';
      plus_one_meal?: 'chicken' | 'beef' | 'fish' | 'vegetarian' | 'vegan';
      accommodation_needed: boolean;
      special_requests?: string;
      dietary_restrictions?: string;
    }, {
      ipAddress: clientIP,
      userAgent: userAgent
    });

    // Send emails if RSVP was successful
    const emailInfo: { confirmationSent?: boolean; adminNotificationSent?: boolean; emailErrors?: string[] } = {};
    
    if (result.success && result.rsvp) {
      try {
        // Create email service
        const emailService = createEmailService(platform.env.RESEND_API_KEY);
        
        const emailErrors: string[] = [];
        
        // Send confirmation email to guest
        try {
          const confirmationResult = await emailService.sendRsvpConfirmation(result.rsvp);
          emailInfo.confirmationSent = confirmationResult.success;
          if (!confirmationResult.success) {
            emailErrors.push(`Confirmation email failed: ${confirmationResult.error}`);
          }
        } catch (error) {
          emailErrors.push(`Confirmation email error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        // Send admin notification
        try {
          const adminEmail = platform.env.ADMIN_EMAIL || 'admin@alfinamugni.wedding';
          const adminResult = await emailService.sendAdminNotification(result.rsvp, adminEmail);
          emailInfo.adminNotificationSent = adminResult.success;
          if (!adminResult.success) {
            emailErrors.push(`Admin notification failed: ${adminResult.error}`);
          }
        } catch (error) {
          emailErrors.push(`Admin notification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        // Schedule reminder emails if attending
        if (result.rsvp.attending !== 'unable') {
          try {
            // Schedule 1-week reminder
            await emailService.sendRsvpReminder(result.rsvp, 'one_week');
            
            // Schedule day-before reminder
            await emailService.sendRsvpReminder(result.rsvp, 'day_before');
          } catch (error) {
            emailErrors.push(`Reminder scheduling error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
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
      data: result.rsvp ? {
        id: result.rsvp.id,
        guest_name: result.rsvp.guest_name,
        email: result.rsvp.email,
        attending: result.rsvp.attending,
        plus_one_count: result.rsvp.plus_one_count,
        created_at: result.rsvp.created_at,
        updated_at: result.rsvp.updated_at
      } : undefined,
      isUpdate: result.isUpdate,
      spamInfo: result.spamInfo,
      emailInfo: emailInfo.confirmationSent !== undefined || emailInfo.adminNotificationSent !== undefined ? {
        confirmationSent: emailInfo.confirmationSent,
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
    console.error('RSVP submission error:', error);

    // If error is already a Response, re-throw it
    if (error instanceof Response) {
      throw error;
    }

    // Handle unexpected errors
    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi atau hubungi admin.'
    });
  }
};

// Get RSVP by email (for checking existing RSVPs)
export const onGet: RequestHandler = async ({ request, json, platform }) => {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      throw json(400, {
        error: 'Email parameter is required',
        success: false
      });
    }

    const rsvpService = createRsvpService(platform.env as Env);
    const rsvp = await rsvpService.getRsvpByEmail(email);

    if (!rsvp) {
      throw json(404, {
        error: 'RSVP not found',
        success: false
      });
    }

    // Return public RSVP data (no sensitive info)
    throw json(200, {
      success: true,
      data: {
        id: rsvp.id,
        guest_name: rsvp.guest_name,
        email: rsvp.email,
        attending: rsvp.attending,
        plus_one_count: rsvp.plus_one_count,
        plus_one_name: rsvp.plus_one_name,
        meal_preference: rsvp.meal_preference,
        plus_one_meal: rsvp.plus_one_meal,
        accommodation_needed: rsvp.accommodation_needed,
        special_requests: rsvp.special_requests,
        dietary_restrictions: rsvp.dietary_restrictions,
        created_at: rsvp.created_at,
        updated_at: rsvp.updated_at
      }
    });

  } catch (error) {
    console.error('RSVP retrieval error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false
    });
  }
};