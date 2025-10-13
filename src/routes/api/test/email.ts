import type { RequestHandler } from '@builder.io/qwik-city';
import { type Env } from '../../../lib/database';
import { createEmailService } from '../../../lib/email';
import { createRsvpService } from '../../../services/rsvp-service';
import { createWishesService } from '../../../services/wishes-service';

// Test email templates and functionality
export const onPost: RequestHandler = async ({ request, json, platform }) => {
  try {
    // Parse request body
    let testData: unknown;
    try {
      const rawBody = await request.text();
      if (rawBody.length > 5000) {
        throw new Error('Request body too large');
      }
      testData = JSON.parse(rawBody);
    } catch {
      throw json(400, {
        error: 'Invalid JSON',
        success: false,
        message: 'Request body must be valid JSON'
      });
    }

    const { testType, email } = testData as { testType?: string; email?: string };
    
    if (!testType) {
      throw json(400, {
        error: 'Test type is required',
        success: false,
        message: 'Please specify a test type'
      });
    }

    const emailService = createEmailService(platform.env.RESEND_API_KEY);
    const testEmail = email || 'test@example.com';
    const results: Array<{
      test: string;
      email?: string;
      result: Record<string, unknown>;
    }> = [];

    switch (testType) {
      case 'rsvp_confirmation': {
        // Create test RSVP data
        const testRsvp = {
          id: 999,
          guest_name: 'Test Guest',
          email: testEmail,
          phone: '+628123456789',
          attending: 'both' as const,
          plus_one_count: 1,
          plus_one_name: 'Test Plus One',
          meal_preference: 'chicken' as const,
          plus_one_meal: 'beef' as const,
          accommodation_needed: true,
          special_requests: 'Test special request',
          dietary_restrictions: 'Test dietary restriction',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ip_address: '127.0.0.1',
          user_agent: 'Test Agent'
        };

        const result = await emailService.sendRsvpConfirmation(testRsvp);
        results.push({
          test: 'RSVP Confirmation',
          email: testEmail,
          result
        });
        break;
      }

      case 'admin_notification': {
        // Create test RSVP data
        const testRsvp = {
          id: 999,
          guest_name: 'Test Guest',
          email: testEmail,
          phone: '+628123456789',
          attending: 'both' as const,
          plus_one_count: 1,
          plus_one_name: 'Test Plus One',
          meal_preference: 'chicken' as const,
          plus_one_meal: 'beef' as const,
          accommodation_needed: true,
          special_requests: 'Test special request',
          dietary_restrictions: 'Test dietary restriction',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ip_address: '127.0.0.1',
          user_agent: 'Test Agent'
        };

        const result = await emailService.sendAdminNotification(testRsvp, testEmail);
        results.push({
          test: 'Admin Notification',
          email: testEmail,
          result
        });
        break;
      }

      case 'wish_moderation': {
        // Create test wish data
        const testWish = {
          id: 999,
          guest_name: 'Test Guest',
          email: testEmail,
          message: 'This is a test wish that requires moderation. It contains some content that might need review.',
          approved: false,
          created_at: new Date().toISOString(),
          ip_address: '127.0.0.1',
          user_agent: 'Test Agent'
        };

        const result = await emailService.sendWishModerationNotification(testWish, testEmail);
        results.push({
          test: 'Wish Moderation',
          email: testEmail,
          result
        });
        break;
      }

      case 'reminder_one_week': {
        // Create test RSVP data
        const testRsvp = {
          id: 999,
          guest_name: 'Test Guest',
          email: testEmail,
          phone: '+628123456789',
          attending: 'both' as const,
          plus_one_count: 1,
          plus_one_name: 'Test Plus One',
          meal_preference: 'chicken' as const,
          plus_one_meal: 'beef' as const,
          accommodation_needed: true,
          special_requests: 'Test special request',
          dietary_restrictions: 'Test dietary restriction',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ip_address: '127.0.0.1',
          user_agent: 'Test Agent'
        };

        const result = await emailService.sendRsvpReminder(testRsvp, 'one_week');
        results.push({
          test: 'One Week Reminder',
          email: testEmail,
          result
        });
        break;
      }

      case 'reminder_day_before': {
        // Create test RSVP data
        const testRsvp = {
          id: 999,
          guest_name: 'Test Guest',
          email: testEmail,
          phone: '+628123456789',
          attending: 'both' as const,
          plus_one_count: 1,
          plus_one_name: 'Test Plus One',
          meal_preference: 'chicken' as const,
          plus_one_meal: 'beef' as const,
          accommodation_needed: true,
          special_requests: 'Test special request',
          dietary_restrictions: 'Test dietary restriction',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ip_address: '127.0.0.1',
          user_agent: 'Test Agent'
        };

        const result = await emailService.sendRsvpReminder(testRsvp, 'day_before');
        results.push({
          test: 'Day Before Reminder',
          email: testEmail,
          result
        });
        break;
      }

      case 'admin_summary_daily': {
        // Create test summary data
        const testSummary = {
          totalRsvps: 50,
          newRsvps: 5,
          attendingCount: 40,
          unableCount: 10,
          pendingWishes: 3,
          approvedWishes: 25,
          rejectedWishes: 2,
          period: 'daily' as const,
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endDate: new Date()
        };

        const result = await emailService.sendAdminSummary(testSummary, testEmail);
        results.push({
          test: 'Daily Admin Summary',
          email: testEmail,
          result
        });
        break;
      }

      case 'admin_summary_weekly': {
        // Create test summary data
        const testSummary = {
          totalRsvps: 150,
          newRsvps: 25,
          attendingCount: 120,
          unableCount: 30,
          pendingWishes: 8,
          approvedWishes: 100,
          rejectedWishes: 5,
          period: 'weekly' as const,
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        };

        const result = await emailService.sendAdminSummary(testSummary, testEmail);
        results.push({
          test: 'Weekly Admin Summary',
          email: testEmail,
          result
        });
        break;
      }

      case 'queue_status': {
        const queueStatus = emailService.getQueueStatus();
        results.push({
          test: 'Queue Status',
          result: queueStatus
        });
        break;
      }

      case 'process_queue': {
        const queueResult = await emailService.processEmailQueue();
        results.push({
          test: 'Process Queue',
          result: queueResult
        });
        break;
      }

      case 'all_templates': {
        // Test all email templates
        const testRsvp = {
          id: 999,
          guest_name: 'Test Guest',
          email: testEmail,
          phone: '+628123456789',
          attending: 'both' as const,
          plus_one_count: 1,
          plus_one_name: 'Test Plus One',
          meal_preference: 'chicken' as const,
          plus_one_meal: 'beef' as const,
          accommodation_needed: true,
          special_requests: 'Test special request',
          dietary_restrictions: 'Test dietary restriction',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ip_address: '127.0.0.1',
          user_agent: 'Test Agent'
        };

        const testWish = {
          id: 999,
          guest_name: 'Test Guest',
          email: testEmail,
          message: 'This is a test wish that requires moderation.',
          approved: false,
          created_at: new Date().toISOString(),
          ip_address: '127.0.0.1',
          user_agent: 'Test Agent'
        };

        const testSummary = {
          totalRsvps: 50,
          newRsvps: 5,
          attendingCount: 40,
          unableCount: 10,
          pendingWishes: 3,
          approvedWishes: 25,
          rejectedWishes: 2,
          period: 'daily' as const,
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endDate: new Date()
        };

        // Test all templates
        const rsvpResult = await emailService.sendRsvpConfirmation(testRsvp);
        results.push({ test: 'RSVP Confirmation', email: testEmail, result: rsvpResult });

        const adminResult = await emailService.sendAdminNotification(testRsvp, testEmail);
        results.push({ test: 'Admin Notification', email: testEmail, result: adminResult });

        const wishResult = await emailService.sendWishModerationNotification(testWish, testEmail);
        results.push({ test: 'Wish Moderation', email: testEmail, result: wishResult });

        const reminder1Result = await emailService.sendRsvpReminder(testRsvp, 'one_week');
        results.push({ test: 'One Week Reminder', email: testEmail, result: reminder1Result });

        const reminder2Result = await emailService.sendRsvpReminder(testRsvp, 'day_before');
        results.push({ test: 'Day Before Reminder', email: testEmail, result: reminder2Result });

        const summaryResult = await emailService.sendAdminSummary(testSummary, testEmail);
        results.push({ test: 'Admin Summary', email: testEmail, result: summaryResult });
        break;
      }

      default:
        throw json(400, {
          error: 'Invalid test type',
          success: false,
          message: `Unknown test type: ${testType}`
        });
    }

    throw json(200, {
      success: true,
      message: `Email test completed: ${testType}`,
      data: {
        testType,
        testEmail,
        results,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Email test error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
      message: 'Email test failed'
    });
  }
};

// Get email service status
export const onGet: RequestHandler = async ({ json, platform }) => {
  try {
    const emailService = createEmailService(platform.env.RESEND_API_KEY);
    const queueStatus = emailService.getQueueStatus();

    // Test database connections
    const rsvpService = createRsvpService(platform.env as Env);
    const wishesService = createWishesService(platform.env as Env);

    const [rsvpStats, wishStats] = await Promise.all([
      rsvpService.getRsvpStats().catch(() => ({ error: 'RSVP service unavailable' })),
      wishesService.getWishStats().catch(() => ({ error: 'Wishes service unavailable' }))
    ]);

    throw json(200, {
      success: true,
      data: {
        emailService: {
          queueStatus,
          configured: !!platform.env.RESEND_API_KEY
        },
        services: {
          rsvp: rsvpStats,
          wishes: wishStats
        },
        environment: {
          hasAdminEmail: !!platform.env.ADMIN_EMAIL,
          hasAdminPassword: !!platform.env.ADMIN_PASSWORD_HASH
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Email status error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false
    });
  }
};