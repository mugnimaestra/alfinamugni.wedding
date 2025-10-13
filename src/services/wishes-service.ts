import { WeddingDatabase, type GuestWish, type Env, DatabaseError, ValidationError } from '../lib/database';
import { validateGuestWish, sanitizeWishData, moderateContent } from '../lib/validators';
import { RateLimiters } from '../lib/rate-limiter';
import { createSpamDetector, SPAM_DETECTION_CONFIGS } from '../lib/spam-detector';

export interface WishesServiceConfig {
  enableRateLimiting: boolean;
  enableSpamDetection: boolean;
  autoApproveWishes: boolean;
  enableModeration: boolean;
  maxMessageLength: number;
  minMessageLength: number;
  enableEmailNotifications: boolean;
}

export interface WishSubmissionResult {
  success: boolean;
  wish?: GuestWish;
  message: string;
  autoApproved: boolean;
  requiresModeration: boolean;
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

export interface WishesListResult {
  wishes: Array<{
    id: number;
    guest_name: string;
    message: string;
    created_at: string;
  }>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface WishModerationResult {
  success: boolean;
  wish?: GuestWish;
  message: string;
}

export class WishesService {
  private db: WeddingDatabase;
  private env: Env;
  private config: WishesServiceConfig;

  constructor(env: Env, config?: Partial<WishesServiceConfig>) {
    this.db = new WeddingDatabase(env.DB);
    this.env = env;
    this.config = {
      enableRateLimiting: true,
      enableSpamDetection: true,
      autoApproveWishes: true,
      enableModeration: true,
      maxMessageLength: 1000,
      minMessageLength: 10,
      enableEmailNotifications: true,
      ...config
    };

    // Initialize rate limiters
    if (this.config.enableRateLimiting) {
      RateLimiters.initialize(env.KV_RATE_LIMIT);
    }
  }

  // Submit a new wish
  async submitWish(data: {
    guest_name: string;
    email?: string;
    message: string;
  }, metadata: {
    ipAddress: string;
    userAgent: string;
  }): Promise<WishSubmissionResult> {
    try {
      // Rate limiting check
      let rateLimitInfo;
      if (this.config.enableRateLimiting) {
        const wishesLimiter = RateLimiters.getWishesLimiter();
        const rateResult = await wishesLimiter.checkLimit(metadata.ipAddress);
        
        if (!rateResult.allowed) {
          return {
            success: false,
            message: `Too many wish submissions. Please try again in ${rateResult.retryAfter} seconds.`,
            autoApproved: false,
            requiresModeration: false,
            rateLimitInfo: {
              limit: rateResult.limit,
              remaining: rateResult.remaining,
              resetTime: rateResult.resetTime
            }
          };
        }

        rateLimitInfo = {
          limit: rateResult.limit,
          remaining: rateResult.remaining,
          resetTime: rateResult.resetTime
        };
      }

      // Spam detection
      let spamInfo;
      if (this.config.enableSpamDetection) {
        const spamDetector = createSpamDetector(this.env.KV_RATE_LIMIT, SPAM_DETECTION_CONFIGS.moderate);
        const spamResult = await spamDetector.detectSpam({
          email: data.email,
          name: data.guest_name,
          message: data.message,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent
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
            message: 'Wish submission blocked due to suspicious content.',
            autoApproved: false,
            requiresModeration: false,
            rateLimitInfo,
            spamInfo
          };
        }

        // Record submission for frequency analysis
        await spamDetector.recordSubmission(metadata.ipAddress, data.email);
      }

      // Validate message length
      if (data.message.length < this.config.minMessageLength) {
        return {
          success: false,
          message: `Message must be at least ${this.config.minMessageLength} characters long.`,
          autoApproved: false,
          requiresModeration: false,
          rateLimitInfo,
          spamInfo
        };
      }

      if (data.message.length > this.config.maxMessageLength) {
        return {
          success: false,
          message: `Message must not exceed ${this.config.maxMessageLength} characters.`,
          autoApproved: false,
          requiresModeration: false,
          rateLimitInfo,
          spamInfo
        };
      }

      // Sanitize and moderate content
      const sanitizedData = sanitizeWishData(data);
      const validation = validateGuestWish(sanitizedData);
      
      if (!validation.success) {
        return {
          success: false,
          message: 'Invalid wish data. Please check your input.',
          autoApproved: false,
          requiresModeration: false,
          rateLimitInfo,
          spamInfo
        };
      }

      const validData = validation.data;

      // Additional content moderation
      const moderation = moderateContent(validData.message);
      if (!moderation.isAppropriate) {
        return {
          success: false,
          message: 'Your message contains inappropriate content. Please revise and try again.',
          autoApproved: false,
          requiresModeration: false,
          rateLimitInfo,
          spamInfo
        };
      }

      // Determine if wish should be auto-approved
      const autoApprove = this.config.autoApproveWishes && 
                         moderation.isAppropriate && 
                         !moderation.containsSpam &&
                         (!spamInfo || !spamInfo.shouldModerate);

      // Prepare wish data
      const wishData: Omit<GuestWish, 'id' | 'created_at'> = {
        guest_name: validData.guest_name,
        email: validData.email,
        message: moderation.moderatedText,
        approved: autoApprove,
        ip_address: metadata.ipAddress,
        user_agent: metadata.userAgent
      };

      // Create wish
      const result = await this.db.createGuestWish(wishData);

      // Send admin notification if not auto-approved
      if (!autoApprove && this.config.enableEmailNotifications && this.env.RESEND_API_KEY) {
        try {
          const { createEmailService } = await import('../lib/email');
          const emailService = createEmailService(this.env.RESEND_API_KEY);
          const adminEmail = this.env.ADMIN_EMAIL || 'admin@alfinamugni.wedding';

          await emailService.sendWishModerationNotification(result, adminEmail);
        } catch (emailError) {
          console.error('Failed to send wish moderation email:', emailError);
        }
      }

      return {
        success: true,
        wish: result,
        message: autoApprove
          ? 'Terima kasih atas ucapan baik Anda! Pesan akan tampil di website.'
          : 'Terima kasih atas ucapan baik Anda! Pesan sedang direview dan akan tampil setelah disetujui.',
        autoApproved: autoApprove,
        requiresModeration: !autoApprove,
        rateLimitInfo,
        spamInfo
      };

    } catch (error) {
      console.error('Wish submission error:', error);
      
      if (error instanceof ValidationError) {
        return {
          success: false,
          message: error.message,
          autoApproved: false,
          requiresModeration: false
        };
      }

      if (error instanceof DatabaseError) {
        return {
          success: false,
          message: 'Unable to process your wish at this time. Please try again later.',
          autoApproved: false,
          requiresModeration: false
        };
      }

      return {
        success: false,
        message: 'Terjadi kesalahan server. Silakan coba lagi atau hubungi admin.',
        autoApproved: false,
        requiresModeration: false
      };
    }
  }

