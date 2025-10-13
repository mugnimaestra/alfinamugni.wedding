import type { RequestHandler } from '@builder.io/qwik-city';
import { type Env } from '../../../lib/database';
import { createAuth } from '../../../lib/auth';

// Admin logout API endpoint
export const onPost: RequestHandler = async ({ cookie, json, platform }) => {
  try {
    const sessionId = cookie.get('admin_session')?.value;
    
    if (!sessionId) {
      throw json(400, {
        error: 'No active session',
        success: false,
        message: 'No active session to logout'
      });
    }

    const auth = createAuth(platform.env as Env);
    
    // Logout from auth system
    const logoutResult = await auth.logout(sessionId);
    
    if (!logoutResult.success) {
      console.warn('Logout warning:', logoutResult.error);
    }

    // Clear all auth-related cookies
    cookie.delete('admin_session', { path: '/' });
    cookie.delete('csrf_token', { path: '/' });

    throw json(200, {
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);

    // If error is already a Response, re-throw it
    if (error instanceof Response) {
      throw error;
    }

    // Handle unexpected errors
    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Logout failed. Please try again.'
    });
  }
};

// GET endpoint for logout (for navigation links)
export const onGet: RequestHandler = async ({ cookie, json, platform }) => {
  try {
    const sessionId = cookie.get('admin_session')?.value;
    
    if (sessionId) {
      const auth = createAuth(platform.env as Env);
      await auth.logout(sessionId);
    }

    // Clear all auth-related cookies
    cookie.delete('admin_session', { path: '/' });
    cookie.delete('csrf_token', { path: '/' });

    throw json(200, {
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Logout failed. Please try again.'
    });
  }
};