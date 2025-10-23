import type { RequestHandler } from '@builder.io/qwik-city';
import { createAuth } from '../../../lib/auth';
import { getEnv } from '../../../lib/env';

// Admin login API endpoint
export const onPost: RequestHandler = async ({ request, json, cookie, platform }) => {
  try {
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
    let loginData: unknown;
    try {
      const rawBody = await request.text();
      if (rawBody.length > 1000) { // 1KB limit for login
        throw new Error('Request body too large');
      }
      loginData = JSON.parse(rawBody);
    } catch {
      throw json(400, {
        error: 'Invalid JSON',
        success: false,
        message: 'Request body must be valid JSON'
      });
    }

    // Validate login data
    const { email, password } = loginData as { email?: string; password?: string };
    
    if (!email || !password) {
      throw json(400, {
        error: 'Missing credentials',
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get environment (with fallback for Vite dev mode)
    const env = getEnv(platform?.env);

    // Create auth instance
    const auth = createAuth(env);

    // Authenticate user
    const authResult = await auth.authenticate(email, password);

    if (!authResult.success) {
      const statusCode = authResult.lockoutTime ? 423 : 401; // 423 = Locked
      
      throw json(statusCode, {
        error: authResult.error || 'Authentication failed',
        success: false,
        remainingAttempts: authResult.remainingAttempts,
        lockoutTime: authResult.lockoutTime
      });
    }

    if (!authResult.session) {
      throw json(500, {
        error: 'Session creation failed',
        success: false
      });
    }

    // Set secure session cookie
    cookie.set('admin_session', authResult.session.id, {
      httpOnly: true,
      secure: true, // Only send over HTTPS
      sameSite: 'Strict',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
      expires: new Date(authResult.session.expiresAt)
    });

    // Generate and store CSRF token
    const csrfToken = auth.generateCSRFToken();
    await auth.storeCSRFToken(authResult.session.id, csrfToken);

    // Set CSRF token cookie (not httpOnly so it can be read by JavaScript)
    cookie.set('csrf_token', csrfToken, {
      secure: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour
      httpOnly: false
    });

    // Return success response
    throw json(200, {
      success: true,
      message: 'Login successful',
      data: {
        session: {
          id: authResult.session.id,
          email: authResult.session.email,
          loginTime: authResult.session.loginTime,
          expiresAt: authResult.session.expiresAt
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    // If error is already a Response, re-throw it
    if (error instanceof Response) {
      throw error;
    }

    // Handle unexpected errors
    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// Get current session status
export const onGet: RequestHandler = async ({ cookie, json, platform }) => {
  try {
    const sessionId = cookie.get('admin_session')?.value;
    
    if (!sessionId) {
      throw json(401, {
        error: 'No session found',
        success: false,
        authenticated: false
      });
    }

    const env = getEnv(platform?.env);
    const auth = createAuth(env);
    const validation = await auth.validateSession(sessionId);

    if (!validation.valid) {
      // Clear invalid session cookie
      cookie.delete('admin_session', { path: '/' });
      cookie.delete('csrf_token', { path: '/' });

      throw json(401, {
        error: 'Invalid or expired session',
        success: false,
        authenticated: false
      });
    }

    const session = validation.session!;

    // Generate new CSRF token
    const csrfToken = auth.generateCSRFToken();
    await auth.storeCSRFToken(sessionId, csrfToken);

    // Update CSRF token cookie
    cookie.set('csrf_token', csrfToken, {
      secure: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour
      httpOnly: false
    });

    throw json(200, {
      success: true,
      authenticated: true,
      data: {
        session: {
          id: session.id,
          email: session.email,
          loginTime: session.loginTime,
          lastActivity: session.lastActivity,
          expiresAt: session.expiresAt
        },
        csrfToken
      }
    });

  } catch (error) {
    console.error('Session check error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      authenticated: false
    });
  }
};