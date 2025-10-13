import bcrypt from 'bcryptjs';
import type { Env } from './database';

// Session interface
export interface AdminSession {
  id: string;
  adminId: string;
  email: string;
  loginTime: number;
  lastActivity: number;
  expiresAt: number;
}

// Login attempt tracking
export interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// Authentication result
export interface AuthResult {
  success: boolean;
  session?: AdminSession;
  error?: string;
  requiresVerification?: boolean;
  remainingAttempts?: number;
  lockoutTime?: number;
}

// Session management class
export class AdminAuth {
  private env: Env;
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor(env: Env) {
    this.env = env;
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Check if account is locked
  private async isAccountLocked(email: string): Promise<{ locked: boolean; lockoutTime?: number; remainingTime?: number }> {
    try {
      const key = `login_attempt:${email.toLowerCase()}`;
      const attemptData = await this.env.ADMIN_KV.get<LoginAttempt>(key, 'json');
      
      if (!attemptData?.lockedUntil) {
        return { locked: false };
      }

      const now = Date.now();
      if (now < attemptData.lockedUntil) {
        return {
          locked: true,
          lockoutTime: attemptData.lockedUntil,
          remainingTime: Math.ceil((attemptData.lockedUntil - now) / 1000)
        };
      }

      // Lockout expired, clean up
      await this.env.ADMIN_KV.delete(key);
      return { locked: false };
    } catch (error) {
      console.error('Error checking account lock:', error);
      return { locked: false };
    }
  }

  // Record failed login attempt
  private async recordFailedAttempt(email: string): Promise<{ locked: boolean; remainingAttempts: number }> {
    try {
      const key = `login_attempt:${email.toLowerCase()}`;
      const now = Date.now();
      
      const existingAttempt = await this.env.ADMIN_KV.get<LoginAttempt>(key, 'json');
      
      let attempts = 1;
      if (existingAttempt && now - existingAttempt.lastAttempt < 60 * 60 * 1000) { // Within 1 hour
        attempts = existingAttempt.attempts + 1;
      }

      const loginAttempt: LoginAttempt = {
        email: email.toLowerCase(),
        attempts,
        lastAttempt: now
      };

      // Check if should lock account
      if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
        loginAttempt.lockedUntil = now + this.LOCKOUT_DURATION;
        
        await this.env.ADMIN_KV.put(key, JSON.stringify(loginAttempt), {
          expirationTtl: Math.ceil(this.LOCKOUT_DURATION / 1000)
        });

        return { locked: true, remainingAttempts: 0 };
      }

      await this.env.ADMIN_KV.put(key, JSON.stringify(loginAttempt), {
        expirationTtl: 3600 // 1 hour
      });

      return { locked: false, remainingAttempts: this.MAX_LOGIN_ATTEMPTS - attempts };
    } catch (error) {
      console.error('Error recording failed attempt:', error);
      return { locked: false, remainingAttempts: this.MAX_LOGIN_ATTEMPTS - 1 };
    }
  }

  // Clear failed login attempts on successful login
  private async clearFailedAttempts(email: string): Promise<void> {
    try {
      const key = `login_attempt:${email.toLowerCase()}`;
      await this.env.ADMIN_KV.delete(key);
    } catch (error) {
      console.error('Error clearing failed attempts:', error);
    }
  }

  // Authenticate admin
  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      // Check if account is locked
      const lockStatus = await this.isAccountLocked(email);
      if (lockStatus.locked) {
        return {
          success: false,
          error: `Account is locked. Try again in ${lockStatus.remainingTime} seconds.`,
          lockoutTime: lockStatus.lockoutTime
        };
      }

      // Get admin credentials from environment
      const adminEmail = this.env.ADMIN_EMAIL;
      const adminPasswordHash = this.env.ADMIN_PASSWORD_HASH;

      if (!adminEmail || !adminPasswordHash) {
        return {
          success: false,
          error: 'Admin credentials not configured'
        };
      }

      // Verify email (case-insensitive)
      if (email.toLowerCase() !== adminEmail.toLowerCase()) {
        const attemptResult = await this.recordFailedAttempt(email);
        return {
          success: false,
          error: 'Invalid credentials',
          remainingAttempts: attemptResult.remainingAttempts
        };
      }