  // Get approved wishes for public display
  async getApprovedWishes(options: {
    limit?: number;
    offset?: number;
    featured?: boolean;
  } = {}): Promise<WishesListResult> {
    try {
      const { limit = 50, offset = 0, featured = false } = options;
      
      // Validate parameters
      if (limit < 1 || limit > 100) {
        throw new ValidationError('Limit must be between 1 and 100', 'limit');
      }

      if (offset < 0) {
        throw new ValidationError('Offset must be non-negative', 'offset');
      }

      // Get approved wishes from database
      const allWishes = await this.db.getApprovedWishes();
      
      // Filter by featured if requested
      let filteredWishes = allWishes;
      if (featured) {
        // This would require adding a 'featured' field to the wishes table
        // For now, we'll return all approved wishes
        filteredWishes = allWishes;
      }

      // Apply pagination
      const startIndex = offset;
      const endIndex = startIndex + limit;
      const paginatedWishes = filteredWishes.slice(startIndex, endIndex);

      // Transform to public format
      const publicWishes = paginatedWishes.map(wish => ({
        id: wish.id!,
        guest_name: wish.guest_name,
        message: wish.message,
        created_at: wish.created_at!
      }));

      return {
        wishes: publicWishes,
        pagination: {
          limit,
          offset,
          total: filteredWishes.length,
          hasMore: endIndex < filteredWishes.length
        }
      };

    } catch (error) {
      console.error('Error retrieving approved wishes:', error);
      
      if (error instanceof ValidationError) {
        throw error;
      }

      throw new DatabaseError('Failed to retrieve wishes', 'getApprovedWishes', error as Error);
    }
  }

  // Get all wishes (for admin)
  async getAllWishes(options: {
    limit?: number;
    offset?: number;
    status?: 'all' | 'approved' | 'pending' | 'rejected';
  } = {}): Promise<{ wishes: GuestWish[]; total: number }> {
    try {
      const { limit = 50, offset = 0, status = 'all' } = options;
      
      // Get all wishes
      const allWishes = await this.db.getAllWishes();
      
      // Filter by status
      let filteredWishes = allWishes;
      switch (status) {
        case 'approved':
          filteredWishes = allWishes.filter(wish => wish.approved);
          break;
        case 'pending':
          filteredWishes = allWishes.filter(wish => !wish.approved);
          break;
        case 'rejected':
          // This would require adding a 'rejected' status to the schema
          filteredWishes = [];
          break;
      }

      // Apply pagination
      const startIndex = offset;
      const endIndex = startIndex + limit;
      const paginatedWishes = filteredWishes.slice(startIndex, endIndex);

      return {
        wishes: paginatedWishes,
        total: filteredWishes.length
      };

    } catch (error) {
      console.error('Error retrieving all wishes:', error);
      throw new DatabaseError('Failed to retrieve wishes', 'getAllWishes', error as Error);
    }
  }

