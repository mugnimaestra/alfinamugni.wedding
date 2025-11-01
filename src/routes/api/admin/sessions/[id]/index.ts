import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env } from '../../../../../lib/database';

// GET /api/admin/sessions/:id - Get session by ID
export const onGet: RequestHandler = async ({ params, json, platform }) => {
  try {
    const sessionId = parseInt(params.id);

    if (isNaN(sessionId)) {
      throw json(400, {
        success: false,
        error: 'Invalid session ID',
      });
    }

    const db = getDatabase(platform.env as Env);
    const session = await db.getSessionById(sessionId);

    throw json(200, {
      success: true,
      session,
    });
  } catch (error) {
    console.error('Failed to fetch session:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      success: false,
      error: 'Failed to fetch session',
    });
  }
};

// PATCH /api/admin/sessions/:id - Update session
export const onPatch: RequestHandler = async ({ params, request, json, platform }) => {
  try {
    const sessionId = parseInt(params.id);

    if (isNaN(sessionId)) {
      throw json(400, {
        success: false,
        error: 'Invalid session ID',
      });
    }

    const body = await request.json();
    const { title, description, is_active } = body;

    const db = getDatabase(platform.env as Env);
    const session = await db.updateSession(sessionId, {
      title,
      description,
      is_active,
    });

    throw json(200, {
      success: true,
      session,
    });
  } catch (error) {
    console.error('Failed to update session:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      success: false,
      error: 'Failed to update session',
    });
  }
};
