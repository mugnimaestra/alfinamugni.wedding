import { QwikAuth$ } from '@auth/qwik';
import Credentials from '@auth/core/providers/credentials';
import type { Provider } from '@auth/core/providers';
import type { JWT } from '@auth/core/jwt';
import type { Session, User as DefaultUser } from '@auth/core/types';
import bcrypt from 'bcryptjs';

// Extend the User interface to include custom properties for the wedding website admin
interface WeddingUser extends DefaultUser {
  role?: string;
}

// Extend the Session interface to include custom properties for the wedding website admin
interface WeddingSession extends Session {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

// Enhanced password verification with bcrypt
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Check if the stored password is already hashed (starts with $2a$, $2b$, etc.)
    if (hashedPassword.startsWith('$2')) {
      return await bcrypt.compare(password, hashedPassword);
    } else {
      // For development/migration - fallback to plain text comparison
      // This should be removed in production
      console.warn('Warning: Using plain text password comparison. Please use hashed passwords in production.');
      return password === hashedPassword;
    }
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Enhanced admin credentials management
function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL || 'admin@alfinamugni.wedding';
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  // If no hash is provided, generate one for development
  if (!passwordHash && process.env.NODE_ENV !== 'production') {
    console.warn('No ADMIN_PASSWORD_HASH found. Using default development password.');
    // Default development password: wedding2025!
    // In production, set ADMIN_PASSWORD_HASH to: bcrypt.hashSync('your-secure-password', 12)
    return {
      email,
      passwordHash: '$2b$12$rQZO8K7bXGDjqBQYeVsOFuKnHfB3l6UOFOFb1A6YFXl0kJL0kqkk6', // wedding2025!
      name: 'Wedding Admin',
      role: 'admin'
    };
  }

  if (!passwordHash && process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD_HASH environment variable is required in production');
  }

  return {
    email,
    passwordHash: passwordHash || '',
    name: 'Wedding Admin',
    role: 'admin'
  };
}

// Rate limiting for authentication attempts
const authAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_AUTH_ATTEMPTS = 5;
const AUTH_LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function checkAuthRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = `auth:${ip}`;
  const current = authAttempts.get(key);

  if (!current) {
    authAttempts.set(key, { count: 1, resetTime: now + AUTH_LOCKOUT_TIME });
    return { allowed: true };
  }

  if (now > current.resetTime) {
    authAttempts.set(key, { count: 1, resetTime: now + AUTH_LOCKOUT_TIME });
    return { allowed: true };
  }

  if (current.count >= MAX_AUTH_ATTEMPTS) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  authAttempts.set(key, { count: current.count + 1, resetTime: current.resetTime });
  return { allowed: true };
}

function recordFailedAuth(ip: string): void {
  const now = Date.now();
  const key = `auth:${ip}`;
  const current = authAttempts.get(key);

  if (current) {
    authAttempts.set(key, { count: current.count + 1, resetTime: current.resetTime });
  } else {
    authAttempts.set(key, { count: 1, resetTime: now + AUTH_LOCKOUT_TIME });
  }
}

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  () => {
    return {
      providers: [
        Credentials({
          name: 'Wedding Admin Login',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
              placeholder: 'admin@alfinamugni.wedding'
            },
            password: {
              label: 'Password',
              type: 'password'
            },
          },
          async authorize(credentials, req) {
            // Get client IP for rate limiting
            const clientIP = req.headers?.get?.('cf-connecting-ip') ||
                            req.headers?.get?.('x-forwarded-for') ||
                            req.headers?.get?.('x-real-ip') ||
                            'unknown';

            // Check rate limiting
            const rateCheck = checkAuthRateLimit(clientIP);
            if (!rateCheck.allowed) {
              console.warn(`Authentication rate limit exceeded for IP: ${clientIP}`);
              return null;
            }

            if (!credentials?.email || !credentials?.password) {
              console.error('Missing credentials');
              recordFailedAuth(clientIP);
              return null;
            }

            const adminCredentials = getAdminCredentials();

            // Verify email (case insensitive)
            const emailMatch = (credentials.email as string).toLowerCase() === adminCredentials.email.toLowerCase();

            if (!emailMatch) {
              console.error('Invalid email for:', credentials.email);
              recordFailedAuth(clientIP);
              return null;
            }

            // Verify password with bcrypt
            try {
              const passwordValid = await verifyPassword(credentials.password as string, adminCredentials.passwordHash);

              if (passwordValid) {
                console.log('Authentication successful for:', credentials.email);
                // Clear failed attempts on successful login
                authAttempts.delete(`auth:${clientIP}`);

                return {
                  id: '1',
                  name: adminCredentials.name,
                  email: adminCredentials.email,
                  role: adminCredentials.role,
                };
              } else {
                console.error('Invalid password for:', credentials.email);
                recordFailedAuth(clientIP);
                return null;
              }
            } catch (error) {
              console.error('Authentication error:', error);
              recordFailedAuth(clientIP);
              return null;
            }
          },
        }),
      ] as Provider[],
      callbacks: {
        jwt({ token, user }: { token: JWT; user?: WeddingUser | null }) {
          if (user && 'role' in user) {
            token.role = user.role;
          }
          return token;
        },
        session({ session, token }: { session: Session; token: JWT }) {
          // Cast session to WeddingSession to access the custom role property
          const weddingSession = session as WeddingSession;
          if (token.role && weddingSession.user) {
            weddingSession.user.role = token.role as string;
          }
          return weddingSession;
        },
      },
      pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
      },
      session: {
        strategy: 'jwt',
        maxAge: 8 * 60 * 60, // 8 hours for admin sessions
        updateAge: 60 * 60,  // Update session every hour
      },
      jwt: {
        maxAge: 8 * 60 * 60, // 8 hours
        // Additional JWT security
        secret: process.env.AUTH_SECRET || (() => {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('AUTH_SECRET environment variable is required in production');
          }
          return 'wedding-site-secret-key-development-only-32chars';
        })(),
      },
      secret: process.env.AUTH_SECRET || (() => {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('AUTH_SECRET environment variable is required in production');
        }
        return 'wedding-site-secret-key-development-only-32chars';
      })(),
      // Enhanced security configurations
      useSecureCookies: process.env.NODE_ENV === 'production',
      cookies: {
        sessionToken: {
          name: process.env.NODE_ENV === 'production'
            ? `__Secure-wedding-auth.session-token`
            : `wedding-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: 'strict', // Enhanced CSRF protection
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 8 * 60 * 60, // 8 hours
          }
        },
        csrfToken: {
          name: process.env.NODE_ENV === 'production'
            ? `__Host-wedding-auth.csrf-token`
            : `wedding-auth.csrf-token`,
          options: {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
          }
        },
      },
      // Additional security headers
      trustHost: true,
      debug: process.env.NODE_ENV !== 'production',
    };
  }
);