  // Approve a wish
  async approveWish(id: number): Promise<WishModerationResult> {
    try {
      const wish = await this.db.approveWish(id);
      
      return {
        success: true,
        wish,
        message: 'Wish approved successfully'
      };

    } catch (error) {
      console.error('Error approving wish:', error);
      
      return {
        success: false,
        message: 'Failed to approve wish'
      };
    }
  }

  // Reject a wish (delete)
  async rejectWish(): Promise<WishModerationResult> {
    try {
      // This would need to be implemented in the database class
      // For now, we'll return an error
      throw new DatabaseError('Reject wish not implemented', 'rejectWish');

    } catch (error) {
      console.error('Error rejecting wish:', error);
      
      return {
        success: false,
        message: 'Failed to reject wish'
      };
    }
  }

  // Get wish statistics
  async getWishStats(): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    recentActivity: number; // Wishes in last 24 hours
  }> {
    try {
      const allWishes = await this.db.getAllWishes();
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const stats = {
        total: allWishes.length,
        approved: allWishes.filter(w => w.approved).length,
        pending: allWishes.filter(w => !w.approved).length,
        rejected: 0, // Not implemented yet
        recentActivity: allWishes.filter(w => 
          w.created_at && new Date(w.created_at) > yesterday
        ).length
      };

      return stats;

    } catch (error) {
      console.error('Error getting wish stats:', error);
      throw new DatabaseError('Failed to get wish statistics', 'getWishStats', error as Error);
    }
  }

  // Export wishes to CSV format
  async exportWishes(): Promise<string> {
    try {
      const allWishes = await this.db.getAllWishes();
      
      const headers = [
        'ID', 'Guest Name', 'Email', 'Message', 'Approved', 'Created At',
        'IP Address', 'User Agent'
      ];

      const csvRows = [
        headers.join(','),
        ...allWishes.map(wish => [
          wish.id,
          `"${wish.guest_name}"`,
          `"${wish.email || ''}"`,
          `"${wish.message.replace(/"/g, '""')}"`, // Escape quotes
          wish.approved,
          wish.created_at || '',
          `"${wish.ip_address || ''}"`,
          `"${wish.user_agent || ''}"`
        ].join(','))
      ];

      return csvRows.join('\n');

    } catch (error) {
      console.error('Error exporting wishes:', error);
      throw new DatabaseError('Failed to export wishes', 'exportWishes', error as Error);
    }
  }

  // Search wishes
  async searchWishes(query: string, options: {
    limit?: number;
    offset?: number;
    approvedOnly?: boolean;
  } = {}): Promise<WishesListResult> {
    try {
      const { limit = 50, offset = 0, approvedOnly = true } = options;
      
      // Get wishes
      const wishes = approvedOnly 
        ? await this.db.getApprovedWishes()
        : await this.db.getAllWishes();
      
      // Simple text search
      const searchQuery = query.toLowerCase();
      const matchingWishes = wishes.filter(wish => 
        wish.guest_name.toLowerCase().includes(searchQuery) ||
        wish.message.toLowerCase().includes(searchQuery) ||
        (wish.email && wish.email.toLowerCase().includes(searchQuery))
      );

      // Apply pagination
      const startIndex = offset;
      const endIndex = startIndex + limit;
      const paginatedWishes = matchingWishes.slice(startIndex, endIndex);

      // Transform to public format
      const publicWishes = paginatedWishes.map(wish => ({
        id: wish.id!,
        guest_name: wish.guest_name,
        message: wish.message,
        created_at: wish.created_at!
      }));

      return {
        wishes: publicWishes,
        pagination: {
          limit,
          offset,
          total: matchingWishes.length,
          hasMore: endIndex < matchingWishes.length
        }
      };

    } catch (error) {
      console.error('Error searching wishes:', error);
      throw new DatabaseError('Failed to search wishes', 'searchWishes', error as Error);
    }
  }
}

// Factory function to create wishes service
export function createWishesService(env: Env, config?: Partial<WishesServiceConfig>): WishesService {
  return new WishesService(env, config);
}