import { WeddingDatabase, type RsvpData, type Env, DatabaseError, ValidationError } from '../lib/database';
import { validateRsvpData, sanitizeRsvpData, validateIndonesianPhone } from '../lib/validators';
import { RateLimiters } from '../lib/rate-limiter';
import { createSpamDetector, SPAM_DETECTION_CONFIGS } from '../lib/spam-detector';

export interface RsvpServiceConfig {
  enableRateLimiting: boolean;
  enableSpamDetection: boolean;
  autoConfirmRsvps: boolean;
  maxPlusOnes: number;
  enableEmailNotifications: boolean;
}

export interface RsvpSubmissionResult {
  success: boolean;
  rsvp?: RsvpData;
  isUpdate: boolean;
  message: string;
  rateLimitInfo?: {
    limit: number;
    remaining: number;
    resetTime: number;
  };
  spamInfo?: {
    score: number;
    isSpam: boolean;
    shouldBlock: boolean;
    shouldModerate: boolean;
    reasons: string[];
  };
}

export interface RsvpStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  attendingBoth: number;
  attendingAkad: number;
  attendingReception: number;
  plusOnes: number;
  accommodationNeeded: number;
  mealPreferences: Record<string, number>;
}

export class RsvpService {
  private db: WeddingDatabase;
  private env: Env;
  private config: RsvpServiceConfig;

  constructor(env: Env, config?: Partial<RsvpServiceConfig>) {
    this.db = new WeddingDatabase(env.DB);
    this.env = env;
    this.config = {
      enableRateLimiting: true,
      enableSpamDetection: true,
      autoConfirmRsvps: true,
      maxPlusOnes: 5,
      enableEmailNotifications: true,
      ...config
    };

    // Initialize rate limiters
    if (this.config.enableRateLimiting) {
      RateLimiters.initialize(env.KV_RATE_LIMIT);
    }
  }

