import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env } from '../../../../lib/database';
import { generateSessionId, generateQRCode, getSessionUrl } from '../../../../lib/session-utils';

// GET /api/admin/sessions - List all sessions
export const onGet: RequestHandler = async ({ json, platform }) => {
  try {
    const db = getDatabase(platform.env as Env);
    const sessions = await db.getAllSessions();

    throw json(200, {
      success: true,
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      success: false,
      error: 'Failed to fetch sessions',
    });
  }
};

// POST /api/admin/sessions - Create new session
export const onPost: RequestHandler = async ({ request, json, platform, url }) => {
  try {
    const body = await request.json();
    const { title, description, is_active = true, prefix = 'wdng' } = body;

    if (!title) {
      throw json(400, {
        success: false,
        error: 'Title is required',
      });
    }

    // Generate unique session ID
    const sessionId = generateSessionId(prefix);

    // Generate QR code
    const baseUrl = `${url.protocol}//${url.host}`;
    const sessionUrl = getSessionUrl(sessionId, baseUrl);
    const qrCodeUrl = await generateQRCode(sessionUrl);

    const db = getDatabase(platform.env as Env);
    const session = await db.createSession({
      session_id: sessionId,
      title,
      description,
      is_active,
      qr_code_url: qrCodeUrl,
    });

    throw json(201, {
      success: true,
      session,
      share_url: sessionUrl,
      qr_code: qrCodeUrl,
    });
  } catch (error) {
    console.error('Failed to create session:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      success: false,
      error: 'Failed to create session',
    });
  }
};