      // Verify password
      const passwordValid = await this.verifyPassword(password, adminPasswordHash);
      if (!passwordValid) {
        const attemptResult = await this.recordFailedAttempt(email);
        return {
          success: false,
          error: 'Invalid credentials',
          remainingAttempts: attemptResult.remainingAttempts
        };
      }

      // Clear failed attempts on successful login
      await this.clearFailedAttempts(email);

      // Create session
      const session: AdminSession = {
        id: crypto.randomUUID(),
        adminId: 'admin',
        email: adminEmail,
        loginTime: Date.now(),
        lastActivity: Date.now(),
        expiresAt: Date.now() + this.SESSION_DURATION
      };

      // Store session
      await this.env.ADMIN_KV.put(`session:${session.id}`, JSON.stringify(session), {
        expirationTtl: Math.ceil(this.SESSION_DURATION / 1000)
      });

      return {
        success: true,
        session
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  // Validate session
  async validateSession(sessionId: string): Promise<{ valid: boolean; session?: AdminSession }> {
    try {
      if (!sessionId) {
        return { valid: false };
      }

      const sessionData = await this.env.ADMIN_KV.get(`session:${sessionId}`, 'json');
      if (!sessionData) {
        return { valid: false };
      }

      const session = sessionData as AdminSession;
      const now = Date.now();

      // Check if session expired
      if (now > session.expiresAt) {
        await this.env.ADMIN_KV.delete(`session:${sessionId}`);
        return { valid: false };
      }

      // Update last activity
      session.lastActivity = now;
      await this.env.ADMIN_KV.put(`session:${sessionId}`, JSON.stringify(session), {
        expirationTtl: Math.ceil((session.expiresAt - now) / 1000)
      });

      return { valid: true, session };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  // Logout
  async logout(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!sessionId) {
        return { success: false, error: 'No session provided' };
      }

      await this.env.ADMIN_KV.delete(`session:${sessionId}`);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }

  // Get all active sessions (for admin management)
  async getActiveSessions(): Promise<AdminSession[]> {
    try {
      const sessions: AdminSession[] = [];
      const list = await this.env.ADMIN_KV.list({ prefix: 'session:' });
      
      for (const key of list.keys) {
        const sessionData = await this.env.ADMIN_KV.get(key.name, 'json');
        if (sessionData) {
          const session = sessionData as AdminSession;
          const now = Date.now();
          
          if (now <= session.expiresAt) {
            sessions.push(session);
          } else {
            // Clean up expired session
            await this.env.ADMIN_KV.delete(key.name);
          }
        }
      }

      return sessions;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  // Extend session
  async extendSession(sessionId: string): Promise<{ success: boolean; session?: AdminSession }> {
    try {
      const validation = await this.validateSession(sessionId);
      if (!validation.valid || !validation.session) {
        return { success: false };
      }

      const session = validation.session;
      session.expiresAt = Date.now() + this.SESSION_DURATION;
      session.lastActivity = Date.now();

      await this.env.ADMIN_KV.put(`session:${sessionId}`, JSON.stringify(session), {
        expirationTtl: Math.ceil(this.SESSION_DURATION / 1000)
      });

      return { success: true, session };
    } catch (error) {
      console.error('Session extension error:', error);
      return { success: false };
    }
  }

  // Generate CSRF token
  generateCSRFToken(): string {
    return crypto.randomUUID();
  }

  // Validate CSRF token
  async validateCSRFToken(sessionId: string, token: string): Promise<boolean> {
    try {
      const storedToken = await this.env.ADMIN_KV.get(`csrf:${sessionId}`);
      return storedToken === token;
    } catch (error) {
      console.error('CSRF validation error:', error);
      return false;
    }
  }

  // Store CSRF token
  async storeCSRFToken(sessionId: string, token: string): Promise<void> {
    try {
      await this.env.ADMIN_KV.put(`csrf:${sessionId}`, token, {
        expirationTtl: 3600 // 1 hour
      });
    } catch (error) {
      console.error('CSRF token storage error:', error);
    }
  }
}

// Helper function to create auth instance
export function createAuth(env: Env): AdminAuth {
  return new AdminAuth(env);
}