  // Submit or update RSVP
  async submitRsvp(data: {
    guest_name: string;
    email: string;
    phone?: string;
    attending: 'both' | 'akad' | 'reception' | 'unable';
    plus_one_count: number;
    plus_one_name?: string;
    meal_preference?: 'chicken' | 'beef' | 'fish' | 'vegetarian' | 'vegan';
    plus_one_meal?: 'chicken' | 'beef' | 'fish' | 'vegetarian' | 'vegan';
    accommodation_needed: boolean;
    special_requests?: string;
    dietary_restrictions?: string;
  }, metadata: {
    ipAddress: string;
    userAgent: string;
  }): Promise<RsvpSubmissionResult> {
    try {
      // Rate limiting check
      let rateLimitInfo;
      if (this.config.enableRateLimiting) {
        // Check email-based rate limiting (1 per hour)
        const emailLimiter = RateLimiters.getRsvpLimiter();
        const emailResult = await emailLimiter.checkLimit(data.email);
        
        if (!emailResult.allowed) {
          return {
            success: false,
            isUpdate: false,
            message: `Rate limit exceeded for email ${data.email}. Please try again in ${emailResult.retryAfter} seconds.`,
            rateLimitInfo: {
              limit: emailResult.limit,
              remaining: emailResult.remaining,
              resetTime: emailResult.resetTime
            }
          };
        }

        // Check IP-based rate limiting (3 per hour)
        const ipLimiter = RateLimiters.getRsvpIpLimiter();
        const ipResult = await ipLimiter.checkLimit(metadata.ipAddress);
        
        if (!ipResult.allowed) {
          return {
            success: false,
            isUpdate: false,
            message: `Too many RSVP attempts from your location. Please try again in ${ipResult.retryAfter} seconds.`,
            rateLimitInfo: {
              limit: ipResult.limit,
              remaining: ipResult.remaining,
              resetTime: ipResult.resetTime
            }
          };
        }

        rateLimitInfo = {
          limit: emailResult.limit,
          remaining: emailResult.remaining,
          resetTime: emailResult.resetTime
        };
      }

      // Spam detection
      let spamInfo;
      if (this.config.enableSpamDetection) {
        const spamDetector = createSpamDetector(this.env.KV_RATE_LIMIT, SPAM_DETECTION_CONFIGS.moderate);
        const spamResult = await spamDetector.detectSpam({
          email: data.email,
          name: data.guest_name,
          message: `${data.guest_name} ${data.special_requests || ''} ${data.dietary_restrictions || ''}`,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          phone: data.phone
        });

        spamInfo = {
          score: spamResult.score,
          isSpam: spamResult.isSpam,
          shouldBlock: spamResult.shouldBlock,
          shouldModerate: spamResult.shouldModerate,
          reasons: spamResult.reasons
        };

        if (spamResult.shouldBlock) {
          return {
            success: false,
            isUpdate: false,
            message: 'RSVP submission blocked due to suspicious activity.',
            spamInfo
          };
        }

        // Record submission for frequency analysis
        await spamDetector.recordSubmission(metadata.ipAddress, data.email);
      }

      // Sanitize and validate data
      const sanitizedData = sanitizeRsvpData(data);
      const validation = validateRsvpData(sanitizedData);
      
      if (!validation.success) {
        return {
          success: false,
          isUpdate: false,
          message: 'Validation failed. Please check your input.',
          rateLimitInfo,
          spamInfo
        };
      }

      const validData = validation.data;

      // Additional validations
      if (validData.phone && !validateIndonesianPhone(validData.phone)) {
        return {
          success: false,
          isUpdate: false,
          message: 'Please enter a valid Indonesian phone number.',
          rateLimitInfo,
          spamInfo
        };
      }

      if (validData.plus_one_count > this.config.maxPlusOnes) {
        return {
          success: false,
          isUpdate: false,
          message: `Maximum ${this.config.maxPlusOnes} plus ones allowed.`,
          rateLimitInfo,
          spamInfo
        };
      }

      if (validData.plus_one_count > 0 && !validData.plus_one_name) {
        return {
          success: false,
          isUpdate: false,
          message: 'Please provide the name of your plus one.',
          rateLimitInfo,
          spamInfo
        };
      }

      // Prepare RSVP data
      const rsvpData: Omit<RsvpData, 'id' | 'created_at' | 'updated_at'> = {
        ...validData,
        ip_address: metadata.ipAddress,
        user_agent: metadata.userAgent
      };

      // Check if RSVP already exists
      const existingRsvp = await this.db.getRsvpByEmail(validData.email);
      let result: RsvpData;
      let isUpdate = false;

      if (existingRsvp) {
        // Update existing RSVP
        result = await this.db.updateRsvp(existingRsvp.id!, rsvpData);
        isUpdate = true;
      } else {
        // Create new RSVP
        result = await this.db.createRsvp(rsvpData);
      }

      // Send email notifications
      if (this.config.enableEmailNotifications && this.env.RESEND_API_KEY) {
        try {
          const { createEmailService } = await import('../lib/email');
          const emailService = createEmailService(this.env.RESEND_API_KEY);

          // Send confirmation email to guest
          const confirmationResult = await emailService.sendRsvpConfirmation(result);
          if (!confirmationResult.success) {
            console.error('Failed to send confirmation email:', confirmationResult.error);
          }

          // Send admin notification
          const adminEmail = this.env.ADMIN_EMAIL || 'admin@alfinamugni.wedding';
          const adminResult = await emailService.sendAdminNotification(result, adminEmail);
          if (!adminResult.success) {
            console.error('Failed to send admin notification:', adminResult.error);
          }

        } catch (emailError) {
          console.error('Email service error:', emailError);
        }
      }

      return {
        success: true,
        rsvp: result,
        isUpdate,
        message: isUpdate
          ? 'RSVP berhasil diperbarui! Email konfirmasi telah dikirim.'
          : 'RSVP berhasil dikirim! Email konfirmasi telah dikirim.',
        rateLimitInfo,
        spamInfo
      };

    } catch (error) {
      console.error('RSVP submission error:', error);
      
      if (error instanceof ValidationError) {
        return {
          success: false,
          isUpdate: false,
          message: error.message
        };
      }

      if (error instanceof DatabaseError) {
        return {
          success: false,
          isUpdate: false,
          message: 'Unable to process your RSVP at this time. Please try again later.'
        };
      }

      return {
        success: false,
        isUpdate: false,
        message: 'Terjadi kesalahan server. Silakan coba lagi atau hubungi admin.'
      };
    }
  }

  // Get RSVP by email
  async getRsvpByEmail(email: string): Promise<RsvpData | null> {
    try {
      return await this.db.getRsvpByEmail(email);
    } catch (error) {
      console.error('Error retrieving RSVP by email:', error);
      throw new DatabaseError('Failed to retrieve RSVP', 'getRsvpByEmail', error as Error);
    }
  }

  // Get RSVP by ID
  async getRsvpById(id: number): Promise<RsvpData | null> {
    try {
      return await this.db.getRsvpById(id);
    } catch (error) {
      console.error('Error retrieving RSVP by ID:', error);
      throw new DatabaseError('Failed to retrieve RSVP', 'getRsvpById', error as Error);
    }
  }

  // Get all RSVPs with pagination
  async getAllRsvps(options: {
    limit?: number;
    offset?: number;
    status?: 'all' | 'confirmed' | 'declined' | 'pending';
    attending?: 'both' | 'akad' | 'reception' | 'unable';
  } = {}): Promise<{ rsvps: RsvpData[]; total: number }> {
    try {
      const { limit = 50, offset = 0, status = 'all', attending } = options;
      
      // Get all RSVPs (we'll filter in memory for now, could be optimized with SQL)
      const allRsvps = await this.db.getAllRsvps(limit * 2, offset); // Get more for filtering
      
      let filteredRsvps = allRsvps;
      
      // Filter by status
      if (status !== 'all') {
        filteredRsvps = filteredRsvps.filter(rsvp => {
          switch (status) {
            case 'confirmed':
              return rsvp.attending !== 'unable';
            case 'declined':
              return rsvp.attending === 'unable';
            case 'pending':
              return false; // All RSVPs are auto-confirmed in this implementation
            default:
              return true;
          }
        });
      }

      // Filter by attending
      if (attending && attending !== 'unable') {
        filteredRsvps = filteredRsvps.filter(rsvp => 
          rsvp.attending === attending || rsvp.attending === 'both'
        );
      }

      // Apply pagination
      const paginatedRsvps = filteredRsvps.slice(offset, offset + limit);

      return {
        rsvps: paginatedRsvps,
        total: filteredRsvps.length
      };

    } catch (error) {
      console.error('Error retrieving RSVPs:', error);
      throw new DatabaseError('Failed to retrieve RSVPs', 'getAllRsvps', error as Error);
    }
  }

