import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env, DatabaseError } from '../../../../lib/database';

// Admin settings management
export const onGet: RequestHandler = async ({ json, platform }) => {
  try {
    // TODO: Add proper authentication check in Phase 2
    if ((platform.env as Env).ENVIRONMENT !== 'development') {
      throw json(401, {
        error: 'Unauthorized',
        success: false,
        message: 'Admin access required'
      });
    }

    const db = getDatabase(platform.env as Env);

    // Get all current settings
    const settings = {
      site_title: await db.getSetting('site_title') || 'Alfina & Mugni Wedding',
      site_description: await db.getSetting('site_description') || 'Join us in celebrating our special day',
      wedding_date: await db.getSetting('wedding_date') || '2025-11-29',
      venue: await db.getSetting('venue') || 'Jakarta, Indonesia',
      rsvp_deadline: await db.getSetting('rsvp_deadline') || '2025-11-15',
      max_guests_per_rsvp: await db.getSetting('max_guests_per_rsvp') || '5',
      auto_approve_wishes: await db.getSetting('auto_approve_wishes') || 'false',
      enable_photo_uploads: await db.getSetting('enable_photo_uploads') || 'true',
      maintenance_mode: await db.getSetting('maintenance_mode') || 'false',
      admin_email: await db.getSetting('admin_email') || 'admin@alfinamugni.wedding',
    };

    throw json(200, {
      success: true,
      data: settings,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Settings retrieval error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Unable to retrieve settings'
    });
  }
};

// Save admin settings
export const onPost: RequestHandler = async ({ request, json, platform }) => {
  try {
    // TODO: Add proper authentication check in Phase 2
    if ((platform.env as Env).ENVIRONMENT !== 'development') {
      throw json(401, {
        error: 'Unauthorized',
        success: false,
        message: 'Admin access required'
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

    // Parse request body
    let settings: Record<string, string>;
    try {
      const rawBody = await request.text();
      if (rawBody.length > 10000) { // 10KB limit for settings
        throw new Error('Request body too large');
      }
      settings = JSON.parse(rawBody);
    } catch {
      throw json(400, {
        error: 'Invalid JSON',
        success: false,
        message: 'Request body must be valid JSON'
      });
    }

    // Validate required fields and format
    const allowedSettings = [
      'site_title',
      'site_description',
      'wedding_date',
      'venue',
      'rsvp_deadline',
      'max_guests_per_rsvp',
      'auto_approve_wishes',
      'enable_photo_uploads',
      'maintenance_mode',
      'admin_email'
    ];

    const filteredSettings: Record<string, string> = {};

    for (const [key, value] of Object.entries(settings)) {
      if (allowedSettings.includes(key)) {
        // Basic validation and sanitization
        if (typeof value === 'string') {
          filteredSettings[key] = value.trim();
        } else {
          filteredSettings[key] = String(value).trim();
        }
      }
    }

    // Specific validations
    if (filteredSettings.admin_email && !filteredSettings.admin_email.includes('@')) {
      throw json(400, {
        error: 'Invalid email',
        success: false,
        message: 'Admin email must be a valid email address'
      });
    }

    if (filteredSettings.max_guests_per_rsvp) {
      const maxGuests = parseInt(filteredSettings.max_guests_per_rsvp);
      if (isNaN(maxGuests) || maxGuests < 1 || maxGuests > 20) {
        throw json(400, {
          error: 'Invalid max guests',
          success: false,
          message: 'Max guests per RSVP must be between 1 and 20'
        });
      }
    }

    // Date validations
    if (filteredSettings.wedding_date) {
      const weddingDate = new Date(filteredSettings.wedding_date);
      if (isNaN(weddingDate.getTime())) {
        throw json(400, {
          error: 'Invalid wedding date',
          success: false,
          message: 'Wedding date must be a valid date'
        });
      }
    }

    if (filteredSettings.rsvp_deadline) {
      const deadline = new Date(filteredSettings.rsvp_deadline);
      if (isNaN(deadline.getTime())) {
        throw json(400, {
          error: 'Invalid RSVP deadline',
          success: false,
          message: 'RSVP deadline must be a valid date'
        });
      }
    }

    const db = getDatabase(platform.env as Env);

    // Save all settings
    const updatedSettings: Record<string, string> = {};
    for (const [key, value] of Object.entries(filteredSettings)) {
      await db.setSetting(key, value);
      updatedSettings[key] = value;
    }

    // Log settings update for audit
    console.log('Settings updated:', {
      count: Object.keys(updatedSettings).length,
      keys: Object.keys(updatedSettings),
      timestamp: new Date().toISOString()
    });

    throw json(200, {
      success: true,
      message: 'Settings saved successfully',
      data: {
        updated: updatedSettings,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Settings save error:', error);

    if (error instanceof Response) {
      throw error;
    }

    if (error instanceof DatabaseError) {
      throw json(500, {
        error: 'Database error',
        success: false,
        message: 'Unable to save settings. Please try again later.',
        operation: error.operation
      });
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Unable to save settings'
    });
  }
};