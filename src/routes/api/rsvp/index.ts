import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env, type RsvpData, DatabaseError, ValidationError } from '../../../lib/database';
import { validateRsvpData, sanitizeRsvpData, validateIndonesianPhone } from '../../../lib/validators';

// Rate limiting store (in-memory for development, use KV storage in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_ATTEMPTS = 3; // 3 RSVP submissions per hour per IP

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = `rsvp:${ip}`;
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

// RSVP API endpoint with enhanced validation
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
      throw json(429, {
        error: 'Too many RSVP attempts',
        success: false,
        message: `Rate limit exceeded. Please try again in ${rateCheck.retryAfter} seconds.`,
        retryAfter: rateCheck.retryAfter
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
      if (rawBody.length > 10000) { // 10KB limit
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

    // Sanitize input data
    const sanitizedData = sanitizeRsvpData(formData as Record<string, unknown>);

    // Validate with Zod schema
    const validation = validateRsvpData(sanitizedData);
    if (!validation.success) {
      const errors = validation.error.issues.map((err: { path: (string | number | symbol)[]; message: string }) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      throw json(400, {
        error: 'Validation failed',
        success: false,
        message: 'Please check the form data and try again',
        details: errors
      });
    }

    const validData = validation.data;

    // Additional Indonesian-specific validation
    if (validData.phone && !validateIndonesianPhone(validData.phone)) {
      throw json(400, {
        error: 'Invalid phone number',
        success: false,
        message: 'Please enter a valid Indonesian phone number'
      });
    }

    // Validate plus one requirements
    if (validData.plus_one_count > 0 && !validData.plus_one_name) {
      throw json(400, {
        error: 'Plus one name required',
        success: false,
        message: 'Please provide the name of your plus one'
      });
    }

    // Validate meal preferences for plus ones
    if (validData.plus_one_count > 0 && validData.plus_one_meal && !validData.plus_one_name) {
      throw json(400, {
        error: 'Invalid plus one data',
        success: false,
        message: 'Plus one meal preference requires plus one name'
      });
    }

    // Get database instance
    const db = getDatabase(platform.env as Env);

    // Prepare RSVP data with metadata
    const rsvpData: Omit<RsvpData, 'id' | 'created_at' | 'updated_at'> = {
      ...validData,
      ip_address: clientIP,
      user_agent: userAgent
    };

    // Check if RSVP already exists
    const existingRsvp = await db.getRsvpByEmail(rsvpData.email);
    let result: RsvpData;
    let isUpdate = false;

    if (existingRsvp) {
      // Update existing RSVP
      result = await db.updateRsvp(existingRsvp.id!, rsvpData);
      isUpdate = true;
    } else {
      // Create new RSVP
      result = await db.createRsvp(rsvpData);
    }

    // Send confirmation email via Resend
    if ((platform.env as Env).RESEND_API_KEY) {
      try {
        const { createEmailService } = await import('../../../lib/email');
        const emailService = createEmailService((platform.env as Env).RESEND_API_KEY);

        // Send confirmation email to guest
        const confirmationResult = await emailService.sendRsvpConfirmation(result);
        if (!confirmationResult.success) {
          console.error('Failed to send confirmation email:', confirmationResult.error);
        }

        // Send admin notification (if admin email is configured)
        const adminEmail = (platform.env as Env).ADMIN_EMAIL || 'admin@alfinamugni.wedding';
        const adminResult = await emailService.sendAdminNotification(result, adminEmail);
        if (!adminResult.success) {
          console.error('Failed to send admin notification:', adminResult.error);
        }

        // Log email notifications
        console.log('Email notifications:', {
          rsvpId: result.id,
          confirmation: confirmationResult.success,
          admin: adminResult.success,
          isUpdate
        });

      } catch (emailError) {
        console.error('Email service error:', emailError);
        // Continue without failing the RSVP submission
      }
    }

    // Log successful submission
    console.log('RSVP submission successful:', {
      id: result.id,
      email: result.email,
      attending: result.attending,
      isUpdate,
      ip: clientIP
    });

    throw json(200, {
      success: true,
      message: isUpdate
        ? 'RSVP berhasil diperbarui! Email konfirmasi telah dikirim.'
        : 'RSVP berhasil dikirim! Email konfirmasi telah dikirim.',
      data: {
        id: result.id,
        guest_name: result.guest_name,
        email: result.email,
        attending: result.attending,
        plus_one_count: result.plus_one_count,
        created_at: result.created_at,
        updated_at: result.updated_at
      }
    });

  } catch (error) {
    console.error('RSVP submission error:', error);

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
        message: 'Unable to process your RSVP at this time. Please try again later.',
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

    const db = getDatabase(platform.env as Env);
    const rsvp = await db.getRsvpByEmail(email);

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