  // Update RSVP status
  async updateRsvpStatus(id: number, status: 'confirmed' | 'declined' | 'pending'): Promise<RsvpData> {
    try {
      const updates: Partial<RsvpData> = {};
      
      // In this implementation, we use the 'attending' field to determine status
      switch (status) {
        case 'confirmed':
          // Don't change attending field, just ensure it's not 'unable'
          break;
        case 'declined':
          updates.attending = 'unable';
          break;
        case 'pending':
          // Could add a status field to the schema if needed
          break;
      }

      return await this.db.updateRsvp(id, updates);

    } catch (error) {
      console.error('Error updating RSVP status:', error);
      throw new DatabaseError('Failed to update RSVP status', 'updateRsvpStatus', error as Error);
    }
  }

  // Delete RSVP
  async deleteRsvp(): Promise<void> {
    try {
      // This would need to be implemented in the database class
      // For now, we'll throw an error to indicate it's not implemented
      throw new DatabaseError('Delete RSVP not implemented', 'deleteRsvp');

    } catch (error) {
      console.error('Error deleting RSVP:', error);
      throw new DatabaseError('Failed to delete RSVP', 'deleteRsvp', error as Error);
    }
  }

  // Get RSVP statistics
  async getRsvpStats(): Promise<RsvpStats> {
    try {
      const allRsvps = await this.db.getAllRsvps();
      
      const stats: RsvpStats = {
        total: allRsvps.length,
        confirmed: allRsvps.filter(r => r.attending !== 'unable').length,
        declined: allRsvps.filter(r => r.attending === 'unable').length,
        pending: 0, // All are auto-confirmed in this implementation
        attendingBoth: allRsvps.filter(r => r.attending === 'both').length,
        attendingAkad: allRsvps.filter(r => r.attending === 'akad' || r.attending === 'both').length,
        attendingReception: allRsvps.filter(r => r.attending === 'reception' || r.attending === 'both').length,
        plusOnes: allRsvps.reduce((sum, r) => sum + r.plus_one_count, 0),
        accommodationNeeded: allRsvps.filter(r => r.accommodation_needed).length,
        mealPreferences: {
          chicken: allRsvps.filter(r => r.meal_preference === 'chicken').length,
          beef: allRsvps.filter(r => r.meal_preference === 'beef').length,
          fish: allRsvps.filter(r => r.meal_preference === 'fish').length,
          vegetarian: allRsvps.filter(r => r.meal_preference === 'vegetarian').length,
          vegan: allRsvps.filter(r => r.meal_preference === 'vegan').length
        }
      };

      return stats;

    } catch (error) {
      console.error('Error getting RSVP stats:', error);
      throw new DatabaseError('Failed to get RSVP statistics', 'getRsvpStats', error as Error);
    }
  }

  // Export RSVPs to CSV format
  async exportRsvps(): Promise<string> {
    try {
      const allRsvps = await this.db.getAllRsvps();
      
      const headers = [
        'ID', 'Guest Name', 'Email', 'Phone', 'Attending', 'Plus Ones',
        'Plus One Name', 'Meal Preference', 'Plus One Meal', 'Accommodation',
        'Special Requests', 'Dietary Restrictions', 'Created At', 'Updated At'
      ];

      const csvRows = [
        headers.join(','),
        ...allRsvps.map(rsvp => [
          rsvp.id,
          `"${rsvp.guest_name}"`,
          `"${rsvp.email}"`,
          `"${rsvp.phone || ''}"`,
          rsvp.attending,
          rsvp.plus_one_count,
          `"${rsvp.plus_one_name || ''}"`,
          rsvp.meal_preference || '',
          rsvp.plus_one_meal || '',
          rsvp.accommodation_needed,
          `"${rsvp.special_requests || ''}"`,
          `"${rsvp.dietary_restrictions || ''}"`,
          rsvp.created_at || '',
          rsvp.updated_at || ''
        ].join(','))
      ];

      return csvRows.join('\n');

    } catch (error) {
      console.error('Error exporting RSVPs:', error);
      throw new DatabaseError('Failed to export RSVPs', 'exportRsvps', error as Error);
    }
  }
}

// Factory function to create RSVP service
export function createRsvpService(env: Env, config?: Partial<RsvpServiceConfig>): RsvpService {
  return new RsvpService(env, config);
}