import type { RequestHandler } from '@builder.io/qwik-city'
import { createAuth } from '~/lib/auth'
import { getEnv } from '~/lib/env'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const onPost: RequestHandler = async ({
  request,
  platform,
  cookie,
  json,
}) => {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = signInSchema.safeParse(body)

    if (!validation.success) {
      return json(400, {
        success: false,
        error: 'Valid email and password are required',
      })
    }

    const { email, password } = validation.data

    // Get environment
    const env = getEnv(platform?.env)

    // Create auth instance
    const auth = createAuth(env)

    // Authenticate user
    const authResult = await auth.authenticate(email, password)

    if (!authResult.success) {
      const statusCode = authResult.lockoutTime ? 423 : 401

      return json(statusCode, {
        success: false,
        error: authResult.error || 'Authentication failed',
        remainingAttempts: authResult.remainingAttempts,
        lockoutTime: authResult.lockoutTime,
      })
    }

    if (!authResult.session) {
      return json(500, {
        success: false,
        error: 'Session creation failed',
      })
    }

    // Set secure session cookie
    const isProduction = env.ENVIRONMENT === 'production'

    cookie.set('admin_session', authResult.session.id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Strict',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
      expires: new Date(authResult.session.expiresAt),
    })

    // Generate and store CSRF token
    const csrfToken = auth.generateCSRFToken()
    await auth.storeCSRFToken(authResult.session.id, csrfToken)

    // Set CSRF token cookie
    cookie.set('csrf_token', csrfToken, {
      secure: isProduction,
      sameSite: 'Strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour
      httpOnly: false,
    })

    // Return success
    return json(200, {
      success: true,
      message: 'Authentication successful',
    })
  } catch (error) {
    console.error('Login API error:', error)
    return json(500, {
      success: false,
      error: 'Login failed. Please try again.',
    })
  }
}
