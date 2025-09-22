import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env, type GuestWish, DatabaseError, ValidationError } from '../../../lib/database';
import { validateGuestWish, sanitizeWishData, moderateContent } from '../../../lib/validators';
import { createEmailService } from '../../../lib/email';

// Rate limiting store (in-memory for development, use KV storage in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration for wishes (more lenient than RSVP)
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_ATTEMPTS = 5; // 5 wishes submissions per hour per IP

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = `wishes:${ip}`;
  const current = rateLimitStore.get(key);

  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (current.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  rateLimitStore.set(key, { count: current.count + 1, resetTime: current.resetTime });
  return { allowed: true };
}

// Submit guest wish
export const onPost: RequestHandler = async ({ request, json, platform }) => {
  try {
    // Get client information
    const clientIP = request.headers.get('CF-Connecting-IP') ||
                    request.headers.get('X-Forwarded-For') ||
                    request.headers.get('X-Real-IP') ||
                    'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    // Check rate limiting
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
      throw new Response(JSON.stringify({
        error: 'Too many wish submissions',
        success: false,
        message: `Rate limit exceeded. Please try again in ${rateCheck.retryAfter} seconds.`,
        retryAfter: rateCheck.retryAfter
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': rateCheck.retryAfter!.toString()
        }
      });
    }

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

    // Sanitize and moderate input data
    const sanitizedData = sanitizeWishData(formData as Record<string, unknown>);

    // Validate with Zod schema
    const validation = validateGuestWish(sanitizedData);
    if (!validation.success) {
      const errors = validation.error.issues.map((err: { path: (string | number | symbol)[]; message: string }) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      throw json(400, {
        error: 'Validation failed',
        success: false,
        message: 'Please check your input and try again',
        details: errors
      });
    }

    const validData = validation.data;

    // Additional content moderation
    const moderation = moderateContent(validData.message);
    if (!moderation.isAppropriate) {
      throw json(400, {
        error: 'Content flagged',
        success: false,
        message: 'Your message contains inappropriate content. Please revise and try again.',
        reasons: moderation.reasons
      });
    }

    // Get database instance
    const db = getDatabase(platform.env as Env);

    // Check auto-approval settings
    const autoApproveWishes = await db.getSetting('auto_approve_wishes') === 'true';
    const shouldAutoApprove = autoApproveWishes && moderation.isAppropriate && !moderation.containsSpam;

    // Prepare wish data with metadata
    const wishData: Omit<GuestWish, 'id' | 'created_at' | 'updated_at'> = {
      guest_name: validData.guest_name,
      email: validData.email,
      message: moderation.moderatedText,
      approved: shouldAutoApprove,
      ip_address: clientIP,
      user_agent: userAgent
    };

    // Create new wish
    const result = await db.createGuestWish(wishData);

    // Send admin notification if not auto-approved and email is configured
    if ((platform.env as Env).RESEND_API_KEY && !shouldAutoApprove) {
      try {
        const emailService = createEmailService((platform.env as Env).RESEND_API_KEY);
        const adminEmail = (platform.env as Env).ADMIN_EMAIL || 'admin@alfinamugni.wedding';

        // Send moderation notification for manual review
        await emailService.sendWishModerationNotification(result, adminEmail);

      } catch (emailError) {
        console.error('Failed to send wish moderation email:', emailError);
        // Continue without failing the wish submission
      }
    }

    // Log successful submission
    console.log('Guest wish submission:', {
      id: result.id,
      guest: result.guest_name,
      approved: result.approved,
      ip: clientIP
    });

    throw json(200, {
      success: true,
      message: shouldAutoApprove
        ? 'Terima kasih atas ucapan baik Anda! Pesan akan tampil di website.'
        : 'Terima kasih atas ucapan baik Anda! Pesan sedang direview dan akan tampil setelah disetujui.',
      data: {
        id: result.id,
        guest_name: result.guest_name,
        message: result.message,
        approved: result.approved,
        created_at: result.created_at
      }
    });

  } catch (error) {
    console.error('Guest wish submission error:', error);

    // If error is already a JSON response, re-throw it
    if (error instanceof Response) {
      throw error;
    }

    // Handle specific error types
    if (error instanceof ValidationError) {
      throw json(400, {
        error: 'Validation error',
        success: false,
        message: error.message,
        field: error.field
      });
    }

    if (error instanceof DatabaseError) {
      throw json(500, {
        error: 'Database error',
        success: false,
        message: 'Unable to process your wish at this time. Please try again later.',
        operation: error.operation
      });
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi atau hubungi admin.'
    });
  }
};

// Get approved wishes (public endpoint)
export const onGet: RequestHandler = async ({ request, json, platform }) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Validate parameters
    if (limit < 1 || limit > 100) {
      throw json(400, {
        error: 'Invalid limit',
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    if (offset < 0) {
      throw json(400, {
        error: 'Invalid offset',
        success: false,
        message: 'Offset must be non-negative'
      });
    }

    const db = getDatabase(platform.env as Env);

    // Get only approved wishes for public display
    const wishes = await db.getApprovedWishes();

    // Return public wish data (no sensitive info)
    const publicWishes = wishes.map(wish => ({
      id: wish.id,
      guest_name: wish.guest_name,
      message: wish.message,
      created_at: wish.created_at
    }));

    throw json(200, {
      success: true,
      data: publicWishes,
      pagination: {
        limit,
        offset,
        count: publicWishes.length
      }
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